<template>
  <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="mb-4">
      <h3 class="text-xl font-semibold text-slate-900">Planning calendar</h3>
      <p class="mt-1 text-sm text-slate-600">
        Visualize shifts and assignments in calendar format.
      </p>
    </div>

    <FullCalendar :options="calendarOptions" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions, EventInput } from '@fullcalendar/core'
import dayjs from 'dayjs'

import type { ScheduleDetail } from '../../api/schedules'

interface Props {
  schedule: ScheduleDetail
}

const props = defineProps<Props>()

function buildShiftDateTime(date: string, time: string): string {
  return dayjs(`${date}T${time}`).toISOString()
}

const events = computed<EventInput[]>(() => {
  return props.schedule.shifts.map((shift) => {
    const start = buildShiftDateTime(shift.start_date, shift.start_time)
    const end = buildShiftDateTime(shift.end_date, shift.end_time)

    const assignedEmployees =
      shift.assignments?.map((assignment) => {
        const employee = assignment.employee
        if (!employee) return 'Assigned employee'
        return `${employee.first_name} ${employee.last_name}`
      }) ?? []

    return {
      id: String(shift.id),
      start,
      end,
      extendedProps: {
        status: shift.status,
        employees: assignedEmployees,
      },
      backgroundColor: assignedEmployees.length === 0 ? '#fca5a5' : '#60a5fa',
    }
  })
})

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  initialDate: props.schedule.start_date,
  height: 'auto',
  firstDay: 1,
  weekends: true,
  allDaySlot: false,
  nowIndicator: true,
  editable: false,
  selectable: false,
  navLinks: false,
  eventDisplay: 'block',
  headerToolbar: {
    left: 'prev,next',
    center: 'title',
    right: '',
  },
  validRange: {
    start: props.schedule.start_date,
    end: dayjs(props.schedule.end_date).add(1, 'day').format('YYYY-MM-DD'),
  },
  events: events.value,
  locale: 'es',
  eventTimeFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  },
  slotLabelFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  },
  eventContent(arg) {
    const employees = (arg.event.extendedProps.employees as string[] | undefined) ?? []

    return {
      html: `
        <div style="font-size: 0.75rem;">
          <div style="font-weight: 600;">${arg.timeText}</div>
          <div>${employees.length > 0 ? employees.join('<br/>') : 'No employees assigned'}</div>
        </div>
      `,
    }
  },
  eventDidMount(info) {
    const employees = (info.event.extendedProps.employees as string[] | undefined) ?? []
    const status = (info.event.extendedProps.status as string | undefined) ?? ''

    info.el.title =
      employees.length > 0
        ? `Status: ${status}\nEmployees: ${employees.join(', ')}`
        : `Status: ${status}\nEmployees: none assigned`
  },
}))
</script>

<style scoped>
:deep(.fc) {
  --fc-border-color: rgb(226 232 240);
  --fc-button-bg-color: rgb(29 78 216);
  --fc-button-border-color: rgb(29 78 216);
  --fc-button-hover-bg-color: rgb(30 64 175);
  --fc-button-hover-border-color: rgb(30 64 175);
  --fc-button-active-bg-color: rgb(30 64 175);
  --fc-button-active-border-color: rgb(30 64 175);
  --fc-today-bg-color: rgb(239 246 255);
  font-size: 0.95rem;
}

:deep(.fc .fc-toolbar-title) {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(15 23 42);
}

:deep(.fc .fc-button) {
  border-radius: 0.75rem;
  box-shadow: none;
}

:deep(.fc .fc-event) {
  border-radius: 0.75rem;
  padding: 0.2rem 0.35rem;
  border: none;
}

:deep(.fc .fc-timegrid-event-harness) {
  margin-inline: 2px;
}
</style>