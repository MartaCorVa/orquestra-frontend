<template>
  <AppShell
    title="Shifts"
    subtitle="View, create, edit, and manage shifts."
  >
    <section class="space-y-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-slate-900">Shifts</h2>
          <p class="mt-2 text-sm text-slate-600">
            Review schedule shifts and manage manual entries.
          </p>
        </div>

        <RouterLink
          v-if="isAdmin"
          to="/shifts/new"
          class="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          Create shift
        </RouterLink>
      </div>

      <FiltersPanel>
        <div class="flex flex-col gap-2">
          <label for="shift-employee" class="text-sm font-medium text-slate-700">
            Employee
          </label>
          <select
            id="shift-employee"
            v-model="selectedEmployee"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500"
          >
            <option value="all">All employees</option>
            <option
              v-for="employee in employeeOptions"
              :key="employee.id"
              :value="employee.id"
            >
              {{ employee.name }}
            </option>
          </select>
        </div>
      
        <div class="flex flex-col gap-2">
          <label for="shift-date" class="text-sm font-medium text-slate-700">
            Date
          </label>
          <input
            id="shift-date"
            v-model="selectedDate"
            type="date"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500"
          />
        </div>
      
        <div class="flex flex-col gap-2">
          <label for="shift-status" class="text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="shift-status"
            v-model="selectedStatus"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500"
          >
            <option value="all">All</option>
            <option value="planned">Planned</option>
            <option value="assigned">Assigned</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      
        <div class="flex flex-col gap-2">
          <label for="shift-creation-type" class="text-sm font-medium text-slate-700">
            Creation type
          </label>
          <select
            id="shift-creation-type"
            v-model="selectedCreationType"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500"
          >
            <option value="all">All</option>
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
          </select>
        </div>
      </FiltersPanel>

      <section class="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div v-if="isLoading" class="p-6 text-sm text-slate-500">
          Loading shifts...
        </div>

        <div v-else-if="hasError" class="p-6">
          <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to load shifts.
          </div>
        </div>

        <div v-else-if="filteredShifts.length === 0" class="p-6 text-sm text-slate-500">
          No shifts found.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full border-collapse text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                <th class="px-6 py-4 font-semibold">Employee</th>
                <th class="px-6 py-4 font-semibold">Date</th>
                <th class="px-6 py-4 font-semibold">Start</th>
                <th class="px-6 py-4 font-semibold">End</th>
                <th class="px-6 py-4 font-semibold">Type</th>
                <th class="px-6 py-4 font-semibold">Status</th>
                <th v-if="isAdmin" class="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="shift in filteredShifts"
                :key="shift.id"
                class="border-b border-slate-100 last:border-b-0"
              >
                <td class="px-6 py-4 text-slate-900">
                  {{ shift.employee_name || 'Unassigned' }}
                </td>

                <td class="px-6 py-4 text-slate-900">
                  {{ formatDate(shift.date) }}
                </td>

                <td class="px-6 py-4 text-slate-600">
                  {{ shift.start_time }}
                </td>

                <td class="px-6 py-4 text-slate-600">
                  {{ shift.end_time }}
                </td>

                <td class="px-6 py-4 text-slate-600">
                  {{ shift.creation_type }}
                </td>

                <td class="px-6 py-4">
                  <span class="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {{ shift.status }}
                  </span>
                </td>

                <td 
                  v-if="isAdmin"
                  class="px-6 py-4"
                >
                  <div class="flex gap-2">
                    <RouterLink
                      :to="`/shifts/${shift.id}/edit`"
                      class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Edit
                    </RouterLink>

                    <button
                      type="button"
                      class="rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      :disabled="deletingShiftId === shift.id"
                      @click="handleDelete(shift.id)"
                    >
                      {{ deletingShiftId === shift.id ? 'Deleting...' : 'Delete' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

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
import { deleteShift, getShiftsTable, type ShiftTableItem } from '../../api/shifts'
import { getBackendErrorMessage } from '../../utils/api'
import { useAuthStore } from '../../stores/auth'
import { storeToRefs } from 'pinia'

import FiltersPanel from '../../components/filters/FiltersPanel.vue'

const shifts = ref<ShiftTableItem[]>([])
const isLoading = ref<boolean>(false)
const hasError = ref<boolean>(false)
const deletingShiftId = ref<number | null>(null)
const tableErrorMessage = ref<string>('')

const authStore = useAuthStore()
const { userRole } = storeToRefs(authStore)

const isAdmin = computed(() => userRole.value === 'admin')

const selectedEmployee = ref<string>('all')
const selectedStatus = ref<'all' | 'planned' | 'assigned' | 'cancelled'>('all')
const selectedCreationType = ref<'all' | 'manual' | 'automatic'>('all')
const selectedDate = ref<string>('')

const employeeOptions = computed(() => {
  const uniqueEmployees = new Map<string, string>()

  shifts.value.forEach((shift) => {
    if (shift.employee_id && shift.employee_name) {
      uniqueEmployees.set(String(shift.employee_id), shift.employee_name)
    }
  })

  return Array.from(uniqueEmployees.entries()).map(([id, name]) => ({
    id,
    name,
  }))
})

const filteredShifts = computed(() => {
  let result = [...shifts.value]

  if (selectedEmployee.value !== 'all') {
    result = result.filter(
      (shift) => String(shift.employee_id) === selectedEmployee.value,
    )
  }

  if (selectedDate.value) {
    result = result.filter(
      (shift) => dayjs(shift.date).format('YYYY-MM-DD') === selectedDate.value,
    )
  }

  if (selectedStatus.value !== 'all') {
    result = result.filter((shift) => shift.status === selectedStatus.value)
  }

  if (selectedCreationType.value !== 'all') {
    result = result.filter(
      (shift) => shift.creation_type === selectedCreationType.value,
    )
  }

  return result
})

function formatDate(value: string): string {
  return dayjs(value).format('DD/MM/YYYY')
}

async function loadShifts(): Promise<void> {
  isLoading.value = true
  hasError.value = false
  tableErrorMessage.value = ''

  try {
    shifts.value = await getShiftsTable()
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

async function handleDelete(shiftId: number): Promise<void> {
  const shouldDelete = window.confirm('Are you sure you want to delete this shift?')

  if (!shouldDelete) {
    return
  }

  deletingShiftId.value = shiftId
  tableErrorMessage.value = ''

  try {
    await deleteShift(shiftId)
    shifts.value = shifts.value.filter((shift) => shift.id !== shiftId)
  } catch (error: unknown) {
    tableErrorMessage.value = getBackendErrorMessage(
      error,
      'Unable to delete shift. Please try again.',
    )
  } finally {
    deletingShiftId.value = null
  }
}

onMounted(() => {
  void loadShifts()
})
</script>