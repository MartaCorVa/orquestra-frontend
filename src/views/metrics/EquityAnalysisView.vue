<template>
  <AppShell
    title="Equity analysis"
    subtitle="Analyze fairness by schedule and workload across custom date ranges."
  >
    <section class="space-y-6">
      <section class="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
        <div class="inline-flex rounded-2xl border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            class="rounded-xl px-4 py-2 text-sm font-medium transition"
            :class="
              activeTab === 'fairness'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            "
            @click="activeTab = 'fairness'"
          >
            Fairness
          </button>

          <button
            type="button"
            class="rounded-xl px-4 py-2 text-sm font-medium transition"
            :class="
              activeTab === 'workload'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            "
            @click="activeTab = 'workload'"
          >
            Workload
          </button>
        </div>
      </section>

      <section
        v-if="errorMessage"
        class="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ errorMessage }}
      </section>

      <template v-if="activeTab === 'fairness'">
        <section class="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-wrap items-center gap-3">
              <div>
                <h2 class="text-xl font-semibold text-slate-900">Fairness by schedule</h2>
                <p class="text-sm text-slate-500">
                  Compare assigned hours within a selected schedule.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <select
                v-model.number="selectedScheduleId"
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                :disabled="isLoadingSchedules || isLoadingFairness"
                @change="handleScheduleChange"
              >
                <option
                  v-for="schedule in sortedSchedules"
                  :key="schedule.id"
                  :value="schedule.id"
                >
                  #{{ schedule.id }} · {{ formatDate(schedule.start_date) }} - {{ formatDate(schedule.end_date) }}
                </option>
              </select>

              <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <span class="text-slate-500">Period:</span>
                <span class="ml-1 font-medium text-slate-900">
                  {{ selectedScheduleLabel }}
                </span>
              </div>
            </div>
          </div>

          <div
            v-if="isLoadingSchedules"
            class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500"
          >
            Loading schedules...
          </div>

          <template v-if="fairnessData">
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article
                v-for="card in summaryCards"
                :key="card.label"
                class="rounded-3xl border border-slate-200 bg-slate-50 p-6"
              >
                <p class="text-sm text-slate-500">{{ card.label }}</p>
                <p class="mt-3 text-3xl font-semibold text-slate-900">
                  {{ card.value }}
                </p>
              </article>
            </div>

            <div class="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <section class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 class="text-lg font-semibold text-slate-900">Hours by employee</h3>
                <p class="mt-1 text-sm text-slate-500">
                  Relative workload distribution within the schedule.
                </p>

                <div class="mt-6 space-y-4">
                  <article
                    v-for="employee in fairnessData.employees"
                    :key="employee.employee_id"
                    class="grid grid-cols-[140px_1fr_72px] items-center gap-4"
                  >
                    <div>
                      <p class="text-sm font-medium text-slate-900">
                        {{ employee.employee_name }}
                      </p>
                      <p class="mt-1 text-xs text-slate-500">
                        Max {{ employee.max_weekly_hours }}h
                      </p>
                    </div>

                    <div class="h-4 overflow-hidden rounded-full bg-slate-200">
                      <div
                        class="h-full rounded-full bg-blue-600"
                        :style="{ width: `${getFairnessBarWidth(employee.assigned_hours)}%` }"
                      />
                    </div>

                    <div class="text-right">
                      <p class="text-sm font-semibold text-slate-900">
                        {{ employee.assigned_hours }}h
                      </p>
                      <p class="mt-1 text-xs text-slate-500">
                        {{ employee.workload_percentage.toFixed(1) }}%
                      </p>
                    </div>
                  </article>
                </div>
              </section>

              <section class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 class="text-lg font-semibold text-slate-900">Detected insights</h3>
                <p class="mt-1 text-sm text-slate-500">
                  Quick interpretation of the fairness distribution.
                </p>

                <div class="mt-6 space-y-3">
                  <article
                    v-for="insight in insights"
                    :key="insight.title"
                    class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div>
                      <p class="font-medium text-slate-900">{{ insight.title }}</p>
                      <p class="mt-1 text-sm text-slate-500">{{ insight.description }}</p>
                    </div>

                    <span
                      class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                      :class="insight.badgeClass"
                    >
                      {{ insight.badge }}
                    </span>
                  </article>
                </div>
              </section>
            </div>
          </template>
        </section>
      </template>

      <template v-else>
        <section class="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 class="text-xl font-semibold text-slate-900">Workload by date range</h2>
              <p class="mt-1 text-sm text-slate-500">
                Analyze assigned workload across a custom time period.
              </p>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 xl:flex xl:items-end">
              <div>
                <label
                  for="start-date"
                  class="mb-2 block text-sm font-medium text-slate-700"
                >
                  Start date
                </label>
                <input
                  id="start-date"
                  v-model="startDate"
                  type="date"
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 xl:w-[180px]"
                  :disabled="isLoadingWorkload"
                />
              </div>

              <div>
                <label
                  for="end-date"
                  class="mb-2 block text-sm font-medium text-slate-700"
                >
                  End date
                </label>
                <input
                  id="end-date"
                  v-model="endDate"
                  type="date"
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 xl:w-[180px]"
                  :disabled="isLoadingWorkload"
                />
              </div>

              <button
                type="button"
                class="rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70 xl:mb-0"
                :disabled="isLoadingWorkload"
                @click="loadWorkload"
              >
                {{ isLoadingWorkload ? 'Loading...' : 'Load workload' }}
              </button>
            </div>
          </div>

          <section
            v-if="workloadData"
            class="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6"
          >
            <div class="grid gap-4 md:grid-cols-3">
              <article class="rounded-2xl border border-slate-200 bg-white p-4">
                <p class="text-sm text-slate-500">Start date</p>
                <p class="mt-2 text-2xl font-semibold text-slate-900">
                  {{ formatDate(workloadData.start_date) }}
                </p>
              </article>

              <article class="rounded-2xl border border-slate-200 bg-white p-4">
                <p class="text-sm text-slate-500">End date</p>
                <p class="mt-2 text-2xl font-semibold text-slate-900">
                  {{ formatDate(workloadData.end_date) }}
                </p>
              </article>

              <article class="rounded-2xl border border-slate-200 bg-white p-4">
                <p class="text-sm text-slate-500">Total assigned hours</p>
                <p class="mt-2 text-2xl font-semibold text-slate-900">
                  {{ workloadData.total_assigned_hours }}h
                </p>
              </article>
            </div>

            <div class="space-y-4">
              <article
                v-for="employee in workloadData.employees"
                :key="employee.employee_id"
                class="grid grid-cols-[140px_1fr_72px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <p class="text-sm font-medium text-slate-900">
                    {{ employee.employee_name }}
                  </p>
                  <p class="mt-1 text-xs text-slate-500">
                    Max {{ employee.max_weekly_hours }}h
                  </p>
                </div>

                <div class="h-4 overflow-hidden rounded-full bg-slate-200">
                  <div
                    class="h-full rounded-full bg-blue-600"
                    :style="{ width: `${getWorkloadBarWidth(employee.workload_percentage)}%` }"
                  />
                </div>

                <div class="text-right">
                  <p class="text-sm font-semibold text-slate-900">
                    {{ employee.assigned_hours }}h
                  </p>
                  <p class="mt-1 text-xs text-slate-500">
                    {{ employee.workload_percentage.toFixed(1) }}%
                  </p>
                </div>
              </article>
            </div>
          </section>
        </section>
      </template>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'

import AppShell from '../../components/layout/AppShell.vue'
import { getScheduleFairness, getWorkloadMetrics } from '../../api/metrics'
import { getSchedules, type Schedule } from '../../api/schedules'
import { getBackendErrorMessage } from '../../utils/api'
import type {
  ScheduleFairnessResponse,
  WorkloadMetricsResponse,
} from '../../types/metrics'

interface SummaryCard {
  label: string
  value: string
}

interface InsightItem {
  title: string
  description: string
  badge: string
  badgeClass: string
}

type MetricsTab = 'fairness' | 'workload'

const activeTab = ref<MetricsTab>('fairness')

const schedules = ref<Schedule[]>([])
const selectedScheduleId = ref<number | null>(null)
const fairnessData = ref<ScheduleFairnessResponse | null>(null)
const workloadData = ref<WorkloadMetricsResponse | null>(null)

const currentWeekRange = getCurrentWeekRange()

const startDate = ref<string>(currentWeekRange.start)
const endDate = ref<string>(currentWeekRange.end)

const isLoadingSchedules = ref<boolean>(false)
const isLoadingFairness = ref<boolean>(false)
const isLoadingWorkload = ref<boolean>(false)
const errorMessage = ref<string>('')

const sortedSchedules = computed<Schedule[]>(() =>
  [...schedules.value].sort(
    (firstSchedule, secondSchedule) =>
      dayjs(secondSchedule.created_at).valueOf() - dayjs(firstSchedule.created_at).valueOf(),
  ),
)

const selectedSchedule = computed<Schedule | undefined>(() =>
  sortedSchedules.value.find((schedule) => schedule.id === selectedScheduleId.value),
)

const selectedScheduleLabel = computed<string>(() => {
  if (!selectedSchedule.value) {
    return 'No schedule selected'
  }

  return `${formatDate(selectedSchedule.value.start_date)} - ${formatDate(selectedSchedule.value.end_date)}`
})

const summaryCards = computed<SummaryCard[]>(() => {
  if (!fairnessData.value) {
    return []
  }

  return [
    {
      label: 'Total assigned hours',
      value: `${fairnessData.value.total_assigned_hours}h`,
    },
    {
      label: 'Max assigned hours',
      value: `${fairnessData.value.max_assigned_hours}h`,
    },
    {
      label: 'Min assigned hours',
      value: `${fairnessData.value.min_assigned_hours}h`,
    },
    {
      label: 'Hours gap',
      value: `${fairnessData.value.hours_gap}h`,
    },
  ]
})

const insights = computed<InsightItem[]>(() => {
  if (!fairnessData.value || fairnessData.value.employees.length === 0) {
    return []
  }

  const employees = fairnessData.value.employees
  const highest = [...employees].sort(
    (firstEmployee, secondEmployee) =>
      secondEmployee.assigned_hours - firstEmployee.assigned_hours,
  )[0]
  const lowest = [...employees].sort(
    (firstEmployee, secondEmployee) =>
      firstEmployee.assigned_hours - secondEmployee.assigned_hours,
  )[0]

  const isBalanced = fairnessData.value.hours_gap <= 4

  return [
    {
      title: isBalanced ? 'Balanced planning' : 'Uneven distribution',
      description: isBalanced
        ? 'The hours gap is low, which suggests a relatively fair allocation.'
        : 'The difference between the highest and lowest assigned hours should be reviewed.',
      badge: isBalanced ? 'Good' : 'Review',
      badgeClass: isBalanced
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Highest workload',
      description: `${highest.employee_name} has the highest assigned workload with ${highest.assigned_hours}h.`,
      badge: `${highest.assigned_hours}h`,
      badgeClass: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Lowest workload',
      description: `${lowest.employee_name} has the lowest assigned workload with ${lowest.assigned_hours}h.`,
      badge: `${lowest.assigned_hours}h`,
      badgeClass: 'bg-slate-100 text-slate-700',
    },
  ]
})

function formatDate(value: string): string {
  return dayjs(value).format('DD/MM/YYYY')
}

function getCurrentWeekRange(): { start: string; end: string } {
  const today = dayjs()
  const dayOfWeek = today.day()

  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const monday = today.subtract(daysFromMonday, 'day')
  const sunday = monday.add(6, 'day')

  return {
    start: monday.format('YYYY-MM-DD'),
    end: sunday.format('YYYY-MM-DD'),
  }
}

function getFairnessBarWidth(assignedHours: number): number {
  if (!fairnessData.value || fairnessData.value.max_assigned_hours === 0) {
    return 0
  }

  return (assignedHours / fairnessData.value.max_assigned_hours) * 100
}

function getWorkloadBarWidth(workloadPercentage: number): number {
  return Math.max(0, Math.min(workloadPercentage, 100))
}

async function loadSchedules(): Promise<void> {
  isLoadingSchedules.value = true
  errorMessage.value = ''

  try {
    schedules.value = await getSchedules()

    if (sortedSchedules.value.length > 0 && selectedScheduleId.value === null) {
      selectedScheduleId.value = sortedSchedules.value[0].id
    }
  } catch (error: unknown) {
    errorMessage.value = getBackendErrorMessage(
      error,
      'Unable to load schedules. Please try again.',
    )
  } finally {
    isLoadingSchedules.value = false
  }
}

async function loadFairness(): Promise<void> {
  if (!selectedScheduleId.value) {
    return
  }

  isLoadingFairness.value = true
  errorMessage.value = ''

  try {
    fairnessData.value = await getScheduleFairness(selectedScheduleId.value)
  } catch (error: unknown) {
    errorMessage.value = getBackendErrorMessage(
      error,
      'Unable to load fairness metrics. Please try again.',
    )
    fairnessData.value = null
  } finally {
    isLoadingFairness.value = false
  }
}

async function handleScheduleChange(): Promise<void> {
  if (!selectedScheduleId.value) {
    fairnessData.value = null
    return
  }

  await loadFairness()
}

async function loadWorkload(): Promise<void> {
  if (!startDate.value || !endDate.value) {
    errorMessage.value = 'Please select both start and end dates.'
    return
  }

  isLoadingWorkload.value = true
  errorMessage.value = ''

  try {
    workloadData.value = await getWorkloadMetrics({
      start_date: startDate.value,
      end_date: endDate.value,
    })
  } catch (error: unknown) {
    errorMessage.value = getBackendErrorMessage(
      error,
      'Unable to load workload metrics. Please try again.',
    )
    workloadData.value = null
  } finally {
    isLoadingWorkload.value = false
  }
}

onMounted(async () => {
  await loadSchedules()

  if (selectedScheduleId.value) {
    await loadFairness()
  }

  await loadWorkload()
})
</script>