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
                Start date <span class="text-red-500">*</span>
              </label>
              <input
                id="start-date"
                v-model="form.start_date"
                type="date"
                required
                :max="form.end_date || undefined"
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
                v-model="form.end_date"
                type="date"
                required
                :min="form.start_date || undefined"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                :disabled="isSubmitting"
              />
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
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import AppShell from '../../components/layout/AppShell.vue'
import { createSchedule, type CreateSchedulePayload } from '../../api/schedules'
import { getBackendErrorMessage } from '../../utils/api'
import { useActivityStore } from '../../stores/activity'

const router = useRouter()

const form = reactive<CreateSchedulePayload>({
  start_date: '',
  end_date: '',
  status: 'draft',
})

const isSubmitting = ref<boolean>(false)
const errorMessage = ref<string>('')
const activityStore = useActivityStore()

const isInvalidDateRange = computed(() => {
  if (!form.start_date || !form.end_date) {
    return false
  }

  return form.start_date > form.end_date
})

function validateForm(): boolean {
  errorMessage.value = ''

  if (!form.start_date) {
    errorMessage.value = 'Start date is required.'
    return false
  }

  if (!form.end_date) {
    errorMessage.value = 'End date is required.'
    return false
  }

  if (isInvalidDateRange.value) {
    errorMessage.value = 'Start date cannot be later than end date.'
    return false
  }

  return true
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

async function handleSubmit(): Promise<void> {
  errorMessage.value = ''

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    const schedule = await createSchedule({
      start_date: form.start_date,
      end_date: form.end_date,
      status: 'draft',
    })

    activityStore.addActivity(
      'Schedule created',
      `${formatDate(form.start_date)} - ${formatDate(form.end_date)}`,
    )

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