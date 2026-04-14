<template>
  <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div class="grid gap-6 md:grid-cols-2">
        <div>
          <label
            for="employee-id"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Employee
          </label>
          <select
            id="employee-id"
            v-model="localForm.employee_id"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
            :disabled="isSubmitting"
          >
            <option :value="null">Unassigned</option>
            <option
              v-for="employee in employees"
              :key="employee.id"
              :value="employee.id"
            >
              {{ employee.first_name }} {{ employee.last_name }}
            </option>
          </select>
        </div>

        <div>
          <label
            for="schedule-id"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Schedule
          </label>
          <select
            id="schedule-id"
            v-model.number="localForm.schedule_id"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
            :disabled="isSubmitting"
          >
            <option
              v-for="schedule in schedules"
              :key="schedule.id"
              :value="schedule.id"
            >
              #{{ schedule.id }} · {{ formatDate(schedule.start_date) }} - {{ formatDate(schedule.end_date) }}
            </option>
          </select>
        </div>

        <div>
          <label
            for="start-date"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Start date
          </label>
          <input
            id="start-date"
            v-model="localForm.start_date"
            type="date"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
            :disabled="isSubmitting"
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
            v-model="localForm.end_date"
            type="date"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
            :disabled="isSubmitting"
          />
        </div>

        <div>
          <label
            for="start-time"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Start time
          </label>
          <input
            id="start-time"
            v-model="localForm.start_time"
            type="time"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
            :disabled="isSubmitting"
          />
        </div>

        <div>
          <label
            for="end-time"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            End time
          </label>
          <input
            id="end-time"
            v-model="localForm.end_time"
            type="time"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
            :disabled="isSubmitting"
          />
        </div>

        <div>
          <label
            for="creation-type"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Creation type
          </label>
          <select
            id="creation-type"
            v-model="localForm.creation_type"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
            :disabled="isSubmitting"
          >
            <option value="manual">manual</option>
            <option value="automatic">automatic</option>
          </select>
        </div>

        <div>
          <label
            for="status"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Status
          </label>
          <select
            id="status"
            v-model="localForm.status"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
            :disabled="isSubmitting"
          >
            <option value="planned">planned</option>
            <option value="assigned">assigned</option>
          </select>
        </div>
      </div>

      <p
        v-if="datetimeValidationMessage"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ datetimeValidationMessage }}
      </p>

      <p
        v-if="errorMessage"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ errorMessage }}
      </p>

      <div class="flex justify-end gap-3">
        <RouterLink
          to="/shifts"
          class="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Cancel
        </RouterLink>

        <button
          type="submit"
          class="rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
          :disabled="isSubmitting || !canSubmit || Boolean(datetimeValidationMessage)"
        >
          {{ submitLabel }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { RouterLink } from 'vue-router'
import dayjs from 'dayjs'

import type { Schedule } from '../../api/schedules'
import type { CreateShiftPayload } from '../../api/shifts'

interface EmployeeOption {
  id: number
  first_name: string
  last_name: string
}

interface ShiftFormState {
  employee_id: number | null
  start_date: string
  start_time: string
  end_date: string
  end_time: string
  creation_type: string
  status: string
  schedule_id: number
}

interface Props {
  form: ShiftFormState
  schedules: Schedule[]
  employees: EmployeeOption[]
  isSubmitting: boolean
  errorMessage: string
  submitLabel: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [payload: CreateShiftPayload]
}>()

const localForm = reactive<ShiftFormState>({
  employee_id: props.form.employee_id,
  start_date: props.form.start_date,
  start_time: props.form.start_time,
  end_date: props.form.end_date,
  end_time: props.form.end_time,
  creation_type: props.form.creation_type,
  status: props.form.status,
  schedule_id: props.form.schedule_id,
})

const canSubmit = computed<boolean>(() => {
  return Boolean(
    localForm.start_date &&
    localForm.start_time &&
    localForm.end_date &&
    localForm.end_time &&
    localForm.schedule_id,
  )
})

const datetimeValidationMessage = computed<string>(() => {
  if (!canSubmit.value) {
    return ''
  }

  const start = dayjs(`${localForm.start_date}T${localForm.start_time}`)
  const end = dayjs(`${localForm.end_date}T${localForm.end_time}`)

  if (!start.isValid() || !end.isValid()) {
    return 'Please enter valid start and end date/time values.'
  }

  if (!end.isAfter(start)) {
    return 'End date and time must be later than start date and time.'
  }

  return ''
})

watch(
  () => props.form,
  (newForm) => {
    localForm.employee_id = newForm.employee_id
    localForm.start_date = newForm.start_date
    localForm.start_time = newForm.start_time
    localForm.end_date = newForm.end_date
    localForm.end_time = newForm.end_time
    localForm.creation_type = newForm.creation_type
    localForm.status = newForm.status
    localForm.schedule_id = newForm.schedule_id
  },
  { deep: true },
)

function formatDate(value: string): string {
  return dayjs(value).format('DD/MM/YYYY')
}

function buildDatetimes(): { start_datetime: string; end_datetime: string } {
  return {
    start_datetime: dayjs(`${localForm.start_date}T${localForm.start_time}`).toISOString(),
    end_datetime: dayjs(`${localForm.end_date}T${localForm.end_time}`).toISOString(),
  }
}

function handleSubmit(): void {
  if (!canSubmit.value || datetimeValidationMessage.value) {
    return
  }

  const { start_datetime, end_datetime } = buildDatetimes()

  emit('submit', {
    start_datetime,
    end_datetime,
    creation_type: localForm.creation_type,
    status: localForm.status,
    schedule_id: localForm.schedule_id,
    employee_id: localForm.employee_id,
  })
}
</script>