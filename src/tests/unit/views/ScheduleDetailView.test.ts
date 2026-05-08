import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ScheduleDetailView from '../../../views/schedules/ScheduleDetailView.vue'
import { useAuthStore } from '../../../stores/auth'

const {
  getScheduleByIdMock,
  generatePlanningMock,
  updateScheduleMock,
  getBackendErrorMessageMock,
} = vi.hoisted(() => ({
  getScheduleByIdMock: vi.fn(),
  generatePlanningMock: vi.fn(),
  updateScheduleMock: vi.fn(),
  getBackendErrorMessageMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  RouterLink: {
    props: ['to'],
    template: '<a><slot /></a>',
  },
  useRoute: () => ({
    params: {
      id: '1',
    },
  }),
}))

vi.mock('../../../api/schedules', () => ({
  getScheduleById: getScheduleByIdMock,
  generatePlanning: generatePlanningMock,
  updateSchedule: updateScheduleMock,
}))

vi.mock('../../../utils/api', () => ({
  getBackendErrorMessage: getBackendErrorMessageMock,
}))

const scheduleDetailMock = {
  id: 1,
  start_date: '2026-05-01',
  end_date: '2026-05-31',
  status: 'draft',
  shifts: [
    {
      id: 1,
      date: '2026-05-01',
      start_time: '09:00:00',
      end_time: '17:00:00',
      status: 'planned',
      assignments: [
        {
          id: 1,
          employee: {
            id: 1,
            first_name: 'Marta',
            last_name: 'Lopez',
          },
        },
      ],
    },
  ],
}

describe('ScheduleDetailView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  function mountView() {
    return mount(ScheduleDetailView, {
      global: {
        stubs: {
          AppShell: {
            template: '<main><slot /></main>',
          },
          ScheduleFullCalendar: {
            template: '<div>Schedule calendar</div>',
            props: ['schedule'],
          },
        },
      },
    })
  }

  it('loads and renders schedule detail', async () => {
    getScheduleByIdMock.mockResolvedValue(scheduleDetailMock)

    const wrapper = mountView()

    await flushPromises()

    expect(getScheduleByIdMock).toHaveBeenCalledWith(1)
    expect(wrapper.text()).toContain('01/05/2026')
    expect(wrapper.text()).toContain('31/05/2026')
    expect(wrapper.text()).toContain('draft')
    expect(wrapper.text()).toContain('Schedule calendar')
  })

  it('shows error when schedule detail cannot be loaded', async () => {
    getScheduleByIdMock.mockRejectedValue(new Error('Failed'))

    const wrapper = mountView()

    await flushPromises()

    expect(wrapper.text()).toContain('Failed to load schedule data.')
  })

  it('shows generate button for admin when schedule is not published', async () => {
    getScheduleByIdMock.mockResolvedValue(scheduleDetailMock)

    const authStore = useAuthStore()
    authStore.userRole = 'admin'

    const wrapper = mountView()

    await flushPromises()

    expect(wrapper.text()).toContain('Generate planning')
  })

  it('does not show generate button for non-admin users', async () => {
    getScheduleByIdMock.mockResolvedValue(scheduleDetailMock)

    const authStore = useAuthStore()
    authStore.userRole = 'employee'

    const wrapper = mountView()

    await flushPromises()

    expect(wrapper.text()).not.toContain('Generate planning')
  })

  it('shows validation error when generating schedule without shifts', async () => {
    getScheduleByIdMock.mockResolvedValue({
      ...scheduleDetailMock,
      shifts: [],
    })

    const authStore = useAuthStore()
    authStore.userRole = 'admin'

    const wrapper = mountView()

    await flushPromises()

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Generate planning')
      ?.trigger('click')

    expect(wrapper.text()).toContain(
      'Planning cannot be generated because this schedule has no shifts.',
    )
  })

  it('generates planning successfully', async () => {
    getScheduleByIdMock.mockResolvedValue(scheduleDetailMock)
    generatePlanningMock.mockResolvedValue({
      message: 'Planning generated successfully.',
      assignments_created: [],
      unfilled_shifts: [],
      employees_below_target: [],
      missing_contract_hours_total: 0,
    })
    updateScheduleMock.mockResolvedValue({})

    const authStore = useAuthStore()
    authStore.userRole = 'admin'

    const wrapper = mountView()

    await flushPromises()

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Generate planning')
      ?.trigger('click')

    await flushPromises()

    expect(generatePlanningMock).toHaveBeenCalledWith(1)
    expect(updateScheduleMock).toHaveBeenCalledWith(1, {
      status: 'generated',
    })
  })

  it('shows publish button for generated schedules', async () => {
    getScheduleByIdMock.mockResolvedValue({
      ...scheduleDetailMock,
      status: 'generated',
    })

    const authStore = useAuthStore()
    authStore.userRole = 'admin'

    const wrapper = mountView()

    await flushPromises()

    expect(wrapper.text()).toContain('Publish schedule')
  })
})