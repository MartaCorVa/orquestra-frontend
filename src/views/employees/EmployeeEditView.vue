<template>
  <AppShell
    title="Edit employee"
    subtitle="Update employee profile information and working conditions."
  >
    <section class="mx-auto max-w-4xl">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-2xl font-semibold text-slate-900">Edit employee</h2>
          <p class="mt-2 text-sm text-slate-600">
            Update employee details already registered in the system.
          </p>
        </div>
      </div>

      <div v-if="isLoading" class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p class="text-sm text-slate-500">Loading employee data...</p>
      </div>

      <div v-else-if="hasError" class="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
        <p class="text-sm text-red-700">Failed to load employee data.</p>
      </div>

      <EmployeeForm
        v-else
        :form="form"
        :is-submitting="isSubmitting"
        :error-message="errorMessage"
        submit-label="Save changes"
        @submit="handleSubmit"
      />
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppShell from '../../components/layout/AppShell.vue'
import EmployeeForm from '../../components/employees/EmployeeForm.vue'
import {
  getEmployeeById,
  updateEmployee,
  type UpdateEmployeePayload,
} from '../../api/employees'
import { getBackendErrorMessage } from '../../utils/api'

const route = useRoute()
const router = useRouter()

const isLoading = ref<boolean>(false)
const hasError = ref<boolean>(false)
const isSubmitting = ref<boolean>(false)
const errorMessage = ref<string>('')

const form = reactive<UpdateEmployeePayload>({
  first_name: '',
  last_name: '',
  phone_number: '',
  max_weekly_hours: 40,
  active: true,
})

async function loadEmployee(): Promise<void> {
  isLoading.value = true
  hasError.value = false

  try {
    const employeeId = Number(route.params.id)
    const employee = await getEmployeeById(employeeId)

    form.first_name = employee.first_name
    form.last_name = employee.last_name
    form.phone_number = employee.phone_number
    form.max_weekly_hours = employee.max_weekly_hours
    form.active = employee.active
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

async function handleSubmit(payload: UpdateEmployeePayload): Promise<void> {
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const employeeId = Number(route.params.id)
    await updateEmployee(employeeId, payload)
    await router.push({ name: 'employees' })
  } catch (error: unknown) {
    errorMessage.value = getBackendErrorMessage(
      error,
      'Unable to update employee. Please review the form and try again.',
    )
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  void loadEmployee()
})
</script>