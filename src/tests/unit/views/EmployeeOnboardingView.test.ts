import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import EmployeeOnboardingView from '../../../views/employees/EmployeeOnboardingView.vue'
import { createEmployeeOnboarding } from '../../../api/employees'

const pushMock = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  RouterLink: {
    template: '<a><slot /></a>',
    props: ['to'],
  },
}))

vi.mock('../../../api/employees', () => ({
  createEmployeeOnboarding: vi.fn(),
}))

vi.mock('../../../utils/api', () => ({
  getBackendErrorMessage: vi.fn(() => 'Unable to create employee. Please review the form and try again.'),
}))

describe('EmployeeOnboardingView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  function mountView() {
    return mount(EmployeeOnboardingView, {
      global: {
        stubs: {
          AppShell: {
            template: '<main><slot /></main>',
          },
        },
      },
    })
  }

  async function fillRequiredEmployeeFields(wrapper: ReturnType<typeof mountView>) {
    await wrapper.find('#first-name').setValue('Marta')
    await wrapper.find('#last-name').setValue('Lopez')
    await wrapper.find('#email').setValue('marta@example.com')
    await wrapper.find('#password').setValue('Password123')
    await wrapper.find('#start-date').setValue('2026-05-12')
  }

  it('renders employee onboarding form sections', () => {
    const wrapper = mountView()

    expect(wrapper.text()).toContain('Employee information')
    expect(wrapper.text()).toContain('Contract information')
    expect(wrapper.find('#first-name').exists()).toBe(true)
    expect(wrapper.find('#weekly-hours').exists()).toBe(true)
    expect(wrapper.find('#start-date').exists()).toBe(true)
  })

  it('allows creating an employee with overnight fixed schedule', async () => {
    vi.mocked(createEmployeeOnboarding).mockResolvedValue({} as never)

    const wrapper = mountView()

    await fillRequiredEmployeeFields(wrapper)

    const fixedScheduleCheckbox = wrapper
      .findAll('input[type="checkbox"]')
      .find((input) => input.element.nextElementSibling?.textContent === 'Has fixed schedule')

    await fixedScheduleCheckbox?.setValue(true)
    await nextTick()

    await wrapper.find('#preferred-start-time').setValue('20:00')
    await wrapper.find('#preferred-end-time').setValue('04:00')

    await wrapper.get('form').trigger('submit.prevent')

    expect(createEmployeeOnboarding).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: 'Marta',
        last_name: 'Lopez',
        email: 'marta@example.com',
        contract: expect.objectContaining({
          has_fixed_schedule: true,
          preferred_start_time: '20:00',
          preferred_end_time: '04:00',
          start_date: '2026-05-12',
        }),
      }),
    )
  })

  it('shows validation error when fixed schedule times are equal', async () => {
    const wrapper = mountView()

    await fillRequiredEmployeeFields(wrapper)

    const fixedScheduleCheckbox = wrapper
      .findAll('input[type="checkbox"]')
      .find((input) => input.element.nextElementSibling?.textContent === 'Has fixed schedule')

    await fixedScheduleCheckbox?.setValue(true)
    await nextTick()

    await wrapper.find('#preferred-start-time').setValue('20:00')
    await wrapper.find('#preferred-end-time').setValue('20:00')

    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain(
      'Preferred start time and end time cannot be the same when fixed schedule is enabled.',
    )
    expect(createEmployeeOnboarding).not.toHaveBeenCalled()
  })

  it('shows validation error when days off do not match selected working days', async () => {
    const wrapper = mountView()

    await fillRequiredEmployeeFields(wrapper)

    await wrapper.find('#min-days-off').setValue(1)

    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain(
      'Minimum days off per week must match the number of non-working days selected.',
    )
    expect(createEmployeeOnboarding).not.toHaveBeenCalled()
  })

  it('shows backend error when employee creation fails', async () => {
    vi.mocked(createEmployeeOnboarding).mockRejectedValue(new Error('Failed'))

    const wrapper = mountView()

    await fillRequiredEmployeeFields(wrapper)

    await wrapper.get('form').trigger('submit.prevent')
    await nextTick()

    expect(wrapper.text()).toContain(
      'Unable to create employee. Please review the form and try again.',
    )
  })
})