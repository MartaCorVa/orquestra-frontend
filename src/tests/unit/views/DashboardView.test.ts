import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import DashboardView from '../../../views/dashboard/DashboardView.vue'
import { useActivityStore } from '../../../stores/activity'
import { useAuthStore } from '../../../stores/auth'
import { useDashboardStore } from '../../../stores/dashboard'

describe('DashboardView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  function mountView() {
    return mount(DashboardView, {
      global: {
        stubs: {
          AppShell: {
            template: '<main><slot /></main>',
          },
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
        },
      },
    })
  }

  it('renders summary cards', async () => {
    const dashboardStore = useDashboardStore()

    dashboardStore.summaryMetrics = {
      active_employees: 5,
      weekly_shifts: 12,
      schedules: 3,
      pending_validations: 1,
    }

    vi.spyOn(dashboardStore, 'loadDashboardData').mockResolvedValue()

    const wrapper = mountView()

    await nextTick()

    expect(wrapper.text()).toContain('Active employees')
    expect(wrapper.text()).toContain('5')
    expect(wrapper.text()).toContain('Shifts this week')
    expect(wrapper.text()).toContain('12')
    expect(wrapper.text()).toContain('Schedules to validate')
    expect(wrapper.text()).toContain('1')
  })

  it('loads dashboard data on mount', async () => {
    const dashboardStore = useDashboardStore()
    const loadDashboardDataSpy = vi
      .spyOn(dashboardStore, 'loadDashboardData')
      .mockResolvedValue()

    mountView()

    await nextTick()

    expect(loadDashboardDataSpy).toHaveBeenCalled()
  })

  it('renders upcoming schedule shifts', async () => {
    const dashboardStore = useDashboardStore()

    dashboardStore.recentSchedule = {
      id: 1,
      shifts: [
        {
          date: '2026-05-04',
          start_time: '09:00:00',
          end_time: '17:00:00',
          status: 'planned',
          number_of_employees: 2,
        },
      ],
    }

    vi.spyOn(dashboardStore, 'loadDashboardData').mockResolvedValue()

    const wrapper = mountView()

    await nextTick()

    expect(wrapper.text()).toContain('Upcoming schedule')
    expect(wrapper.text()).toContain('Morning Shift')
    expect(wrapper.text()).toContain('09:00 - 17:00')
    expect(wrapper.text()).toContain('2 employees assigned')
  })

  it('shows recent activity for admin users', async () => {
    const dashboardStore = useDashboardStore()
    const authStore = useAuthStore()
    const activityStore = useActivityStore()

    authStore.userRole = 'admin'

    activityStore.activities = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Shift created',
        description: 'A new shift was created',
        timestamp: new Date().toISOString(),
      },
    ]

    vi.spyOn(dashboardStore, 'loadDashboardData').mockResolvedValue()
    const loadActivitiesSpy = vi.spyOn(activityStore, 'loadActivities')

    const wrapper = mountView()

    await nextTick()

    expect(wrapper.text()).toContain('Recent activity')
    expect(wrapper.text()).toContain('Shift created')
    expect(wrapper.text()).toContain('A new shift was created')
    expect(loadActivitiesSpy).toHaveBeenCalled()
  })

  it('does not show recent activity for non-admin users', async () => {
    const dashboardStore = useDashboardStore()
    const authStore = useAuthStore()

    authStore.userRole = 'employee'

    vi.spyOn(dashboardStore, 'loadDashboardData').mockResolvedValue()

    const wrapper = mountView()

    await nextTick()

    expect(wrapper.text()).not.toContain('Recent activity')
  })
})