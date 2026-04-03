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

      <section class="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div v-if="isLoading" class="p-6 text-sm text-slate-500">
          Loading employees...
        </div>

        <div v-else-if="hasError" class="p-6">
          <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to load employees.
          </div>
        </div>

        <div v-else-if="employees.length === 0" class="p-6 text-sm text-slate-500">
          No employees found.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full border-collapse text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                <th class="px-6 py-4 font-semibold">Name</th>
                <th class="px-6 py-4 font-semibold">Phone</th>
                <th class="px-6 py-4 font-semibold">Max weekly hours</th>
                <th class="px-6 py-4 font-semibold">Status</th>
                <th class="px-6 py-4 font-semibold">Created</th>
                <th class="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="employee in employees"
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

                <td class="px-6 py-4">
                  <span
                    class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
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
                  <div class="flex gap-2">
                    <RouterLink
                      :to="`/employees/${employee.id}/edit`"
                      class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Edit
                    </RouterLink>
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
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import dayjs from 'dayjs'

import AppShell from '../../components/layout/AppShell.vue'
import { getEmployees, type Employee } from '../../api/employees'

const employees = ref<Employee[]>([])
const isLoading = ref<boolean>(false)
const hasError = ref<boolean>(false)

function formatDate(value: string): string {
  return dayjs(value).format('DD/MM/YYYY HH:mm')
}

async function loadEmployees(): Promise<void> {
  isLoading.value = true
  hasError.value = false

  try {
    employees.value = await getEmployees()
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadEmployees()
})
</script>