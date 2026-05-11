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
    localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  function setAuthRole(role: 'admin' | 'employee') {
    const authStore = useAuthStore()

    localStorage.setItem('role', role)

    if ('role' in authStore) {
      ;(authStore as unknown as { role: string }).role = role
    }

    if ('userRole' in authStore) {
      ;(authStore as unknown as { userRole: string }).userRole = role
    }

    return authStore
  }

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

  it('renders summary cards for admin', async () => {
    const dashboardStore = useDashboardStore()
    setAuthRole('admin')

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
    expect(wrapper.text()).toContain('Schedules')
    expect(wrapper.text()).toContain('3')
    expect(wrapper.text()).toContain('Schedules to validate')
    expect(wrapper.text()).toContain('1')
  })

  it('does not render schedules to validate card for employees', async () => {
    const dashboardStore = useDashboardStore()
    setAuthRole('employee')

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
    expect(wrapper.text()).toContain('Shifts this week')
    expect(wrapper.text()).toContain('Schedules')
    expect(wrapper.text()).not.toContain('Schedules to validate')
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
          start_date: '2026-05-04',
          end_date: '2026-05-04',
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
    expect(wrapper.text()).toContain('Monday · Morning Shift')
    expect(wrapper.text()).toContain('09:00 - 17:00')
    expect(wrapper.text()).toContain('2 employees assigned')
  })

  it('renders overnight shifts with start and end day range', async () => {
    const dashboardStore = useDashboardStore()

    dashboardStore.recentSchedule = {
      id: 1,
      shifts: [
        {
          start_date: '2026-05-04',
          end_date: '2026-05-05',
          start_time: '22:00:00',
          end_time: '06:00:00',
          status: 'planned',
          number_of_employees: 1,
        },
      ],
    }

    vi.spyOn(dashboardStore, 'loadDashboardData').mockResolvedValue()

    const wrapper = mountView()

    await nextTick()

    expect(wrapper.text()).toContain('Monday - Tuesday · Night Shift')
    expect(wrapper.text()).toContain('22:00 - 06:00')
    expect(wrapper.text()).toContain('1 employees assigned')
  })

  it('shows empty state when there is no upcoming schedule', async () => {
    const dashboardStore = useDashboardStore()

    dashboardStore.recentSchedule = null

    vi.spyOn(dashboardStore, 'loadDashboardData').mockResolvedValue()

    const wrapper = mountView()

    await nextTick()

    expect(wrapper.text()).toContain('No upcoming schedule available.')
  })

  it('shows recent activity for admin users', async () => {
    const dashboardStore = useDashboardStore()
    const activityStore = useActivityStore()

    setAuthRole('admin')

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

    setAuthRole('employee')

    vi.spyOn(dashboardStore, 'loadDashboardData').mockResolvedValue()

    const wrapper = mountView()

    await nextTick()

    expect(wrapper.text()).not.toContain('Recent activity')
  })
})