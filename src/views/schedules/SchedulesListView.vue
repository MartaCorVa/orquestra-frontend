<template>
  <AppShell
    title="Schedules"
    subtitle="Manage planning periods and access schedule generation."
  >
    <section class="space-y-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:justify-end">
        <div class="flex gap-3">
          <RouterLink
            v-if="isAdmin"
            to="/schedules/new"
            class="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Create schedule
          </RouterLink>
        </div>
      </div>

      <section class="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div v-if="isLoading" class="p-6 text-sm text-slate-500">
          Loading schedules...
        </div>

        <div v-else-if="hasError" class="p-6">
          <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to load schedules.
          </div>
        </div>

        <div v-else-if="schedules.length === 0" class="p-6 text-sm text-slate-500">
          No schedules found.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full border-collapse text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                <th class="px-6 py-4 font-semibold">Start date</th>
                <th class="px-6 py-4 font-semibold">End date</th>
                <th class="px-6 py-4 font-semibold">Status</th>
                <th class="px-6 py-4 font-semibold">Created</th>
                <th class="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="schedule in schedules"
                :key="schedule.id"
                class="border-b border-slate-100 last:border-b-0"
              >
                <td class="px-6 py-4 text-slate-900">
                  {{ formatDate(schedule.start_date) }}
                </td>

                <td class="px-6 py-4 text-slate-900">
                  {{ formatDate(schedule.end_date) }}
                </td>

                <td class="px-6 py-4">
                  <span class="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {{ schedule.status }}
                  </span>
                </td>

                <td class="px-6 py-4 text-slate-600">
                  {{ formatDateTime(schedule.created_at) }}
                </td>

                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-2">
                    <RouterLink
                      :to="`/schedules/${schedule.id}`"
                      class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      View
                    </RouterLink>

                    <button
                      v-if="isAdmin"
                      type="button"
                      class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                      :disabled="generatingScheduleId === schedule.id"
                      @click="handleGenerate(schedule.id)"
                    >
                      {{
                        generatingScheduleId === schedule.id
                          ? 'Generating...'
                          : 'Generate planning'
                      }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p
        v-if="tableMessage"
        class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
      >
        {{ tableMessage }}
      </p>

      <p
        v-if="tableErrorMessage"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ tableErrorMessage }}
      </p>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import dayjs from 'dayjs'

import AppShell from '../../components/layout/AppShell.vue'
import {
  generatePlanning,
  getSchedules,
  type Schedule,
} from '../../api/schedules'
import { getBackendErrorMessage } from '../../utils/api'
import { useAuthStore } from '../../stores/auth'
import { storeToRefs } from 'pinia'

const schedules = ref<Schedule[]>([])
const isLoading = ref<boolean>(false)
const hasError = ref<boolean>(false)
const generatingScheduleId = ref<number | null>(null)
const tableMessage = ref<string>('')
const tableErrorMessage = ref<string>('')

const authStore = useAuthStore()
const { userRole } = storeToRefs(authStore)

const isAdmin = computed(() => userRole.value === 'admin')

function formatDate(value: string): string {
  return dayjs(value).format('DD/MM/YYYY')
}

function formatDateTime(value: string): string {
  return dayjs(value).format('DD/MM/YYYY HH:mm')
}

async function loadSchedules(): Promise<void> {
  isLoading.value = true
  hasError.value = false

  try {
    schedules.value = await getSchedules()
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

async function handleGenerate(scheduleId: number): Promise<void> {
  generatingScheduleId.value = scheduleId
  tableMessage.value = ''
  tableErrorMessage.value = ''

  try {
    await generatePlanning(scheduleId, { employees_per_shift: 1 })
    tableMessage.value = 'Planning generated successfully.'
  } catch (error: unknown) {
    tableErrorMessage.value = getBackendErrorMessage(
      error,
      'Unable to generate planning. Please try again.',
    )
  } finally {
    generatingScheduleId.value = null
  }
}

onMounted(() => {
  void loadSchedules()
})
</script>