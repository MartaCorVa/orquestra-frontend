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

      <section class="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div v-if="isLoading" class="p-6 text-sm text-slate-500">
          Loading shifts...
        </div>

        <div v-else-if="hasError" class="p-6">
          <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to load shifts.
          </div>
        </div>

        <div v-else-if="shifts.length === 0" class="p-6 text-sm text-slate-500">
          No shifts found.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full border-collapse text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                <th class="px-6 py-4 font-semibold">Date</th>
                <th class="px-6 py-4 font-semibold">Start</th>
                <th class="px-6 py-4 font-semibold">End</th>
                <th class="px-6 py-4 font-semibold">Schedule</th>
                <th class="px-6 py-4 font-semibold">Type</th>
                <th class="px-6 py-4 font-semibold">Status</th>
                <th v-if="isAdmin" class="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="shift in shifts"
                :key="shift.id"
                class="border-b border-slate-100 last:border-b-0"
              >
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
                  #{{ shift.schedule_id }}
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
import { deleteShift, getShifts, type Shift } from '../../api/shifts'
import { getBackendErrorMessage } from '../../utils/api'
import { useAuthStore } from '../../stores/auth'
import { storeToRefs } from 'pinia'

const shifts = ref<Shift[]>([])
const isLoading = ref<boolean>(false)
const hasError = ref<boolean>(false)
const deletingShiftId = ref<number | null>(null)
const tableErrorMessage = ref<string>('')

const authStore = useAuthStore()
const { userRole } = storeToRefs(authStore)

const isAdmin = computed(() => userRole.value === 'admin')

function formatDate(value: string): string {
  return dayjs(value).format('DD/MM/YYYY')
}

async function loadShifts(): Promise<void> {
  isLoading.value = true
  hasError.value = false
  tableErrorMessage.value = ''

  try {
    shifts.value = await getShifts()
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