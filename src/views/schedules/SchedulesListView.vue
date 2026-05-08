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

      <FiltersPanel>
        <div class="flex flex-col gap-2">
          <label for="schedule-start-date" class="text-sm font-medium text-slate-700">
            Start date
          </label>
          <input
            id="schedule-start-date"
            v-model="selectedStartDate"
            type="date"
            :max="selectedEndDate || undefined"
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
            :min="selectedStartDate || undefined"
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

      <p
        v-if="isInvalidDateRange"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        Start date cannot be later than end date.
      </p>

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
              <template
                v-for="schedule in filteredSchedules"
                :key="schedule.id"
              >
                <tr class="border-b border-slate-100 last:border-b-0">
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
                        v-if="isAdmin && schedule.status !== 'published'"
                        type="button"
                        class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                        :disabled="generatingScheduleId === schedule.id"
                        @click="handleGenerate(schedule)"
                      >
                        {{
                          generatingScheduleId === schedule.id
                            ? 'Generating...'
                            : schedule.status === 'generated'
                              ? 'Regenerate planning'
                              : 'Generate planning'
                        }}
                      </button>
                    
                      <button
                        v-if="isAdmin && schedule.status === 'generated'"
                        type="button"
                        class="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        :disabled="publishingScheduleId === schedule.id"
                        @click="handlePublish(schedule)"
                      >
                        {{ publishingScheduleId === schedule.id ? 'Publishing...' : 'Publish' }}
                      </button>
                    
                      <button
                        v-if="planningResultsStore.getResult(schedule.id)"
                        type="button"
                        class="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                        @click="expandedScheduleId = expandedScheduleId === schedule.id ? null : schedule.id"
                      >
                        {{ expandedScheduleId === schedule.id ? 'Hide planning details' : 'Show planning details' }}
                      </button>
                    </div>
                  </td>
                </tr>
              
                <tr
                  v-if="expandedScheduleId === schedule.id && planningResultsStore.getResult(schedule.id)"
                  class="border-b border-slate-100 bg-slate-50"
                >
                  <td colspan="5" class="px-6 py-5">
                    <section class="rounded-2xl border border-slate-200 bg-white p-5">
                      <div class="flex items-start justify-between gap-4">
                        <div>
                          <h3 class="text-sm font-semibold text-slate-900">
                            Planning generation result
                          </h3>
                          <p class="mt-1 text-sm text-slate-600">
                            {{ planningResultsStore.getResult(schedule.id)?.message }}
                          </p>
                        </div>
                      
                        <button
                          type="button"
                          class="text-sm font-medium text-slate-500 hover:text-slate-700"
                          @click="expandedScheduleId = null"
                        >
                          Close
                        </button>
                      </div>
                    
                      <div class="mt-5 grid gap-4 md:grid-cols-4">
                        <article class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <p class="text-xs text-slate-500">Assignments</p>
                          <p class="mt-2 text-xl font-semibold text-slate-900">
                            {{ planningResultsStore.getResult(schedule.id)?.assignments_created?.length ?? 0 }}
                          </p>
                        </article>
                      
                        <article class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <p class="text-xs text-slate-500">Unfilled shifts</p>
                          <p class="mt-2 text-xl font-semibold text-slate-900">
                            {{ planningResultsStore.getResult(schedule.id)?.unfilled_shifts?.length ?? 0 }}
                          </p>
                        </article>
                      
                        <article class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <p class="text-xs text-slate-500">Employees below target</p>
                          <p class="mt-2 text-xl font-semibold text-slate-900">
                            {{ planningResultsStore.getResult(schedule.id)?.employees_below_target?.length ?? 0 }}
                          </p>
                        </article>
                      
                        <article class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <p class="text-xs text-slate-500">Missing hours</p>
                          <p class="mt-2 text-xl font-semibold text-slate-900">
                            {{ planningResultsStore.getResult(schedule.id)?.missing_contract_hours_total ?? 0 }}h
                          </p>
                        </article>
                      </div>
                      <div
                        v-if="(planningResultsStore.getResult(schedule.id)?.employees_below_target?.length ?? 0) > 0"
                        class="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4"
                      >
                        <h4 class="text-sm font-semibold text-amber-900">
                          Employees below contract target
                        </h4>
                      
                        <div class="mt-3 grid gap-3">
                          <article
                            v-for="employee in planningResultsStore.getResult(schedule.id)?.employees_below_target ?? []"
                            :key="employee.employee_id"
                            class="rounded-xl border border-amber-100 bg-white px-4 py-3 text-sm"
                          >
                            <p class="font-medium text-slate-900">
                              {{ employee.employee_name }}
                            </p>
                          
                            <p class="mt-1 text-slate-600">
                              Assigned {{ employee.assigned_hours }}h of {{ employee.contract_hours }}h.
                              Missing {{ employee.missing_hours }}h.
                            </p>
                          </article>
                        </div>
                      </div>
                    </section>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>

      <SchedulesCalendar
        v-else
        :schedules="filteredSchedules"
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
  getScheduleById,
  getSchedules,
  updateSchedule,
  type Schedule,
} from '../../api/schedules'
import { useActivityStore } from '../../stores/activity'
import { getBackendErrorMessage } from '../../utils/api'
import { useAuthStore } from '../../stores/auth'
import { usePlanningResultsStore } from '../../stores/planningResults'

type SchedulesTab = 'table' | 'calendar'
type ScheduleStatusFilter = 'all' | 'draft' | 'generated' | 'published'

const activeTab = ref<SchedulesTab>('table')

const schedules = ref<Schedule[]>([])
const isLoading = ref<boolean>(false)
const hasError = ref<boolean>(false)
const generatingScheduleId = ref<number | null>(null)
const tableMessage = ref<string>('')
const tableErrorMessage = ref<string>('')
const activityStore = useActivityStore()
const publishingScheduleId = ref<number | null>(null)
const expandedScheduleId = ref<number | null>(null)
const planningResultsStore = usePlanningResultsStore()

const selectedStartDate = ref<string>('')
const selectedEndDate = ref<string>('')
const selectedStatus = ref<ScheduleStatusFilter>('all')

const authStore = useAuthStore()
const { userRole } = storeToRefs(authStore)

const isAdmin = computed(() => userRole.value === 'admin')

const filteredSchedules = computed<Schedule[]>(() => {
  if (isInvalidDateRange.value) {
    return []
  }

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

const isInvalidDateRange = computed(() => {
  if (!selectedStartDate.value || !selectedEndDate.value) {
    return false
  }

  return selectedStartDate.value > selectedEndDate.value
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

async function canGeneratePlanning(scheduleId: number): Promise<boolean> {
  const scheduleDetail = await getScheduleById(scheduleId)

  if (scheduleDetail.shifts.length === 0) {
    tableErrorMessage.value =
      'Planning cannot be generated because this schedule has no shifts.'
    return false
  }

  return true
}

async function canPublishSchedule(scheduleId: number): Promise<boolean> {
  const scheduleDetail = await getScheduleById(scheduleId)

  const hasEmptyShifts = scheduleDetail.shifts.some(
    (shift) => shift.assignments.length === 0,
  )

  if (hasEmptyShifts) {
    tableErrorMessage.value =
      'Schedule cannot be published because there are shifts without assigned employees.'
    return false
  }

  return true
}

async function handleGenerate(schedule: Schedule): Promise<void> {
  generatingScheduleId.value = schedule.id
  tableMessage.value = ''
  tableErrorMessage.value = ''

  try {
    const canGenerate = await canGeneratePlanning(schedule.id)

    if (!canGenerate) {
      return
    }

    const result = await generatePlanning(schedule.id)
    planningResultsStore.setResult(schedule.id, result)
    expandedScheduleId.value = schedule.id

    await updateSchedule(schedule.id, {
      status: 'generated',
    })

    activityStore.addActivity(
      `${formatDate(schedule.start_date)} - ${formatDate(schedule.end_date)}`,
      schedule.status === 'generated'
        ? 'Planning regenerated'
        : 'Planning generated',
    )

    tableMessage.value = result.message || 'Planning generated successfully.'
    await loadSchedules()
  } catch (error: unknown) {
    tableErrorMessage.value = getBackendErrorMessage(
      error,
      'Unable to generate planning. Please try again.',
    )
  } finally {
    generatingScheduleId.value = null
  }
}

async function handlePublish(schedule: Schedule): Promise<void> {
  const canPublish = await canPublishSchedule(schedule.id)

  if (!canPublish) {
    return
  }
  
  const confirmed = globalThis.confirm(
    'The schedule status will change to published and planning cannot be regenerated. Are you sure you want to continue?',
  )

  if (!confirmed) {
    return
  }

  publishingScheduleId.value = schedule.id
  tableMessage.value = ''
  tableErrorMessage.value = ''

  try {
    await updateSchedule(schedule.id, {
      status: 'published',
    })

    activityStore.addActivity(
      `${formatDate(schedule.start_date)} - ${formatDate(schedule.end_date)}`,
      'Schedule published',
    )

    tableMessage.value = 'Schedule published successfully.'
    await loadSchedules()
  } catch (error: unknown) {
    tableErrorMessage.value = getBackendErrorMessage(
      error,
      'Unable to publish schedule. Please try again.',
    )
  } finally {
    publishingScheduleId.value = null
  }
}

onMounted(() => {
  void loadSchedules()
})
</script>