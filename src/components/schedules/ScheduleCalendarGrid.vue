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
                  {{ shift.creation_type }} · {{ shift.status }}
                </p>
              </div>

              <span
                class="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700"
              >
                {{ shiftAssignmentsMap[shift.id]?.length ?? 0 }} assigned
              </span>
            </div>

            <div class="mt-3 space-y-2">
              <div
                v-for="assignment in shiftAssignmentsMap[shift.id] ?? []"
                :key="assignment.id"
                class="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700"
              >
                {{ getEmployeeName(assignment.employee_id) }}
              </div>

              <div
                v-if="(shiftAssignmentsMap[shift.id]?.length ?? 0) === 0"
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

import type { Assignment } from '../../api/assignments'
import type { Employee } from '../../api/employees'
import type { Shift } from '../../api/shifts'

interface Props {
  shifts: Shift[]
  assignments: Assignment[]
  employees: Employee[]
}

const props = defineProps<Props>()

interface DayGroup {
  date: string
  shifts: Shift[]
}

const days = computed<DayGroup[]>(() => {
  const grouped = new Map<string, Shift[]>()

  const sortedShifts = [...props.shifts].sort((firstShift, secondShift) => {
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

const shiftAssignmentsMap = computed<Record<number, Assignment[]>>(() => {
  const result: Record<number, Assignment[]> = {}

  for (const assignment of props.assignments) {
    if (!result[assignment.shift_id]) {
      result[assignment.shift_id] = []
    }

    result[assignment.shift_id].push(assignment)
  }

  return result
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

function getEmployeeName(employeeId: number): string {
  const employee = props.employees.find((currentEmployee) => currentEmployee.id === employeeId)

  if (!employee) {
    return `Employee #${employeeId}`
  }

  return `${employee.first_name} ${employee.last_name}`
}
</script>