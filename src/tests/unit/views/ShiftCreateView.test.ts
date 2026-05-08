import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSchedules } from '../../../api/schedules'
import { getEmployees } from '../../../api/employees'
import { createRecurrentShifts, createShift, type Shift } from '../../../api/shifts'
import ShiftCreateView from '../../../views/shifts/ShiftCreateView.vue'
import { schedulesMock } from '../../mocks/schedules'
import { employeesMock } from '../../mocks/employees'

const pushMock = vi.fn()
const addActivityMock = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a><slot /></a>',
  },
}))

vi.mock('../../../stores/activity', () => ({
  useActivityStore: () => ({
    addActivity: addActivityMock,
  }),
}))

vi.mock('../../../api/schedules', () => ({
  getSchedules: vi.fn(),
}))

vi.mock('../../../api/employees', () => ({
  getEmployees: vi.fn(),
}))

vi.mock('../../../api/shifts', () => ({
  createShift: vi.fn(),
  createRecurrentShifts: vi.fn(),
}))

vi.mock('../../../utils/api', () => ({
  getBackendErrorMessage: vi.fn((_error: unknown, fallback: string) => fallback),
}))

const getSchedulesMock = vi.mocked(getSchedules)
const getEmployeesMock = vi.mocked(getEmployees)
const createShiftMock = vi.mocked(createShift)
const createRecurrentShiftsMock = vi.mocked(createRecurrentShifts)

const shiftMock: Shift = {
  id: 1,
  start_datetime: '2026-05-10T09:00:00',
  end_datetime: '2026-05-10T17:00:00',
  creation_type: 'manual',
  status: 'planned',
  schedule_id: 1,
  employee_id: 1,
  employee_name: 'Marta Lopez',
  created_at: '2026-05-01T10:00:00',
}

function mountComponent() {
  return mount(ShiftCreateView, {
    global: {
      stubs: {
        AppShell: {
          template: '<section><slot /></section>',
          props: ['title', 'subtitle'],
        },
        RouterLink: true,
      },
    },
  })
}

describe('ShiftCreateView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  
    getSchedulesMock.mockResolvedValue(schedulesMock)
    getEmployeesMock.mockResolvedValue(employeesMock)
    createShiftMock.mockResolvedValue(shiftMock)
    createRecurrentShiftsMock.mockResolvedValue([shiftMock])
  })

  it('loads schedules and employees on mount', async () => {
    mountComponent()

    await flushPromises()

    expect(getSchedulesMock).toHaveBeenCalledOnce()
    expect(getEmployeesMock).toHaveBeenCalledOnce()
  })

  it('renders the single shift form by default', async () => {
    const wrapper = mountComponent()

    await flushPromises()

    expect(wrapper.text()).toContain('Single shift')
    expect(wrapper.text()).toContain('Recurrent shifts')
    expect(wrapper.findComponent({ name: 'ShiftForm' }).exists()).toBe(true)
  })

  it('creates a single shift and redirects to shifts list', async () => {
    const wrapper = mountComponent()

    await flushPromises()

    const payload = {
      start_datetime: '2026-05-10T09:00:00',
      end_datetime: '2026-05-10T17:00:00',
      creation_type: 'manual',
      status: 'planned',
      schedule_id: 1,
      employee_id: 1,
    }

    await wrapper.findComponent({ name: 'ShiftForm' }).vm.$emit('submit', payload)
    await flushPromises()

    expect(createShiftMock).toHaveBeenCalledWith(payload)
    expect(addActivityMock).toHaveBeenCalledWith(
      'Shift created',
      '10/05/2026, 09:00 - 10/05/2026, 17:00',
    )
    expect(pushMock).toHaveBeenCalledWith({ name: 'shifts' })
  })

  it('shows an error message when single shift creation fails', async () => {
    createShiftMock.mockRejectedValueOnce(new Error('Request failed'))

    const wrapper = mountComponent()

    await flushPromises()

    await wrapper.findComponent({ name: 'ShiftForm' }).vm.$emit('submit', {
      start_datetime: '2026-05-10T09:00:00',
      end_datetime: '2026-05-10T17:00:00',
      creation_type: 'manual',
      status: 'planned',
      schedule_id: 1,
      employee_id: 1,
    })

    await flushPromises()

    expect(wrapper.text()).toContain(
      'Unable to create shift. Please review the form and try again.',
    )
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('creates recurrent shifts and redirects to shifts list', async () => {
    const wrapper = mountComponent()

    await flushPromises()

    await wrapper.get('button:nth-of-type(2)').trigger('click')

    const payload = {
      schedule_id: 1,
      start_date: '2026-05-10',
      end_date: '2026-05-20',
      start_time: '09:00',
      end_time: '17:00',
      weekdays: ['monday', 'tuesday'],
      creation_type: 'manual',
      status: 'planned',
      employee_id: 1,
    }

    await wrapper.findComponent({ name: 'RecurrentShiftForm' }).vm.$emit('submit', payload)
    await flushPromises()

    expect(createRecurrentShiftsMock).toHaveBeenCalledWith(payload)
    expect(addActivityMock).toHaveBeenCalledWith(
      'Recurrent shifts created',
      '1 shifts · 10/05/2026 - 20/05/2026',
    )
    expect(pushMock).toHaveBeenCalledWith({ name: 'shifts' })
  })
})