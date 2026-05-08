<template>
  <AppShell
    title="Employees"
    subtitle="Manage employee accounts, working conditions, and activation status."
  >
    <section class="space-y-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:justify-end">
        <div class="flex gap-3">
          <RouterLink
            to="/employees/new"
            class="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Add employee
          </RouterLink>
        </div>
      </div>

      <FiltersPanel>
        <div class="flex flex-col gap-2">
          <label for="employee-search" class="text-sm font-medium text-slate-700">
            Search
          </label>
          <input
            id="employee-search"
            v-model="searchQuery"
            type="text"
            placeholder="Search by name..."
            class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="employee-status" class="text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="employee-status"
            v-model="statusFilter"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div class="flex flex-col gap-2">
          <label for="employee-weekly-hours" class="text-sm font-medium text-slate-700">
            Contract weekly hours
          </label>
          <select
            id="employee-weekly-hours"
            v-model="weeklyHoursFilter"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500"
          >
            <option value="">Any</option>
            <option
              v-for="hours in weeklyHoursOptions"
              :key="hours"
              :value="String(hours)"
            >
              {{ hours }}
            </option>
          </select>
        </div>

        <div class="flex flex-col gap-2">
          <label for="employee-sort" class="text-sm font-medium text-slate-700">
            Sort by
          </label>
          <select
            id="employee-sort"
            v-model="sortBy"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500"
          >
            <option value="name">Name</option>
            <option value="status">Status</option>
            <option value="weeklyHours">Contract weekly hours</option>
            <option value="createdAt">Created</option>
          </select>
        </div>
      </FiltersPanel>

      <section class="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div v-if="isLoading" class="p-6 text-sm text-slate-500">
          Loading employees...
        </div>

        <div
          v-else-if="hasError"
          class="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm"
        >
          <p class="text-sm text-red-700">Failed to load employee data.</p>

          <div class="mt-4">
            <RouterLink
              to="/employees"
              class="rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
            >
              Back to employees
            </RouterLink>
          </div>
        </div>

        <div v-else-if="tableErrorMessage" class="p-6">
          <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ tableErrorMessage }}
          </div>
        </div>

        <div v-else-if="filteredEmployees.length === 0" class="p-6 text-sm text-slate-500">
          No employees found.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full border-collapse text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                <th class="px-6 py-4 font-semibold">Name</th>
                <th class="px-6 py-4 font-semibold">Phone</th>
                <th class="px-6 py-4 font-semibold">Contract weekly hours</th>
                <th class="px-6 py-4 font-semibold w-[120px]">Status</th>
                <th class="px-6 py-4 font-semibold">Created</th>
                <th class="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              <template v-for="employee in filteredEmployees" :key="employee.id">
                <tr class="border-b border-slate-100 transition-colors hover:bg-slate-50/60">
                  <td class="px-6 py-3 font-medium text-slate-900">
                    <button
                      type="button"
                      class="flex items-center gap-2 text-left transition hover:text-blue-700"
                      @click="toggleExpanded(employee.id)"
                    >
                      <span
                        class="inline-block text-slate-400 transition-all duration-200"
                        :class="expandedEmployeeId === employee.id ? 'text-blue-600' : ''"
                      >
                        {{ expandedEmployeeId === employee.id ? '▾' : '▸' }}
                      </span>
                      <span>{{ employee.first_name }} {{ employee.last_name }}</span>
                    </button>
                  </td>

                  <td class="px-6 py-3 text-slate-600">
                    {{ employee.phone_number || '-' }}
                  </td>

                  <td class="px-6 py-3 text-slate-600">
                    {{ getWeeklyHoursLabel(employee.id) }}
                  </td>

                  <td class="px-6 py-3 w-[120px]">
                    <span
                      class="inline-flex w-[80px] justify-center rounded-full px-2 py-1 text-xs font-semibold"
                      :class="
                        employee.active
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      "
                    >
                      {{ employee.active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>

                  <td class="px-6 py-3 text-slate-600">
                    {{ formatDate(employee.created_at) }}
                  </td>

                  <td class="px-6 py-3">
                    <div class="flex flex-wrap gap-2">
                      <RouterLink
                        :to="`/employees/${employee.id}/edit`"
                        class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Edit
                      </RouterLink>

                      <button
                        type="button"
                        class="w-[90px] rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                        :disabled="updatingEmployeeId === employee.id"
                        @click="handleToggleActive(employee)"
                      >
                        {{
                          updatingEmployeeId === employee.id
                            ? 'Updating...'
                            : employee.active
                              ? 'Deactivate'
                              : 'Activate'
                        }}
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="expandedEmployeeId === employee.id" class="border-b border-slate-100 bg-transparent">
                  <td colspan="6" class="px-4 pb-4 pt-0">
                    <div v-if="contractLoadingMap[employee.id]" class="px-2 py-3 text-sm text-slate-500">
                      Loading current contract...
                    </div>

                    <div
                      v-else
                      class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60"
                    >
                      <div
                        class="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-3.5 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div class="flex items-start gap-4">
                          <div
                            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-sm font-semibold text-blue-700"
                          >
                            {{ employee.first_name.charAt(0) }}{{ employee.last_name.charAt(0) }}
                          </div>

                          <div class="space-y-1">
                            <div class="flex flex-wrap items-center gap-2">
                              <h3 class="text-base font-semibold text-slate-900">
                                {{ employee.first_name }} {{ employee.last_name }}
                              </h3>

                              <span
                                class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                                :class="
                                  employee.active
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-red-100 text-red-700'
                                "
                              >
                                {{ employee.active ? 'Active' : 'Inactive' }}
                              </span>
                            </div>

                            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                              <span>{{ employee.phone_number || 'No phone number' }}</span>
                              <span>Created {{ formatDate(employee.created_at) }}</span>
                            </div>
                          </div>
                        </div>

                        <div
                          v-if="activeContractMap[employee.id]"
                          class="grid grid-cols-2 gap-3 sm:grid-cols-3"
                        >
                          <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Weekly
                            </p>
                            <p class="mt-1 text-sm font-semibold text-slate-900">
                              {{ activeContractMap[employee.id]?.weekly_hours }} h
                            </p>
                          </div>

                          <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Daily
                            </p>
                            <p class="mt-1 text-sm font-semibold text-slate-900">
                              {{ activeContractMap[employee.id]?.daily_hours }} h
                            </p>
                          </div>

                          <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Days off
                            </p>
                            <p class="mt-1 text-sm font-semibold text-slate-900">
                              {{ activeContractMap[employee.id]?.min_days_off_per_week }}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div class="grid gap-5 px-5 py-4 lg:grid-cols-[1.1fr_1.4fr]">
                        <section class="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                          <h4 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Employee details
                          </h4>

                          <dl class="space-y-3 text-sm">
                            <div class="flex items-start justify-between gap-4 border-b border-slate-200 pb-2 last:border-b-0 last:pb-0">
                              <dt class="text-slate-500">Full name</dt>
                              <dd class="text-right font-medium text-slate-900">
                                {{ employee.first_name }} {{ employee.last_name }}
                              </dd>
                            </div>

                            <div class="flex items-start justify-between gap-4 border-b border-slate-200 pb-2 last:border-b-0 last:pb-0">
                              <dt class="text-slate-500">Phone</dt>
                              <dd class="text-right font-medium text-slate-900">
                                {{ employee.phone_number || '-' }}
                              </dd>
                            </div>

                            <div class="flex items-start justify-between gap-4 border-b border-slate-200 pb-2 last:border-b-0 last:pb-0">
                              <dt class="text-slate-500">Status</dt>
                              <dd class="text-right font-medium text-slate-900">
                                {{ employee.active ? 'Active' : 'Inactive' }}
                              </dd>
                            </div>

                            <div class="flex items-start justify-between gap-4">
                              <dt class="text-slate-500">Created at</dt>
                              <dd class="text-right font-medium text-slate-900">
                                {{ formatDate(employee.created_at) }}
                              </dd>
                            </div>
                          </dl>
                        </section>

                        <section class="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                          <h4 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Current contract
                          </h4>

                          <div v-if="!activeContractMap[employee.id]" class="text-sm text-slate-500">
                            No active contract found.
                          </div>

                          <div v-else class="space-y-4">
                            <div>
                              <p class="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                                Working days
                              </p>

                              <div class="flex flex-wrap gap-2">
                                <span
                                  v-for="day in getWorkingDayBadges(activeContractMap[employee.id])"
                                  :key="day"
                                  class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100"
                                >
                                  {{ day }}
                                </span>
                              </div>
                            </div>

                            <dl class="grid gap-3 text-sm sm:grid-cols-2">
                              <div class="rounded-xl border border-slate-200 bg-white px-3 py-3">
                                <dt class="text-slate-500">Fixed schedule</dt>
                                <dd class="mt-1 font-medium text-slate-900">
                                  {{
                                    activeContractMap[employee.id]?.has_fixed_schedule
                                      ? `${activeContractMap[employee.id]?.preferred_start_time} - ${activeContractMap[employee.id]?.preferred_end_time}`
                                      : 'No'
                                  }}
                                </dd>
                              </div>

                              <div class="rounded-xl border border-slate-200 bg-white px-3 py-3">
                                <dt class="text-slate-500">Contract period</dt>
                                <dd class="mt-1 font-medium text-slate-900">
                                  {{ formatContractPeriod(activeContractMap[employee.id]) }}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </section>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import dayjs from 'dayjs'

import AppShell from '../../components/layout/AppShell.vue'
import {
  getEmployees,
  updateEmployee,
  type Employee,
} from '../../api/employees'
import {
  getActiveContractByEmployee,
  type Contract,
} from '../../api/contracts'
import { getBackendErrorMessage } from '../../utils/api'
import FiltersPanel from '../../components/filters/FiltersPanel.vue'

const employees = ref<Employee[]>([])
const isLoading = ref<boolean>(false)
const hasError = ref<boolean>(false)
const updatingEmployeeId = ref<number | null>(null)
const tableErrorMessage = ref<string>('')

const expandedEmployeeId = ref<number | null>(null)
const activeContractMap = ref<Record<number, Contract | null>>({})
const contractLoadingMap = ref<Record<number, boolean>>({})

const searchQuery = ref<string>('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
const weeklyHoursFilter = ref<string>('')
const sortBy = ref<'name' | 'status' | 'weeklyHours' | 'createdAt'>('name')

const weeklyHoursOptions = computed(() => {
  const hours = employees.value
    .map((employee) => activeContractMap.value[employee.id]?.weekly_hours)
    .filter((value): value is number => typeof value === 'number')

  return Array.from(new Set(hours)).sort((a, b) => a - b)
})

function matchesEmployeeStatus(employee: Employee): boolean {
  if (statusFilter.value === 'all') {
    return true
  }

  if (statusFilter.value === 'active') {
    return employee.active
  }

  return !employee.active
}

const filteredEmployees = computed(() => {
  const result = [...employees.value]

  const filtered = result.filter((employee) => {
    const matchesQuery = searchQuery.value.trim()
      ? `${employee.first_name} ${employee.last_name}`
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase())
      : true

    const matchesStatus = matchesEmployeeStatus(employee)

    const matchesWeeklyHours =
      weeklyHoursFilter.value === ''
        ? true
        : activeContractMap.value[employee.id]?.weekly_hours === Number(weeklyHoursFilter.value)

    return matchesQuery && matchesStatus && matchesWeeklyHours
  })

  filtered.sort((a, b) => {
    let valueA: string | number | boolean = ''
    let valueB: string | number | boolean = ''

    switch (sortBy.value) {
      case 'name':
        valueA = `${a.first_name} ${a.last_name}`
        valueB = `${b.first_name} ${b.last_name}`
        break
      case 'status':
        valueA = a.active
        valueB = b.active
        break
      case 'weeklyHours':
        valueA = activeContractMap.value[a.id]?.weekly_hours ?? -1
        valueB = activeContractMap.value[b.id]?.weekly_hours ?? -1
        break
      case 'createdAt':
        valueA = a.created_at
        valueB = b.created_at
        break
    }

    if (valueA < valueB) return -1
    if (valueA > valueB) return 1
    return 0
  })

  return filtered
})

function formatDate(value: string): string {
  return dayjs(value).format('DD/MM/YYYY HH:mm')
}

function getWeeklyHoursLabel(employeeId: number): string {
  const contract = activeContractMap.value[employeeId]
  return contract ? `${contract.weekly_hours} h` : '-'
}

function getWorkingDayBadges(contract: Contract | null | undefined): string[] {
  if (!contract) return []

  const days: string[] = []

  if (contract.work_monday) days.push('Mon')
  if (contract.work_tuesday) days.push('Tue')
  if (contract.work_wednesday) days.push('Wed')
  if (contract.work_thursday) days.push('Thu')
  if (contract.work_friday) days.push('Fri')
  if (contract.work_saturday) days.push('Sat')
  if (contract.work_sunday) days.push('Sun')

  return days
}

function formatContractPeriod(contract: Contract | null | undefined): string {
  if (!contract) return '-'

  const start = contract.start_date ? dayjs(contract.start_date).format('DD/MM/YYYY') : '-'
  const end = contract.end_date ? dayjs(contract.end_date).format('DD/MM/YYYY') : 'Open-ended'

  return `${start} - ${end}`
}

async function loadActiveContract(employeeId: number): Promise<void> {
  if (employeeId in activeContractMap.value) return

  contractLoadingMap.value[employeeId] = true

  try {
    activeContractMap.value[employeeId] = await getActiveContractByEmployee(employeeId)
  } catch {
    activeContractMap.value[employeeId] = null
  } finally {
    contractLoadingMap.value[employeeId] = false
  }
}

async function toggleExpanded(employeeId: number): Promise<void> {
  if (expandedEmployeeId.value === employeeId) {
    expandedEmployeeId.value = null
    return
  }

  expandedEmployeeId.value = employeeId
  await loadActiveContract(employeeId)
}

async function loadEmployees(): Promise<void> {
  isLoading.value = true
  hasError.value = false
  tableErrorMessage.value = ''

  try {
    employees.value = await getEmployees()

    await Promise.all(
      employees.value.map((employee) => loadActiveContract(employee.id)),
    )
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

async function handleToggleActive(employee: Employee): Promise<void> {
  updatingEmployeeId.value = employee.id
  tableErrorMessage.value = ''

  try {
    await updateEmployee(employee.id, {
      first_name: employee.first_name,
      last_name: employee.last_name,
      phone_number: employee.phone_number,
      active: !employee.active,
    })

    employee.active = !employee.active
  } catch (error: unknown) {
    tableErrorMessage.value = getBackendErrorMessage(
      error,
      'Unable to update employee status. Please try again.',
    )
  } finally {
    updatingEmployeeId.value = null
  }
}

onMounted(() => {
  void loadEmployees()
})
</script>