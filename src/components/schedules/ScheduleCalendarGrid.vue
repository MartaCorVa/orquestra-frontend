<template>
  <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">Planning overview</h2>
        <p class="mt-1 text-sm text-slate-500">
          Shifts and assignments grouped by day.
        </p>
      </div>
    </div>

    <div v-if="days.length === 0" class="text-sm text-slate-500">
      No shifts found for this schedule.
    </div>

    <div v-else class="grid gap-4 xl:grid-cols-7">
      <article
        v-for="day in days"
        :key="day.date"
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <div class="mb-4">
          <p class="text-sm font-semibold text-slate-900">
            {{ formatDayLabel(day.date) }}
          </p>
          <p class="mt-1 text-xs text-slate-500">
            {{ formatFullDate(day.date) }}
          </p>
        </div>

        <div v-if="day.shifts.length === 0" class="text-xs text-slate-400">
          No shifts
        </div>

        <div v-else class="space-y-3">
          <section
            v-for="shift in day.shifts"
            :key="shift.id"
            class="rounded-2xl border border-slate-200 bg-white p-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-slate-900">
                  {{ formatTime(shift.start_time) }} - {{ formatTime(shift.end_time) }}
                </p>
                <p class="mt-1 text-xs text-slate-500">
                  {{ shift.status }}
                </p>
              </div>

              <span
                class="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700"
              >
                {{ shift.assignments.length }} assigned
              </span>
            </div>

            <div class="mt-3 space-y-2">
              <div
                v-for="assignment in shift.assignments"
                :key="assignment.id"
                class="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700"
              >
                {{ assignment.employee.first_name}} {{ assignment.employee.last_name }}
              </div>

              <div
                v-if="shift.assignments.length === 0"
                class="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700"
              >
                No employees assigned
              </div>
            </div>
          </section>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'

import type { ScheduleDetail, ScheduleDetailShift } from '../../api/schedules'

interface Props {
  schedule: ScheduleDetail
}

interface DayGroup {
  date: string
  shifts: ScheduleDetailShift[]
}

const props = defineProps<Props>()

const days = computed<DayGroup[]>(() => {
  const grouped = new Map<string, ScheduleDetailShift[]>()

  const sortedShifts = [...props.schedule.shifts].sort((firstShift, secondShift) => {
    const firstDateTime = `${firstShift.date}T${firstShift.start_time}`
    const secondDateTime = `${secondShift.date}T${secondShift.start_time}`

    return dayjs(firstDateTime).valueOf() - dayjs(secondDateTime).valueOf()
  })

  for (const shift of sortedShifts) {
    const currentShifts = grouped.get(shift.date) ?? []
    currentShifts.push(shift)
    grouped.set(shift.date, currentShifts)
  }

  return Array.from(grouped.entries()).map(([date, shifts]) => ({
    date,
    shifts,
  }))
})

function formatDayLabel(value: string): string {
  return dayjs(value).format('ddd')
}

function formatFullDate(value: string): string {
  return dayjs(value).format('DD/MM/YYYY')
}

function formatTime(value: string): string {
  return dayjs(`2000-01-01T${value}`).format('HH:mm')
}
</script>