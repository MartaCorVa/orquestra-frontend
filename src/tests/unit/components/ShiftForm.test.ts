import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { mount } from '@vue/test-utils'

import ShiftForm from '../../../components/shifts/ShiftForm.vue'
import { getActiveContractByEmployee } from '../../../api/contracts'
import { activeContractMock } from '../../mocks/contracts'
import { employeesMock } from '../../mocks/employees'
import { schedulesMock } from '../../mocks/schedules'

vi.mock('../../../api/contracts', () => ({
  getActiveContractByEmployee: vi.fn(),
}))

const getActiveContractByEmployeeMock = getActiveContractByEmployee as Mock

const baseForm = {
  employee_id: null,
  start_date: '2026-05-10',
  start_time: '10:00',
  end_date: '2026-05-10',
  end_time: '18:00',
  creation_type: 'manual',
  status: 'planned',
  schedule_id: 1,
}

function mountComponent(overrides = {}) {
  return mount(ShiftForm, {
    props: {
      form: {
        ...baseForm,
        ...overrides,
      },
      schedules: schedulesMock,
      employees: employeesMock,
      isSubmitting: false,
      errorMessage: '',
      submitLabel: 'Create shift',
    },
    global: {
      stubs: {
        RouterLink: true,
      },
    },
  })
}

describe('ShiftForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getActiveContractByEmployeeMock.mockResolvedValue(activeContractMock)
  })

  it('renders the form fields', () => {
    const wrapper = mountComponent()

    expect(wrapper.find('#employee-id').exists()).toBe(true)
    expect(wrapper.find('#schedule-id').exists()).toBe(true)
    expect(wrapper.find('#start-date').exists()).toBe(true)
    expect(wrapper.find('#end-date').exists()).toBe(true)
    expect(wrapper.find('#start-time').exists()).toBe(true)
    expect(wrapper.find('#end-time').exists()).toBe(true)
  })

  it('emits submit with formatted datetimes when the form is valid', async () => {
    const wrapper = mountComponent()

    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          start_datetime: '2026-05-10T10:00:00',
          end_datetime: '2026-05-10T18:00:00',
          creation_type: 'manual',
          status: 'planned',
          schedule_id: 1,
          employee_id: null,
        },
      ],
    ])
  })

  it('shows an error when end time is before start time on the same day', async () => {
    const wrapper = mountComponent({
      start_date: '2026-05-10',
      end_date: '2026-05-10',
      start_time: '18:00',
      end_time: '10:00',
    })

    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain(
      'End time must be later than start time when the shift starts and ends on the same day.',
    )
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('allows overnight shifts when end date is after start date', async () => {
    const wrapper = mountComponent({
      start_date: '2026-05-10',
      end_date: '2026-05-11',
      start_time: '18:00',
      end_time: '10:00',
    })
  
    await wrapper.get('form').trigger('submit.prevent')
  
    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          start_datetime: '2026-05-10T18:00:00',
          end_datetime: '2026-05-11T10:00:00',
          creation_type: 'manual',
          status: 'planned',
          schedule_id: 1,
          employee_id: null,
        },
      ],
    ])
  })

  it('shows an error when shift dates are outside schedule range', async () => {
    const wrapper = mountComponent({
      start_date: '2026-06-01',
      end_date: '2026-06-01',
    })

    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain(
      'Shift dates must be within the selected schedule range.',
    )
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('loads active contract and applies fixed schedule when employee is selected', async () => {
    const wrapper = mountComponent()

    await wrapper.get('#employee-id').setValue('1')

    await vi.waitFor(() => {
      expect(getActiveContractByEmployeeMock).toHaveBeenCalledWith(1)
    })

    expect((wrapper.get('#start-time').element as HTMLInputElement).value).toBe(
      '09:00',
    )
    expect((wrapper.get('#end-time').element as HTMLInputElement).value).toBe(
      '17:00',
    )
    expect(wrapper.text()).toContain('Active contract loaded')
  })

  it('shows an error when active contract cannot be loaded', async () => {
    getActiveContractByEmployeeMock.mockRejectedValueOnce(new Error('Failed'))

    const wrapper = mountComponent()

    await wrapper.get('#employee-id').setValue('1')

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain(
        'Unable to load the active contract for the selected employee.',
      )
    })
  })
})