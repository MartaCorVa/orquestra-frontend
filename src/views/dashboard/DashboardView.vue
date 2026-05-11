<template>
  <AppShell
    title="Dashboard"
    subtitle="General overview of employees, shifts, schedules, and workload distribution."
  >
    <section class="grid gap-6">
      <div 
        class="grid gap-4"
        :class="isAdmin ? 'xl:grid-cols-4' : 'xl:grid-cols-3'"
      >
        <article
          v-for="card in summaryCards"
          :key="card.label"
          class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <p class="text-sm text-slate-500">{{ card.label }}</p>
          <p class="mt-3 text-3xl font-semibold text-slate-900">
            {{ card.value }}
          </p>
        </article>
      </div>

      <div
        class="grid gap-6"
        :class="isAdmin ? 'xl:grid-cols-[1.4fr_1fr]' : 'xl:grid-cols-1'"
      >
        <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-semibold text-slate-900">
            Upcoming schedule
          </h2>

          <div
            v-if="upcomingSchedule.length === 0"
            class="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500"
          >
            No upcoming schedule available.
          </div>

          <div v-else class="mt-5 grid gap-3">
            <RouterLink
              v-for="item in upcomingSchedule"
              :key="item.title"
              :to="{ name: 'schedule-detail', params: { id: recentSchedule?.id } }"
              class="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
            >
              <div>
                <p class="font-medium text-slate-900">{{ item.title }}</p>
                <p class="mt-1 text-sm text-slate-500">{{ item.description }}</p>
              </div>

              <span
                class="rounded-full px-3 py-1 text-xs font-semibold"
                :class="item.badgeClass"
              >
                {{ item.status }}
              </span>
            </RouterLink>
          </div>
        </section>

        <section
          v-if="isAdmin"
          class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 class="text-xl font-semibold text-slate-900">
            Recent activity
          </h2>

          <div
            v-if="recentActivities.length === 0"
            class="mt-5 text-sm text-slate-500"
          >
            No recent activity yet.
          </div>

          <div v-else class="mt-5 grid gap-3">
            <article
              v-for="item in recentActivities"
              :key="item.id"
              class="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
            >
              <div>
                <p class="font-medium text-slate-900">{{ item.title }}</p>
                <p class="mt-1 text-sm text-slate-500">{{ item.description }}</p>
              </div>

              <span class="text-sm text-slate-400">
                {{ formatRelativeTime(item.timestamp) }}
              </span>
            </article>
          </div>
        </section>
      </div>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import AppShell from '../../components/layout/AppShell.vue'
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../stores/dashboard'
import { useActivityStore } from '../../stores/activity'
import { useAuthStore } from '../../stores/auth'
import { formatRelativeTime } from '../../utils/formatRelativeTime'
import type { SummaryCard } from '../../types/dashboard'

const dashboardStore = useDashboardStore()
const activityStore = useActivityStore()
const authStore = useAuthStore()
const { userRole } = storeToRefs(authStore)

const {
  summaryMetrics,
  recentSchedule,
} = storeToRefs(dashboardStore)

const { recentActivities } = storeToRefs(activityStore)

const isAdmin = computed(() => userRole.value === 'admin')

onMounted(async () => {
  await dashboardStore.loadDashboardData()

  if (isAdmin.value) {
    activityStore.loadActivities()
  }
})

const summaryCards = computed<SummaryCard[]>(() => {
  const cards: SummaryCard[] = [
    {
      label: 'Active employees',
      value: summaryMetrics.value.active_employees,
    },
    {
      label: 'Shifts this week',
      value: summaryMetrics.value.weekly_shifts,
    },
    {
      label: 'Schedules',
      value: summaryMetrics.value.schedules,
    },
  ]

  if (isAdmin.value) {
    cards.push({
      label: 'Schedules to validate',
      value: summaryMetrics.value.pending_validations,
    })
  }

  return cards
})

const getDayName = (date: string): string => {
  const d = new Date(`${date}T00:00:00`)

  return d.toLocaleDateString('en-US', {
    weekday: 'long',
  })
}

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1)

const getShiftType = (startTime: string): string => {
  const hour = Number.parseInt(startTime.split(':')[0], 10)

  if (hour >= 6 && hour < 14) return 'Morning'
  if (hour >= 14 && hour < 22) return 'Evening'
  return 'Night'
}

const getShiftDayRange = (shift: {
  start_date: string
  end_date: string
}): string => {
  const startDay = capitalize(getDayName(shift.start_date))

  if (shift.start_date === shift.end_date) {
    return startDay
  }

  const endDay = capitalize(getDayName(shift.end_date))

  return `${startDay} - ${endDay}`
}

const upcomingSchedule = computed(() => {
  if (!recentSchedule.value || recentSchedule.value.shifts.length === 0) {
    return []
  }

  return recentSchedule.value.shifts.slice(0, 5).map((shift) => ({
    title: `${getShiftDayRange(shift)} · ${getShiftType(shift.start_time)} Shift`,
    description: `${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)} · ${shift.number_of_employees} employees assigned`,
    status: shift.status,
    badgeClass: getBadgeClass(shift.status),
  }))
})

const getBadgeClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'planned':
      return 'bg-blue-100 text-blue-700'
    case 'assigned':
      return 'bg-green-100 text-green-700'
    case 'pending':
      return 'bg-amber-100 text-amber-700'
    case 'cancelled':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}
</script>