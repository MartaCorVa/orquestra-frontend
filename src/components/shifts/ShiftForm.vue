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
            Schedule <span class="text-red-500">*</span>
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

        <p
          v-if="selectedSchedule"
          class="md:col-span-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700"
        >
          Schedule range:
          {{ formatDate(selectedSchedule.start_date) }} -
          {{ formatDate(selectedSchedule.end_date) }}
        </p>

        <p
          v-if="isLoadingContract"
          class="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
        >
          Loading active contract...
        </p>

        <div
          v-else-if="activeContract"
          class="md:col-span-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <p class="font-medium">Active contract loaded</p>
          <p class="mt-1">
            {{ activeContract.weekly_hours }}h/week ·
            {{ activeContract.daily_hours }}h/day
            <span v-if="activeContract.has_fixed_schedule">
              · {{ activeContract.preferred_start_time }} -
              {{ activeContract.preferred_end_time }}
            </span>
          </p>
        </div>

        <div>
          <label
            for="start-date"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Start date <span class="text-red-500">*</span>
          </label>
          <input
            id="start-date"
            v-model="localForm.start_date"
            type="date"
            :min="selectedSchedule?.start_date"
            :max="selectedSchedule?.end_date"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
            :disabled="isSubmitting"
          />
        </div>

        <div>
          <label
            for="end-date"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            End date <span class="text-red-500">*</span>
          </label>
          <input
            id="end-date"
            v-model="localForm.end_date"
            type="date"
            :min="selectedSchedule?.start_date"
            :max="selectedSchedule?.end_date"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
            :disabled="isSubmitting"
          />
        </div>

        <div>
          <label
            for="start-time"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Start time <span class="text-red-500">*</span>
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
            End time <span class="text-red-500">*</span>
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
        v-if="localError || errorMessage"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ localError || errorMessage }}
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
          :disabled="isSubmitting"
        >
          {{ submitLabel }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import dayjs from 'dayjs'

import type { Schedule } from '../../api/schedules'
import type { CreateShiftPayload } from '../../api/shifts'
import type { Contract } from '../../api/contracts'
import { getActiveContractByEmployee } from '../../api/contracts'

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
const localError = ref<string>('')
const activeContract = ref<Contract | null>(null)
const isLoadingContract = ref<boolean>(false)

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

const selectedSchedule = computed<Schedule | undefined>(() =>
  props.schedules.find((schedule) => schedule.id === localForm.schedule_id),
)

const validationMessage = computed<string>(() => {
  if (!localForm.schedule_id) {
    return 'Schedule is required.'
  }

  if (!localForm.start_date) {
    return 'Start date is required.'
  }

  if (!localForm.end_date) {
    return 'End date is required.'
  }

  if (!localForm.start_time) {
    return 'Start time is required.'
  }

  if (!localForm.end_time) {
    return 'End time is required.'
  }

  if (selectedSchedule.value) {
    if (
      localForm.start_date < selectedSchedule.value.start_date ||
      localForm.end_date > selectedSchedule.value.end_date
    ) {
      return 'Shift dates must be within the selected schedule range.'
    }
  }

  const start = dayjs(`${localForm.start_date}T${localForm.start_time}`)
  const end = dayjs(`${localForm.end_date}T${localForm.end_time}`)
  
  if (!start.isValid() || !end.isValid()) {
    return 'Please enter valid start and end date/time values.'
  }
  
  if (
    localForm.start_date === localForm.end_date &&
    localForm.end_time <= localForm.start_time
  ) {
    return 'End time must be later than start time when the shift starts and ends on the same day.'
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

watch(
  () => localForm.employee_id,
  async (employeeId) => {
    activeContract.value = null

    if (!employeeId) {
      return
    }

    isLoadingContract.value = true
    localError.value = ''

    try {
      const contract = await getActiveContractByEmployee(employeeId)
      applyContractToForm(contract)
    } catch {
      localError.value = 'Unable to load the active contract for the selected employee.'
    } finally {
      isLoadingContract.value = false
    }
  },
)

watch(
  localForm,
  () => {
    if (localError.value) {
      localError.value = ''
    }
  },
  { deep: true },
)

function applyContractToForm(contract: Contract): void {
  activeContract.value = contract

  if (contract.has_fixed_schedule) {
    localForm.start_time = contract.preferred_start_time ?? localForm.start_time
    localForm.end_time = contract.preferred_end_time ?? localForm.end_time
  }
}

function formatDate(value: string): string {
  return dayjs(value).format('DD/MM/YYYY')
}

function buildDatetimes(): { start_datetime: string; end_datetime: string } {
  return {
    start_datetime: dayjs(
      `${localForm.start_date}T${localForm.start_time}`,
    ).format('YYYY-MM-DDTHH:mm:ss'),
    end_datetime: dayjs(
      `${localForm.end_date}T${localForm.end_time}`,
    ).format('YYYY-MM-DDTHH:mm:ss'),
  }
}

function handleSubmit(): void {
  localError.value = validationMessage.value

  if (localError.value) {
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