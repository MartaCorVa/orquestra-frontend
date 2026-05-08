import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import EquityAnalysisView from '../../../views/metrics/EquityAnalysisView.vue'
import { getSchedules } from '../../../api/schedules'
import { getScheduleFairness, getWorkloadMetrics } from '../../../api/metrics'
import { schedulesMock } from '../../mocks/schedules'

vi.mock('../../../api/schedules', () => ({
  getSchedules: vi.fn(),
}))

vi.mock('../../../api/metrics', () => ({
  getScheduleFairness: vi.fn(),
  getWorkloadMetrics: vi.fn(),
}))

vi.mock('../../../utils/api', () => ({
  getBackendErrorMessage: vi.fn((_error: unknown, fallback: string) => fallback),
}))

const getSchedulesMock = vi.mocked(getSchedules)
const getScheduleFairnessMock = vi.mocked(getScheduleFairness)
const getWorkloadMetricsMock = vi.mocked(getWorkloadMetrics)

const fairnessMock = {
  schedule_id: 2,
  total_assigned_hours: 70,
  employees: [
    {
      employee_id: 1,
      employee_name: 'Marta Lopez',
      assigned_hours: 40,
      contract_weekly_hours: 40,
      workload_percentage: 100,
    },
    {
      employee_id: 2,
      employee_name: 'Laura Gomez',
      assigned_hours: 30,
      contract_weekly_hours: 40,
      workload_percentage: 75,
    },
  ],
  max_assigned_hours: 40,
  min_assigned_hours: 30,
  hours_gap: 10,
  max_workload_percentage: 100,
  min_workload_percentage: 75,
  workload_percentage_gap: 25,
}

const workloadMock = {
  start_date: '2026-05-04',
  end_date: '2026-05-10',
  total_assigned_hours: 70,
  employees: fairnessMock.employees,
}

function mountComponent() {
  return mount(EquityAnalysisView, {
    global: {
      stubs: {
        AppShell: {
          template: '<section><slot /></section>',
          props: ['title', 'subtitle'],
        },
      },
    },
  })
}

describe('EquityAnalysisView', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    getSchedulesMock.mockResolvedValue(schedulesMock)
    getScheduleFairnessMock.mockResolvedValue(fairnessMock)
    getWorkloadMetricsMock.mockResolvedValue(workloadMock)
  })

  it('loads schedules, fairness and workload metrics on mount', async () => {
    mountComponent()

    await flushPromises()

    expect(getSchedulesMock).toHaveBeenCalledOnce()
    expect(getScheduleFairnessMock).toHaveBeenCalledWith(2)
    expect(getWorkloadMetricsMock).toHaveBeenCalledOnce()
  })

  it('renders fairness metrics by default', async () => {
    const wrapper = mountComponent()

    await flushPromises()

    expect(wrapper.text()).toContain('Fairness by schedule')
    expect(wrapper.text()).toContain('Total assigned hours')
    expect(wrapper.text()).toContain('70h')
    expect(wrapper.text()).toContain('Marta Lopez')
    expect(wrapper.text()).toContain('Laura Gomez')
  })

  it('loads fairness again when schedule changes', async () => {
    const wrapper = mountComponent()

    await flushPromises()

    const select = wrapper.get('select')
    await select.setValue('1')

    await flushPromises()

    expect(getScheduleFairnessMock).toHaveBeenCalledWith(1)
  })

  it('renders workload tab and loads workload data', async () => {
    const wrapper = mountComponent()

    await flushPromises()

    await wrapper.get('button:nth-of-type(2)').trigger('click')

    expect(wrapper.text()).toContain('Workload by date range')
    expect(wrapper.text()).toContain('Load workload')
    expect(wrapper.text()).toContain('Total assigned hours')
    expect(wrapper.text()).toContain('70h')
  })

  it('shows an error message when fairness loading fails after changing schedule', async () => {
    const wrapper = mountComponent()
    
    await flushPromises()
    
    getScheduleFairnessMock.mockRejectedValueOnce(new Error('Request failed'))
    
    await wrapper.find('select').setValue('1')
    await flushPromises()
    
    expect(wrapper.text()).toContain(
      'Unable to load fairness metrics. Please try again.',
    )
  })
})