<template>
  <AppShell
    title="Create employee"
    subtitle="Create an employee account and profile in a single operation."
  >
    <section class="mx-auto max-w-4xl">
      <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <form ref="formRef" class="space-y-8" @submit.prevent="handleSubmit">
          <div class="space-y-6">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Employee information</h2>
              <p class="mt-1 text-sm text-slate-500">
                Create the employee account and basic profile details.
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
                  v-model="form.first_name"
                  type="text"
                  required
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600"
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
                  v-model="form.last_name"
                  type="text"
                  required
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600"
                  :disabled="isSubmitting"
                />
              </div>

              <div>
                <label
                  for="email"
                  class="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email <span class="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600"
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
                  v-model="form.phone_number"
                  type="text"
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600"
                  :disabled="isSubmitting"
                />
              </div>

              <div>
                <label
                  for="password"
                  class="mb-2 block text-sm font-medium text-slate-700"
                >
                  Temporary password <span class="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  required
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600"
                  :disabled="isSubmitting"
                />
              </div>

              <div>
                <label
                  for="role"
                  class="mb-2 block text-sm font-medium text-slate-700"
                >
                  Role
                </label>
                <input
                  id="role"
                  value="employee"
                  type="text"
                  disabled
                  class="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
                />
              </div>

              <div class="flex items-end">
                <label class="flex items-center gap-3 text-sm text-slate-700">
                  <input
                    v-model="form.active"
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
                Define the employee availability and contract constraints.
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
                  v-model.number="form.contract.weekly_hours"
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
                  v-model.number="form.contract.daily_hours"
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
                  v-model.number="form.contract.min_days_off_per_week"
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
                  Contract start date <span class="text-red-500">*</span>
                </label>
                <input
                  id="start-date"
                  v-model="form.contract.start_date"
                  type="date"
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                  :disabled="isSubmitting"
                  required
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
                  v-model="form.contract.end_date"
                  type="date"
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                  :disabled="isSubmitting"
                />
              </div>

              <div class="flex items-end">
                <label class="flex items-center gap-3 text-sm text-slate-700">
                  <input
                    v-model="form.contract.has_fixed_schedule"
                    type="checkbox"
                    class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    :disabled="isSubmitting"
                  />
                  <span>Has fixed schedule</span>
                </label>
              </div>
            </div>

            <div
              v-if="form.contract.has_fixed_schedule"
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
                  v-model="form.contract.preferred_start_time"
                  type="time"
                  :required="form.contract.has_fixed_schedule"
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
                  v-model="form.contract.preferred_end_time"
                  type="time"
                  :required="form.contract.has_fixed_schedule"
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
                  <input
                    v-model="form.contract.work_monday"
                    type="checkbox"
                    :disabled="isSubmitting"
                  />
                  <span>Monday</span>
                </label>

                <label class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                  <input
                    v-model="form.contract.work_tuesday"
                    type="checkbox"
                    :disabled="isSubmitting"
                  />
                  <span>Tuesday</span>
                </label>

                <label class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                  <input
                    v-model="form.contract.work_wednesday"
                    type="checkbox"
                    :disabled="isSubmitting"
                  />
                  <span>Wednesday</span>
                </label>

                <label class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                  <input
                    v-model="form.contract.work_thursday"
                    type="checkbox"
                    :disabled="isSubmitting"
                  />
                  <span>Thursday</span>
                </label>

                <label class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                  <input
                    v-model="form.contract.work_friday"
                    type="checkbox"
                    :disabled="isSubmitting"
                  />
                  <span>Friday</span>
                </label>

                <label class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                  <input
                    v-model="form.contract.work_saturday"
                    type="checkbox"
                    :disabled="isSubmitting"
                  />
                  <span>Saturday</span>
                </label>

                <label class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                  <input
                    v-model="form.contract.work_sunday"
                    type="checkbox"
                    :disabled="isSubmitting"
                  />
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
                {{ isSubmitting ? 'Creating employee...' : 'Create employee' }}
              </button>
            </div>
          </div>
        </form>
      </section>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import AppShell from '../../components/layout/AppShell.vue'
import {
  createEmployeeOnboarding,
  type EmployeeOnboardingPayload,
} from '../../api/employees'
import { getBackendErrorMessage } from '../../utils/api'
import { useActivityStore } from '../../stores/activity'

const router = useRouter()

const formRef = ref<HTMLFormElement | null>(null)

const form = reactive<EmployeeOnboardingPayload>({
  email: '',
  password: '',
  role: 'employee',
  first_name: '',
  last_name: '',
  phone_number: '',
  active: true,
  contract: {
    weekly_hours: 40,
    daily_hours: 8,
    min_days_off_per_week: 2,
    work_monday: true,
    work_tuesday: true,
    work_wednesday: true,
    work_thursday: true,
    work_friday: true,
    work_saturday: false,
    work_sunday: false,
    has_fixed_schedule: false,
    preferred_start_time: null,
    preferred_end_time: null,
    active: true,
    start_date: null,
    end_date: null,
  },
})

const isSubmitting = ref<boolean>(false)
const errorMessage = ref<string>('')
const localError = ref<string>('')

const activityStore = useActivityStore()

function getDaysOffCount(): number {
  const workingDays = [
    form.contract.work_monday,
    form.contract.work_tuesday,
    form.contract.work_wednesday,
    form.contract.work_thursday,
    form.contract.work_friday,
    form.contract.work_saturday,
    form.contract.work_sunday,
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

  if (form.contract.min_days_off_per_week !== daysOffCount) {
    localError.value =
      'Minimum days off per week must match the number of non-working days selected.'
    return false
  }

  if (
    form.contract.has_fixed_schedule &&
    (!form.contract.preferred_start_time || !form.contract.preferred_end_time)
  ) {
    localError.value =
      'Preferred start time and end time are required when fixed schedule is enabled.'
    return false
  }

  return true
}

async function handleSubmit(): Promise<void> {
  errorMessage.value = ''
  localError.value = ''

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    const payload: EmployeeOnboardingPayload = {
      ...form,
      contract: {
        ...form.contract,
        preferred_start_time: form.contract.has_fixed_schedule
          ? form.contract.preferred_start_time
          : null,
        preferred_end_time: form.contract.has_fixed_schedule
          ? form.contract.preferred_end_time
          : null,
        start_date: form.contract.start_date || null,
        end_date: form.contract.end_date || null,
      },
    }

    await createEmployeeOnboarding(payload)

    activityStore.addActivity(
      `${form.first_name} ${form.last_name}`,
      'Employee created',
    )

    await router.push({ name: 'employees' })
  } catch (error: unknown) {
    errorMessage.value = getBackendErrorMessage(
      error,
      'Unable to create employee. Please review the form and try again.',
    )
  } finally {
    isSubmitting.value = false
  }
}
</script>