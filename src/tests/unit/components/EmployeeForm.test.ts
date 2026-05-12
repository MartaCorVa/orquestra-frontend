import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import EmployeeForm from '../../../components/employees/EmployeeForm.vue'
import { activeContractMock } from '../../mocks/contracts'

const employeeForm = {
  first_name: 'Marta',
  last_name: 'García',
  phone_number: '600000000',
  active: true,
}

const contractForm = {
  weekly_hours: activeContractMock.weekly_hours,
  daily_hours: activeContractMock.daily_hours,
  min_days_off_per_week: activeContractMock.min_days_off_per_week,
  work_monday: activeContractMock.work_monday,
  work_tuesday: activeContractMock.work_tuesday,
  work_wednesday: activeContractMock.work_wednesday,
  work_thursday: activeContractMock.work_thursday,
  work_friday: activeContractMock.work_friday,
  work_saturday: activeContractMock.work_saturday,
  work_sunday: activeContractMock.work_sunday,
  has_fixed_schedule: activeContractMock.has_fixed_schedule,
  preferred_start_time: activeContractMock.preferred_start_time,
  preferred_end_time: activeContractMock.preferred_end_time,
  active: activeContractMock.active,
  start_date: activeContractMock.start_date,
  end_date: activeContractMock.end_date,
}

function mountComponent(options?: {
  employeeOverrides?: Partial<typeof employeeForm>
  contractOverrides?: Partial<typeof contractForm>
  submitLabel?: string
  errorMessage?: string
  isSubmitting?: boolean
}) {
  return mount(EmployeeForm, {
    props: {
      form: {
        ...employeeForm,
        ...options?.employeeOverrides,
      },
      contractForm: {
        ...contractForm,
        ...options?.contractOverrides,
      },
      isSubmitting: options?.isSubmitting ?? false,
      errorMessage: options?.errorMessage ?? '',
      submitLabel: options?.submitLabel ?? 'Save employee',
    },
    global: {
      stubs: {
        RouterLink: true,
      },
    },
  })
}

describe('EmployeeForm', () => {
  it('renders employee and contract fields', () => {
    const wrapper = mountComponent()

    expect(wrapper.find('#first-name').exists()).toBe(true)
    expect(wrapper.find('#last-name').exists()).toBe(true)
    expect(wrapper.find('#phone-number').exists()).toBe(true)
    expect(wrapper.find('#weekly-hours').exists()).toBe(true)
    expect(wrapper.find('#daily-hours').exists()).toBe(true)
    expect(wrapper.find('#min-days-off').exists()).toBe(true)
  })

  it('can be used to create an employee', async () => {
    const wrapper = mountComponent({
      submitLabel: 'Create employee',
    })

    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeTruthy()
  })

  it('can be used to edit an employee', async () => {
    const wrapper = mountComponent({
      submitLabel: 'Save changes',
    })

    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeTruthy()
  })

  it('emits employee and contract data when the form is valid', async () => {
    const wrapper = mountComponent()

    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          employee: employeeForm,
          contract: {
            ...contractForm,
            active: true,
          },
        },
      ],
    ])
  })

  it('shows an error when no working day is selected', async () => {
    const wrapper = mountComponent({
      contractOverrides: {
        work_monday: false,
        work_tuesday: false,
        work_wednesday: false,
        work_thursday: false,
        work_friday: false,
        work_saturday: false,
        work_sunday: false,
        min_days_off_per_week: 7,
      },
    })

    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('At least one working day must be selected.')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('shows an error when minimum days off does not match non-working days', async () => {
    const wrapper = mountComponent({
      contractOverrides: {
        work_monday: true,
        work_tuesday: true,
        work_wednesday: true,
        work_thursday: true,
        work_friday: true,
        work_saturday: false,
        work_sunday: false,
        min_days_off_per_week: 1,
      },
    })

    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain(
      'Minimum days off per week must match the number of non-working days selected.',
    )
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('does not emit submit when fixed schedule times are missing', async () => {
    const wrapper = mountComponent({
      contractOverrides: {
        has_fixed_schedule: true,
        preferred_start_time: null,
        preferred_end_time: null,
      },
    })

    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('sets preferred times to null when fixed schedule is disabled', async () => {
    const wrapper = mountComponent({
      contractOverrides: {
        has_fixed_schedule: false,
        preferred_start_time: '09:00',
        preferred_end_time: '17:00',
      },
    })

    await wrapper.get('form').trigger('submit.prevent')

    const emittedPayload = wrapper.emitted('submit')?.[0][0] as {
      contract: {
        preferred_start_time: string | null
        preferred_end_time: string | null
      }
    }

    expect(emittedPayload.contract.preferred_start_time).toBeNull()
    expect(emittedPayload.contract.preferred_end_time).toBeNull()
  })

  it('shows backend error message when errorMessage prop is provided', () => {
    const wrapper = mountComponent({
      errorMessage: 'Unable to save employee.',
    })

    expect(wrapper.text()).toContain('Unable to save employee.')
  })

  it('disables fields while submitting', () => {
    const wrapper = mountComponent({
      isSubmitting: true,
    })

    expect(wrapper.get('#first-name').attributes('disabled')).toBeDefined()
    expect(wrapper.get('#weekly-hours').attributes('disabled')).toBeDefined()
  })
})