<template>
  <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
    <form ref="formRef" class="space-y-8" @submit.prevent="handleSubmit">
      <div class="space-y-6">
        <div>
          <h2 class="text-lg font-semibold text-slate-900">Employee information</h2>
          <p class="mt-1 text-sm text-slate-500">
            Update employee profile information.
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <div>
            <label
              for="first-name"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              First name <span class="text-red-500">*</span>
            </label>
            <input
              id="first-name"
              v-model="localEmployeeForm.first_name"
              type="text"
              required
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
              :disabled="isSubmitting"
            />
          </div>

          <div>
            <label
              for="last-name"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              Last name <span class="text-red-500">*</span>
            </label>
            <input
              id="last-name"
              v-model="localEmployeeForm.last_name"
              type="text"
              required
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
              :disabled="isSubmitting"
            />
          </div>

          <div>
            <label
              for="phone-number"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              Phone number
            </label>
            <input
              id="phone-number"
              v-model="localEmployeeForm.phone_number"
              type="text"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
              :disabled="isSubmitting"
            />
          </div>

          <div class="flex items-end">
            <label class="flex items-center gap-3 text-sm text-slate-700">
              <input
                v-model="localEmployeeForm.active"
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                :disabled="isSubmitting"
              />
              <span>Employee active</span>
            </label>
          </div>
        </div>
      </div>

      <div class="space-y-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
        <div>
          <h2 class="text-lg font-semibold text-slate-900">Contract information</h2>
          <p class="mt-1 text-sm text-slate-500">
            Update the active contract. A new contract will only be created if changes are detected.
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          <div>
            <label
              for="weekly-hours"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              Weekly hours <span class="text-red-500">*</span>
            </label>
            <input
              id="weekly-hours"
              v-model.number="localContractForm.weekly_hours"
              type="number"
              min="1"
              required
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
              :disabled="isSubmitting"
            />
          </div>

          <div>
            <label
              for="daily-hours"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              Daily hours <span class="text-red-500">*</span>
            </label>
            <input
              id="daily-hours"
              v-model.number="localContractForm.daily_hours"
              type="number"
              min="1"
              required
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
              :disabled="isSubmitting"
            />
          </div>

          <div>
            <label
              for="min-days-off"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              Minimum days off per week <span class="text-red-500">*</span>
            </label>
            <input
              id="min-days-off"
              v-model.number="localContractForm.min_days_off_per_week"
              type="number"
              min="0"
              max="7"
              required
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          <div>
            <label
              for="start-date"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              Contract start date
            </label>
            <input
              id="start-date"
              v-model="localContractForm.start_date"
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
              Contract end date
            </label>
            <input
              id="end-date"
              v-model="localContractForm.end_date"
              type="date"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
              :disabled="isSubmitting"
            />
          </div>

          <div class="flex items-end">
            <label class="flex items-center gap-3 text-sm text-slate-700">
              <input
                v-model="localContractForm.has_fixed_schedule"
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                :disabled="isSubmitting"
              />
              <span>Has fixed schedule</span>
            </label>
          </div>
        </div>

        <div
          v-if="localContractForm.has_fixed_schedule"
          class="grid gap-6 md:grid-cols-2"
        >
          <div>
            <label
              for="preferred-start-time"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              Preferred start time <span class="text-red-500">*</span>
            </label>
            <input
              id="preferred-start-time"
              v-model="localContractForm.preferred_start_time"
              type="time"
              :required="localContractForm.has_fixed_schedule"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
              :disabled="isSubmitting"
            />
          </div>

          <div>
            <label
              for="preferred-end-time"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              Preferred end time <span class="text-red-500">*</span>
            </label>
            <input
              id="preferred-end-time"
              v-model="localContractForm.preferred_end_time"
              type="time"
              :required="localContractForm.has_fixed_schedule"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <div>
          <p class="mb-3 text-sm font-medium text-slate-700">
            Working days <span class="text-red-500">*</span>
          </p>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            <label class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
              <input v-model="localContractForm.work_monday" type="checkbox" :disabled="isSubmitting" />
              <span>Monday</span>
            </label>

            <label class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
              <input v-model="localContractForm.work_tuesday" type="checkbox" :disabled="isSubmitting" />
              <span>Tuesday</span>
            </label>

            <label class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
              <input v-model="localContractForm.work_wednesday" type="checkbox" :disabled="isSubmitting" />
              <span>Wednesday</span>
            </label>

            <label class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
              <input v-model="localContractForm.work_thursday" type="checkbox" :disabled="isSubmitting" />
              <span>Thursday</span>
            </label>

            <label class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
              <input v-model="localContractForm.work_friday" type="checkbox" :disabled="isSubmitting" />
              <span>Friday</span>
            </label>

            <label class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
              <input v-model="localContractForm.work_saturday" type="checkbox" :disabled="isSubmitting" />
              <span>Saturday</span>
            </label>

            <label class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
              <input v-model="localContractForm.work_sunday" type="checkbox" :disabled="isSubmitting" />
              <span>Sunday</span>
            </label>
          </div>
        </div>
      </div>

      <p
        v-if="localError || errorMessage"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ localError || errorMessage }}
      </p>

      <div class="flex flex-col items-end gap-3">
        <div class="flex justify-end gap-3">
          <RouterLink
            to="/employees"
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
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import type { UpdateEmployeePayload } from '../../api/employees'
import type { CreateContractPayload } from '../../api/contracts'

type EditableContractPayload = Omit<CreateContractPayload, 'employee_id'>

interface Props {
  form: UpdateEmployeePayload
  contractForm: EditableContractPayload
  isSubmitting: boolean
  errorMessage: string
  submitLabel: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [payload: { employee: UpdateEmployeePayload; contract: EditableContractPayload }]
}>()

const formRef = ref<HTMLFormElement | null>(null)
const localError = ref<string>('')

const localEmployeeForm = reactive<UpdateEmployeePayload>({
  first_name: props.form.first_name,
  last_name: props.form.last_name,
  phone_number: props.form.phone_number,
  active: props.form.active,
})

const localContractForm = reactive<EditableContractPayload>({
  weekly_hours: props.contractForm.weekly_hours,
  daily_hours: props.contractForm.daily_hours,
  min_days_off_per_week: props.contractForm.min_days_off_per_week,
  work_monday: props.contractForm.work_monday,
  work_tuesday: props.contractForm.work_tuesday,
  work_wednesday: props.contractForm.work_wednesday,
  work_thursday: props.contractForm.work_thursday,
  work_friday: props.contractForm.work_friday,
  work_saturday: props.contractForm.work_saturday,
  work_sunday: props.contractForm.work_sunday,
  has_fixed_schedule: props.contractForm.has_fixed_schedule,
  preferred_start_time: props.contractForm.preferred_start_time,
  preferred_end_time: props.contractForm.preferred_end_time,
  active: props.contractForm.active,
  start_date: props.contractForm.start_date,
  end_date: props.contractForm.end_date,
})

watch(
  () => props.form,
  (newForm) => {
    localEmployeeForm.first_name = newForm.first_name
    localEmployeeForm.last_name = newForm.last_name
    localEmployeeForm.phone_number = newForm.phone_number
    localEmployeeForm.active = newForm.active
  },
  { deep: true },
)

watch(
  () => props.contractForm,
  (newContract) => {
    localContractForm.weekly_hours = newContract.weekly_hours
    localContractForm.daily_hours = newContract.daily_hours
    localContractForm.min_days_off_per_week = newContract.min_days_off_per_week
    localContractForm.work_monday = newContract.work_monday
    localContractForm.work_tuesday = newContract.work_tuesday
    localContractForm.work_wednesday = newContract.work_wednesday
    localContractForm.work_thursday = newContract.work_thursday
    localContractForm.work_friday = newContract.work_friday
    localContractForm.work_saturday = newContract.work_saturday
    localContractForm.work_sunday = newContract.work_sunday
    localContractForm.has_fixed_schedule = newContract.has_fixed_schedule
    localContractForm.preferred_start_time = newContract.preferred_start_time
    localContractForm.preferred_end_time = newContract.preferred_end_time
    localContractForm.active = newContract.active
    localContractForm.start_date = newContract.start_date
    localContractForm.end_date = newContract.end_date
  },
  { deep: true },
)

function getDaysOffCount(): number {
  const workingDays = [
    localContractForm.work_monday,
    localContractForm.work_tuesday,
    localContractForm.work_wednesday,
    localContractForm.work_thursday,
    localContractForm.work_friday,
    localContractForm.work_saturday,
    localContractForm.work_sunday,
  ]

  return workingDays.filter((day) => !day).length
}

function validateForm(): boolean {
  localError.value = ''

  if (!formRef.value?.checkValidity()) {
    formRef.value?.reportValidity()
    return false
  }

  const daysOffCount = getDaysOffCount()

  if (daysOffCount === 7) {
    localError.value = 'At least one working day must be selected.'
    return false
  }

  if (localContractForm.min_days_off_per_week !== daysOffCount) {
    localError.value =
      'Minimum days off per week must match the number of non-working days selected.'
    return false
  }

  if (
    localContractForm.has_fixed_schedule &&
    (!localContractForm.preferred_start_time || !localContractForm.preferred_end_time)
  ) {
    localError.value =
      'Preferred start time and end time are required when fixed schedule is enabled.'
    return false
  }

  return true
}

function handleSubmit(): void {
  if (!validateForm()) {
    return
  }

  emit('submit', {
    employee: {
      first_name: localEmployeeForm.first_name,
      last_name: localEmployeeForm.last_name,
      phone_number: localEmployeeForm.phone_number,
      active: localEmployeeForm.active,
    },
    contract: {
      weekly_hours: localContractForm.weekly_hours,
      daily_hours: localContractForm.daily_hours,
      min_days_off_per_week: localContractForm.min_days_off_per_week,
      work_monday: localContractForm.work_monday,
      work_tuesday: localContractForm.work_tuesday,
      work_wednesday: localContractForm.work_wednesday,
      work_thursday: localContractForm.work_thursday,
      work_friday: localContractForm.work_friday,
      work_saturday: localContractForm.work_saturday,
      work_sunday: localContractForm.work_sunday,
      has_fixed_schedule: localContractForm.has_fixed_schedule,
      preferred_start_time: localContractForm.has_fixed_schedule
        ? localContractForm.preferred_start_time
        : null,
      preferred_end_time: localContractForm.has_fixed_schedule
        ? localContractForm.preferred_end_time
        : null,
      active: true,
      start_date: localContractForm.start_date || null,
      end_date: localContractForm.end_date || null,
    },
  })
}
</script>