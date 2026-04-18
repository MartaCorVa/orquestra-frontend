<template>
  <AppShell
    title="Create employee"
    subtitle="Create an employee account and profile in a single operation."
  >
    <section class="mx-auto max-w-4xl">
      <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <label
                for="first-name"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                First name
              </label>
              <input
                id="first-name"
                v-model="form.first_name"
                type="text"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600"
                :disabled="isSubmitting"
              />
            </div>

            <div>
              <label
                for="last-name"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                Last name
              </label>
              <input
                id="last-name"
                v-model="form.last_name"
                type="text"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600"
                :disabled="isSubmitting"
              />
            </div>

            <div>
              <label
                for="email"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
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
                Temporary password
              </label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600"
                :disabled="isSubmitting"
              />
            </div>

            <div>
              <label
                for="max-weekly-hours"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                Max weekly hours
              </label>
              <input
                id="max-weekly-hours"
                v-model.number="form.max_weekly_hours"
                type="number"
                min="1"
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

          <p
            v-if="errorMessage"
            class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {{ errorMessage }}
          </p>

          <p
            v-if="successMessage"
            class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {{ successMessage }}
          </p>

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

const router = useRouter()

const form = reactive<EmployeeOnboardingPayload>({
  email: '',
  password: '',
  role: 'employee',
  first_name: '',
  last_name: '',
  phone_number: '',
  max_weekly_hours: 40,
  active: true,
})

const isSubmitting = ref<boolean>(false)
const errorMessage = ref<string>('')
const successMessage = ref<string>('')

async function handleSubmit(): Promise<void> {
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await createEmployeeOnboarding(form)
    successMessage.value = 'Employee created successfully.'

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