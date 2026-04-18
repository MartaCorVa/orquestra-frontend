<template>
  <AppShell
    title="Create schedule"
    subtitle="Create a new planning period before generating shifts."
  >
    <section class="mx-auto max-w-4xl">
      <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <label
                for="start-date"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                Start date
              </label>
              <input
                id="start-date"
                v-model="form.start_date"
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
                v-model="form.end_date"
                type="date"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                :disabled="isSubmitting"
              />
            </div>

            <div class="md:col-span-2">
              <label
                for="status"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                Status
              </label>
              <select
                id="status"
                v-model="form.status"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                :disabled="isSubmitting"
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="completed">completed</option>
              </select>
            </div>
          </div>

          <p
            v-if="errorMessage"
            class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {{ errorMessage }}
          </p>

          <div class="flex justify-end gap-3">
            <RouterLink
              to="/schedules"
              class="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </RouterLink>

            <button
              type="submit"
              class="rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Creating schedule...' : 'Create schedule' }}
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
import { createSchedule, type CreateSchedulePayload } from '../../api/schedules'
import { getBackendErrorMessage } from '../../utils/api'

const router = useRouter()

const form = reactive<CreateSchedulePayload>({
  start_date: '',
  end_date: '',
  status: 'draft',
})

const isSubmitting = ref<boolean>(false)
const errorMessage = ref<string>('')

async function handleSubmit(): Promise<void> {
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const schedule = await createSchedule(form)
    await router.push({ name: 'schedule-detail', params: { id: schedule.id } })
  } catch (error: unknown) {
    errorMessage.value = getBackendErrorMessage(
      error,
      'Unable to create schedule. Please review the form and try again.',
    )
  } finally {
    isSubmitting.value = false
  }
}
</script>