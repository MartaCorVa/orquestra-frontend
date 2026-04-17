<template>
  <AppShell
    title="Schedules"
    subtitle="Manage planning periods and access schedule generation."
  >
    <section class="space-y-6">
      <section
        class="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between"
      >
        <div class="inline-flex rounded-2xl border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            class="rounded-xl px-4 py-2 text-sm font-medium transition"
            :class="
              activeTab === 'table'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            "
            @click="activeTab = 'table'"
          >
            Table
          </button>

          <button
            type="button"
            class="rounded-xl px-4 py-2 text-sm font-medium transition"
            :class="
              activeTab === 'calendar'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            "
            @click="activeTab = 'calendar'"
          >
            Calendar
          </button>
        </div>

        <RouterLink
          v-if="isAdmin"
          to="/schedules/new"
          class="inline-flex items-center justify-center rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          Create schedule
        </RouterLink>
      </section>

      <FiltersPanel v-if="activeTab === 'table'">
        <div class="flex flex-col gap-2">
          <label for="schedule-start-date" class="text-sm font-medium text-slate-700">
            Start date
          </label>
          <input
            id="schedule-start-date"
            v-model="selectedStartDate"
            type="date"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="schedule-end-date" class="text-sm font-medium text-slate-700">
            End date
          </label>
          <input
            id="schedule-end-date"
            v-model="selectedEndDate"
            type="date"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="schedule-status" class="text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="schedule-status"
            v-model="selectedStatus"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500"
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="generated">Generated</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            type="button"
            :disabled="!selectedStartDate && !selectedEndDate && selectedStatus === 'all'"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="clearFilters"
          >
            Clear filters
          </button>
        </div>
      </FiltersPanel>

      <section
        v-if="activeTab === 'table'"
        class="rounded-3xl border border-slate-200 bg-white shadow-sm"
      >
        <div v-if="isLoading" class="p-6 text-sm text-slate-500">
          Loading schedules...
        </div>

        <div v-else-if="hasError" class="p-6">
          <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to load schedules.
          </div>
        </div>

        <div v-else-if="filteredSchedules.length === 0" class="p-6 text-sm text-slate-500">
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
                v-for="schedule in filteredSchedules"
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

      <SchedulesCalendar
        v-else
        :schedules="schedules"
        :is-loading="isLoading"
        :has-error="hasError"
      />

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
import { storeToRefs } from 'pinia'

import AppShell from '../../components/layout/AppShell.vue'
import FiltersPanel from '../../components/filters/FiltersPanel.vue'
import SchedulesCalendar from '../../components/schedules/SchedulesCalendar.vue'
import {
  generatePlanning,
  getSchedules,
  type Schedule,
} from '../../api/schedules'
import { getBackendErrorMessage } from '../../utils/api'
import { useAuthStore } from '../../stores/auth'

type SchedulesTab = 'table' | 'calendar'
type ScheduleStatusFilter = 'all' | 'draft' | 'generated' | 'published'

const activeTab = ref<SchedulesTab>('table')

const schedules = ref<Schedule[]>([])
const isLoading = ref<boolean>(false)
const hasError = ref<boolean>(false)
const generatingScheduleId = ref<number | null>(null)
const tableMessage = ref<string>('')
const tableErrorMessage = ref<string>('')

const selectedStartDate = ref<string>('')
const selectedEndDate = ref<string>('')
const selectedStatus = ref<ScheduleStatusFilter>('all')

const authStore = useAuthStore()
const { userRole } = storeToRefs(authStore)

const isAdmin = computed(() => userRole.value === 'admin')

const filteredSchedules = computed<Schedule[]>(() => {
  let result = [...schedules.value]

  if (selectedStartDate.value) {
    result = result.filter((schedule) => schedule.end_date >= selectedStartDate.value)
  }

  if (selectedEndDate.value) {
    result = result.filter((schedule) => schedule.start_date <= selectedEndDate.value)
  }

  if (selectedStatus.value !== 'all') {
    result = result.filter((schedule) => schedule.status === selectedStatus.value)
  }

  return result
})

function clearFilters(): void {
  selectedStartDate.value = ''
  selectedEndDate.value = ''
  selectedStatus.value = 'all'
}

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