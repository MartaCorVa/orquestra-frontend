<template>
  <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="mb-4">
      <h2 class="text-xl font-semibold text-slate-900">Schedules calendar</h2>
      <p class="mt-1 text-sm text-slate-500">
        Browse all schedules in calendar format.
      </p>
    </div>

    <div v-if="isLoading" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
      Loading schedules...
    </div>

    <div v-else-if="hasError" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      Failed to load schedules.
    </div>

    <div v-else-if="schedules.length === 0" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
      No schedules found.
    </div>

    <FullCalendar v-else :options="calendarOptions" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core'
import dayjs from 'dayjs'

import type { Schedule } from '../../api/schedules'

interface Props {
  schedules: Schedule[]
  isLoading: boolean
  hasError: boolean
}

const props = defineProps<Props>()
const router = useRouter()

function formatDate(value: string): string {
  return dayjs(value).format('DD/MM/YYYY')
}

function getScheduleEventColors(status: string) {
  switch (status.toLowerCase()) {
    case 'draft':
      return {
        backgroundColor: '#e2e8f0',
        borderColor: '#cbd5f5',
        textColor: '#334155',
      }
    case 'generated':
      return {
        backgroundColor: '#dcfce7',
        borderColor: '#bbf7d0',
        textColor: '#166534',
      }
    case 'published':
      return {
        backgroundColor: '#dbeafe',
        borderColor: '#bfdbfe',
        textColor: '#1e40af',
      }
    default:
      return {
        backgroundColor: '#f1f5f9',
        borderColor: '#e2e8f0',
        textColor: '#334155',
      }
  }
}

const events = computed<EventInput[]>(() =>
  props.schedules.map((schedule) => {
    const colors = getScheduleEventColors(schedule.status)

    return {
      id: String(schedule.id),
      title: `#${schedule.id} · ${schedule.status}`,
      start: schedule.start_date,
      end: dayjs(schedule.end_date).add(1, 'day').format('YYYY-MM-DD'),
      allDay: true,
      backgroundColor: colors.backgroundColor,
      borderColor: colors.borderColor,
      textColor: colors.textColor,
      extendedProps: {
        scheduleId: schedule.id,
        status: schedule.status,
        startDate: schedule.start_date,
        endDate: schedule.end_date,
      },
    }
  }),
)

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  height: 'auto',
  firstDay: 1,
  editable: false,
  selectable: false,
  navLinks: false,
  events: events.value,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  eventClick(info: EventClickArg) {
    const scheduleId = info.event.extendedProps.scheduleId as number
    router.push(`/schedules/${scheduleId}`)
  },
  eventDidMount(info) {
    const status = (info.event.extendedProps.status as string | undefined) ?? ''
    const startDate = (info.event.extendedProps.startDate as string | undefined) ?? ''
    const endDate = (info.event.extendedProps.endDate as string | undefined) ?? ''

    info.el.title = [
      `Schedule #${info.event.id}`,
      `Status: ${status}`,
      `Period: ${formatDate(startDate)} - ${formatDate(endDate)}`,
    ].join('\n')
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
</style>