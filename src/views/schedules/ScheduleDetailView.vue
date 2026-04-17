<template>
  <AppShell
    title="Schedule detail"
    subtitle="Review the planning overview, shifts, and assignments."
  >
    <section class="space-y-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-slate-900">Schedule detail</h2>
          <p class="mt-2 text-sm text-slate-600">
            Inspect the selected schedule and its generated planning.
          </p>
        </div>

        <div class="flex gap-3">
          <RouterLink
            to="/schedules"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Back to schedules
          </RouterLink>

          <button
            v-if="isAdmin"
            type="button"
            class="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
            :disabled="isGenerating"
            @click="handleGenerate"
          >
            {{ isGenerating ? 'Generating...' : 'Generate planning' }}
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p class="text-sm text-slate-500">Loading schedule data...</p>
      </div>

      <div
        v-else-if="hasError"
        class="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm"
      >
        <p class="text-sm text-red-700">Failed to load schedule data.</p>
      </div>

      <template v-else-if="schedule">
        <section class="grid gap-6 xl:grid-cols-4">
          <article
            v-for="card in summaryCards"
            :key="card.label"
            class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p class="text-sm text-slate-500">{{ card.label }}</p>
            <p class="mt-3 text-2xl font-semibold text-slate-900">
              {{ card.value }}
            </p>
          </article>
        </section>

        <p
          v-if="message"
          class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {{ message }}
        </p>

        <p
          v-if="errorMessage"
          class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {{ errorMessage }}
        </p>

        <ScheduleFullCalendar :schedule="schedule" />
      </template>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'

import AppShell from '../../components/layout/AppShell.vue'
import ScheduleFullCalendar from '../../components/schedules/ScheduleDetailCalendar.vue'
import { useAuthStore } from '../../stores/auth'
import {
  generatePlanning,
  getScheduleById,
  type ScheduleDetail,
} from '../../api/schedules'
import { getBackendErrorMessage } from '../../utils/api'

interface SummaryCard {
  label: string
  value: string
}

const authStore = useAuthStore()
const { userRole } = storeToRefs(authStore)

const route = useRoute()

const isAdmin = computed(() => userRole.value === 'admin')
const scheduleId = computed<number>(() => Number(route.params.id))

const schedule = ref<ScheduleDetail | null>(null)

const isLoading = ref<boolean>(false)
const hasError = ref<boolean>(false)
const isGenerating = ref<boolean>(false)
const message = ref<string>('')
const errorMessage = ref<string>('')

const summaryCards = computed<SummaryCard[]>(() => {
  if (!schedule.value) {
    return []
  }

  return [
    {
      label: 'Start date',
      value: formatDate(schedule.value.start_date),
    },
    {
      label: 'End date',
      value: formatDate(schedule.value.end_date),
    },
    {
      label: 'Status',
      value: schedule.value.status,
    },
    {
      label: 'Shifts',
      value: String(schedule.value.shifts.length),
    },
  ]
})

function formatDate(value: string): string {
  return dayjs(value).format('DD/MM/YYYY')
}

async function loadScheduleDetail(): Promise<void> {
  isLoading.value = true
  hasError.value = false
  errorMessage.value = ''
  message.value = ''

  try {
    schedule.value = await getScheduleById(scheduleId.value)
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

async function handleGenerate(): Promise<void> {
  isGenerating.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    await generatePlanning(scheduleId.value, { employees_per_shift: 1 })
    message.value = 'Planning generated successfully.'
    await loadScheduleDetail()
  } catch (error: unknown) {
    errorMessage.value = getBackendErrorMessage(
      error,
      'Unable to generate planning. Please try again.',
    )
  } finally {
    isGenerating.value = false
  }
}

onMounted(() => {
  void loadScheduleDetail()
})
</script>