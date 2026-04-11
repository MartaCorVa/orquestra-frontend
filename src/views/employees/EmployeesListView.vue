<template>
  <AppShell
    title="Employees"
    subtitle="View, create, and manage employee records in the system."
  >
    <section class="space-y-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-slate-900">Employees</h2>
          <p class="mt-2 text-sm text-slate-600">
            Manage employee accounts, working limits, and activation status.
          </p>
        </div>

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
            Weekly hours
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
            <option value="weeklyHours">Weekly hours</option>
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
                <th class="px-6 py-4 font-semibold">Max weekly hours</th>
                <th class="px-6 py-4 font-semibold w-[120px]">Status</th>
                <th class="px-6 py-4 font-semibold">Created</th>
                <th class="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="employee in filteredEmployees"
                :key="employee.id"
                class="border-b border-slate-100 last:border-b-0"
              >
                <td class="px-6 py-4 font-medium text-slate-900">
                  {{ employee.first_name }} {{ employee.last_name }}
                </td>

                <td class="px-6 py-4 text-slate-600">
                  {{ employee.phone_number || '-' }}
                </td>

                <td class="px-6 py-4 text-slate-600">
                  {{ employee.max_weekly_hours }} h
                </td>

                <td class="px-6 py-4 w-[120px]">
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

                <td class="px-6 py-4 text-slate-600">
                  {{ formatDate(employee.created_at) }}
                </td>

                <td class="px-6 py-4">
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
import { getBackendErrorMessage } from '../../utils/api'

import FiltersPanel from '../../components/filters/FiltersPanel.vue'

const employees = ref<Employee[]>([])
const isLoading = ref<boolean>(false)
const hasError = ref<boolean>(false)
const updatingEmployeeId = ref<number | null>(null)
const tableErrorMessage = ref<string>('')

const searchQuery = ref<string>('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
const weeklyHoursFilter = ref<string>('') // string porque viene del select
const sortBy = ref<'name' | 'status' | 'weeklyHours' | 'createdAt'>('name')

const weeklyHoursOptions = computed(() => {
  const hours = employees.value.map((e) => e.max_weekly_hours)
  return Array.from(new Set(hours)).sort((a, b) => a - b)
})

const filteredEmployees = computed(() => {
  let result = [...employees.value]

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((e) =>
      `${e.first_name} ${e.last_name}`.toLowerCase().includes(query),
    )
  }

  if (statusFilter.value !== 'all') {
    result = result.filter((e) =>
      statusFilter.value === 'active' ? e.active : !e.active,
    )
  }

  if (weeklyHoursFilter.value !== '') {
    result = result.filter(
      (e) => e.max_weekly_hours === Number(weeklyHoursFilter.value),
    )
  }

  result.sort((a, b) => {
    let valueA: any
    let valueB: any

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
        valueA = a.max_weekly_hours
        valueB = b.max_weekly_hours
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

  return result
})

function formatDate(value: string): string {
  return dayjs(value).format('DD/MM/YYYY HH:mm')
}

async function loadEmployees(): Promise<void> {
  isLoading.value = true
  hasError.value = false
  tableErrorMessage.value = ''

  try {
    employees.value = await getEmployees()
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
      max_weekly_hours: employee.max_weekly_hours,
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