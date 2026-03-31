<template>
  <AppShell
    title="Dashboard"
    subtitle="General overview of employees, shifts, schedules, and workload distribution."
  >
    <section class="grid gap-6">
      <div class="grid gap-4 xl:grid-cols-4">
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

      <div class="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-semibold text-slate-900">
            Upcoming schedule
          </h2>

          <div class="mt-5 grid gap-3">
            <article
              v-for="item in upcomingSchedule"
              :key="item.title"
              class="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
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
            </article>
          </div>
        </section>

        <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-semibold text-slate-900">
            Recent activity
          </h2>

          <div class="mt-5 grid gap-3">
            <article
              v-for="item in recentActivity"
              :key="item.title"
              class="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
            >
              <div>
                <p class="font-medium text-slate-900">{{ item.title }}</p>
                <p class="mt-1 text-sm text-slate-500">{{ item.description }}</p>
              </div>

              <span class="text-sm text-slate-400">{{ item.time }}</span>
            </article>
          </div>
        </section>
      </div>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import AppShell from '../../components/layout/AppShell.vue'

interface SummaryCard {
  label: string
  value: string
}

interface ScheduleItem {
  title: string
  description: string
  status: string
  badgeClass: string
}

interface ActivityItem {
  title: string
  description: string
  time: string
}

const summaryCards: SummaryCard[] = [
  { label: 'Active employees', value: '18' },
  { label: 'Shifts this week', value: '42' },
  { label: 'Schedules', value: '6' },
  { label: 'Validation alerts', value: '3' },
]

const upcomingSchedule: ScheduleItem[] = [
  {
    title: 'Monday · Morning shift',
    description: '08:00 - 14:00 · 5 employees assigned',
    status: 'Ready',
    badgeClass: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Tuesday · Evening shift',
    description: '14:00 - 22:00 · 4 employees assigned',
    status: 'Validated',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Wednesday · Night shift',
    description: '22:00 - 06:00 · 3 employees assigned',
    status: 'Review',
    badgeClass: 'bg-amber-100 text-amber-700',
  },
]

const recentActivity: ActivityItem[] = [
  {
    title: 'John Doe',
    description: 'Employee updated',
    time: '2 min ago',
  },
  {
    title: 'Weekly schedule',
    description: 'Generated for 12–18 May',
    time: '12 min ago',
  },
  {
    title: 'Overlap warning',
    description: 'Shift conflict detected',
    time: '35 min ago',
  },
]
</script>