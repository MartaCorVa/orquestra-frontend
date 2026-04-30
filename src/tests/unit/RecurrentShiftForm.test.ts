import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import RecurrentShiftForm from '../../components/shifts/RecurrentShiftForm.vue'
import { getActiveContractByEmployee } from '../../api/contracts'
import { activeContractMock } from '../mocks/contracts'
import { employeesMock } from '../mocks/employees'
import { schedulesMock } from '../mocks/schedules'
import type { Weekday } from '../../api/shifts'

vi.mock('../../api/contracts', () => ({
  getActiveContractByEmployee: vi.fn(),
}))

vi.mock('vue-router', () => ({
  RouterLink: {
    template: '<a><slot /></a>',
    props: ['to'],
  },
}))

const getActiveContractByEmployeeMock = vi.mocked(getActiveContractByEmployee)

const form = {
  employee_id: null,
  schedule_id: 1,
  start_date: '2026-05-06',
  end_date: '2026-05-20',
  start_time: '09:00',
  end_time: '17:00',
  weekdays: ['monday', 'tuesday'] as Weekday[],
  creation_type: 'manual',
  status: 'planned',
}

function mountComponent(customForm = {}) {
  return mount(RecurrentShiftForm, {
    props: {
      form: {
        ...form,
        ...customForm,
      },
      schedules: schedulesMock,
      employees: employeesMock,
      isSubmitting: false,
      errorMessage: '',
      submitLabel: 'Create recurrent shifts',
    },
  })
}

describe('RecurrentShiftForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getActiveContractByEmployeeMock.mockResolvedValue(activeContractMock)
  })

  it('renders recurrent shift form fields', () => {
    const wrapper = mountComponent()

    expect(wrapper.find('#employee-id').exists()).toBe(true)
    expect(wrapper.find('#schedule-id').exists()).toBe(true)
    expect(wrapper.find('#start-date').exists()).toBe(true)
    expect(wrapper.find('#end-date').exists()).toBe(true)
    expect(wrapper.find('#start-time').exists()).toBe(true)
    expect(wrapper.find('#end-time').exists()).toBe(true)
    expect(wrapper.text()).toContain('Weekdays')
    expect(wrapper.text()).toContain('Create recurrent shifts')
  })

  it('emits submit with recurrent shift payload when form is valid', async () => {
    const wrapper = mountComponent()

    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          schedule_id: 1,
          start_date: '2026-05-06',
          end_date: '2026-05-20',
          start_time: '09:00',
          end_time: '17:00',
          weekdays: ['monday', 'tuesday'],
          creation_type: 'manual',
          status: 'planned',
          employee_id: null,
        },
      ],
    ])
  })

  it('shows validation error when no weekday is selected', async () => {
    const wrapper = mountComponent({
      weekdays: [],
    })

    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('At least one weekday must be selected.')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('shows validation error when start date is after end date', async () => {
    const wrapper = mountComponent({
      start_date: '2026-05-20',
      end_date: '2026-05-06',
    })

    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Start date cannot be later than end date.')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('shows validation error when end time is before start time', async () => {
    const wrapper = mountComponent({
      start_time: '18:00',
      end_time: '09:00',
    })

    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('End time must be later than start time.')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('loads active contract and applies weekdays and fixed schedule when employee changes', async () => {
    const wrapper = mountComponent()

    await wrapper.get('#employee-id').setValue('1')
    await flushPromises()

    expect(getActiveContractByEmployeeMock).toHaveBeenCalledWith(1)
    expect(wrapper.text()).toContain('Active contract loaded')
    expect(wrapper.get<HTMLInputElement>('#start-time').element.value).toBe(
      activeContractMock.preferred_start_time,
    )
    expect(wrapper.get<HTMLInputElement>('#end-time').element.value).toBe(
      activeContractMock.preferred_end_time,
    )
  })

  it('shows contract loading error when active contract request fails', async () => {
    getActiveContractByEmployeeMock.mockRejectedValueOnce(new Error('Request failed'))

    const wrapper = mountComponent()

    await wrapper.get('#employee-id').setValue('1')
    await flushPromises()

    expect(wrapper.text()).toContain(
      'Unable to load the active contract for the selected employee.',
    )
  })
})