import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import SchedulesListView from '../../../views/schedules/SchedulesListView.vue'
import { useAuthStore } from '../../../stores/auth'
import { schedulesMock } from '../../mocks/schedules'

const {
  getSchedulesMock,
  getScheduleByIdMock,
  generatePlanningMock,
  updateScheduleMock,
  getBackendErrorMessageMock,
} = vi.hoisted(() => ({
  getSchedulesMock: vi.fn(),
  getScheduleByIdMock: vi.fn(),
  generatePlanningMock: vi.fn(),
  updateScheduleMock: vi.fn(),
  getBackendErrorMessageMock: vi.fn(),
}))

vi.mock('../../../api/schedules', () => ({
  getSchedules: getSchedulesMock,
  getScheduleById: getScheduleByIdMock,
  generatePlanning: generatePlanningMock,
  updateSchedule: updateScheduleMock,
}))

vi.mock('../../../utils/api', () => ({
  getBackendErrorMessage: getBackendErrorMessageMock,
}))

describe('SchedulesListView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  function mountView() {
    return mount(SchedulesListView, {
      global: {
        stubs: {
          AppShell: {
            template: '<main><slot /></main>',
          },
          FiltersPanel: {
            template: '<section><slot /></section>',
          },
          SchedulesCalendar: {
            template: '<div>Schedules calendar</div>',
            props: ['schedules', 'isLoading', 'hasError'],
          },
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
        },
      },
    })
  }

  it('loads and renders schedules', async () => {
    getSchedulesMock.mockResolvedValue(schedulesMock)

    const wrapper = mountView()

    await nextTick()
    await nextTick()

    expect(getSchedulesMock).toHaveBeenCalled()
    expect(wrapper.text()).toContain('01/05/2026')
    expect(wrapper.text()).toContain('31/05/2026')
    expect(wrapper.text()).toContain('draft')
  })

  it('shows error state when schedules cannot be loaded', async () => {
    getSchedulesMock.mockRejectedValue(new Error('Failed'))

    const wrapper = mountView()

    await nextTick()
    await nextTick()

    expect(wrapper.text()).toContain('Failed to load schedules.')
  })

  it('shows empty state when no schedules are found', async () => {
    getSchedulesMock.mockResolvedValue([])

    const wrapper = mountView()

    await nextTick()
    await nextTick()

    expect(wrapper.text()).toContain('No schedules found.')
  })

  it('shows create schedule button for admin users', async () => {
    getSchedulesMock.mockResolvedValue(schedulesMock)

    const authStore = useAuthStore()
    authStore.userRole = 'admin'

    const wrapper = mountView()

    await nextTick()
    await nextTick()

    expect(wrapper.text()).toContain('Create schedule')
  })

  it('does not show create schedule button for non-admin users', async () => {
    getSchedulesMock.mockResolvedValue(schedulesMock)

    const authStore = useAuthStore()
    authStore.userRole = 'employee'

    const wrapper = mountView()

    await nextTick()
    await nextTick()

    expect(wrapper.text()).not.toContain('Create schedule')
  })

  it('filters schedules by status', async () => {
    getSchedulesMock.mockResolvedValue(schedulesMock)

    const wrapper = mountView()

    await nextTick()
    await nextTick()

    await wrapper.find('#schedule-status').setValue('generated')

    expect(wrapper.text()).toContain('generated')
    expect(wrapper.text()).not.toContain('draft')
  })

  it('shows invalid date range message', async () => {
    getSchedulesMock.mockResolvedValue(schedulesMock)

    const wrapper = mountView()

    await nextTick()
    await nextTick()

    await wrapper.find('#schedule-start-date').setValue('2026-06-10')
    await wrapper.find('#schedule-end-date').setValue('2026-06-01')

    expect(wrapper.text()).toContain('Start date cannot be later than end date.')
  })

  it('switches to calendar tab', async () => {
    getSchedulesMock.mockResolvedValue(schedulesMock)

    const wrapper = mountView()

    await nextTick()
    await nextTick()

    await wrapper.findAll('button').find((button) => button.text() === 'Calendar')?.trigger('click')

    expect(wrapper.text()).toContain('Schedules calendar')
  })
})