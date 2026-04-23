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
            Update employee details and active contract settings.
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
        :contract-form="contractForm"
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
import {
  createContract,
  getActiveContractByEmployee,
  type CreateContractPayload,
} from '../../api/contracts'
import { getBackendErrorMessage } from '../../utils/api'
import { useActivityStore } from '../../stores/activity'

type EditableContractPayload = Omit<CreateContractPayload, 'employee_id'>

const route = useRoute()
const router = useRouter()
const activityStore = useActivityStore()

const isLoading = ref<boolean>(false)
const hasError = ref<boolean>(false)
const isSubmitting = ref<boolean>(false)
const errorMessage = ref<string>('')

const form = reactive<UpdateEmployeePayload>({
  first_name: '',
  last_name: '',
  phone_number: '',
  active: true,
})

const contractForm = reactive<EditableContractPayload>({
  weekly_hours: 40,
  daily_hours: 8,
  min_days_off_per_week: 2,
  work_monday: true,
  work_tuesday: true,
  work_wednesday: true,
  work_thursday: true,
  work_friday: true,
  work_saturday: false,
  work_sunday: false,
  has_fixed_schedule: false,
  preferred_start_time: null,
  preferred_end_time: null,
  active: true,
  start_date: null,
  end_date: null,
})

const originalContract = ref<EditableContractPayload | null>(null)

function normalizeContract(contract: EditableContractPayload): EditableContractPayload {
  return {
    weekly_hours: contract.weekly_hours,
    daily_hours: contract.daily_hours,
    min_days_off_per_week: contract.min_days_off_per_week,
    work_monday: contract.work_monday,
    work_tuesday: contract.work_tuesday,
    work_wednesday: contract.work_wednesday,
    work_thursday: contract.work_thursday,
    work_friday: contract.work_friday,
    work_saturday: contract.work_saturday,
    work_sunday: contract.work_sunday,
    has_fixed_schedule: contract.has_fixed_schedule,
    preferred_start_time: contract.has_fixed_schedule ? contract.preferred_start_time : null,
    preferred_end_time: contract.has_fixed_schedule ? contract.preferred_end_time : null,
    active: true,
    start_date: contract.start_date || null,
    end_date: contract.end_date || null,
  }
}

function hasContractChanged(contract: EditableContractPayload): boolean {
  if (!originalContract.value) {
    return true
  }

  return JSON.stringify(normalizeContract(originalContract.value)) !==
    JSON.stringify(normalizeContract(contract))
}

async function loadEmployee(): Promise<void> {
  isLoading.value = true
  hasError.value = false

  try {
    const employeeId = Number(route.params.id)

    const [employee, activeContract] = await Promise.all([
      getEmployeeById(employeeId),
      getActiveContractByEmployee(employeeId),
    ])

    form.first_name = employee.first_name
    form.last_name = employee.last_name
    form.phone_number = employee.phone_number
    form.active = employee.active

    if (activeContract) {
      contractForm.weekly_hours = activeContract.weekly_hours
      contractForm.daily_hours = activeContract.daily_hours
      contractForm.min_days_off_per_week = activeContract.min_days_off_per_week
      contractForm.work_monday = activeContract.work_monday
      contractForm.work_tuesday = activeContract.work_tuesday
      contractForm.work_wednesday = activeContract.work_wednesday
      contractForm.work_thursday = activeContract.work_thursday
      contractForm.work_friday = activeContract.work_friday
      contractForm.work_saturday = activeContract.work_saturday
      contractForm.work_sunday = activeContract.work_sunday
      contractForm.has_fixed_schedule = activeContract.has_fixed_schedule
      contractForm.preferred_start_time = activeContract.preferred_start_time
      contractForm.preferred_end_time = activeContract.preferred_end_time
      contractForm.active = true
      contractForm.start_date = activeContract.start_date
      contractForm.end_date = activeContract.end_date

      originalContract.value = normalizeContract({
        weekly_hours: activeContract.weekly_hours,
        daily_hours: activeContract.daily_hours,
        min_days_off_per_week: activeContract.min_days_off_per_week,
        work_monday: activeContract.work_monday,
        work_tuesday: activeContract.work_tuesday,
        work_wednesday: activeContract.work_wednesday,
        work_thursday: activeContract.work_thursday,
        work_friday: activeContract.work_friday,
        work_saturday: activeContract.work_saturday,
        work_sunday: activeContract.work_sunday,
        has_fixed_schedule: activeContract.has_fixed_schedule,
        preferred_start_time: activeContract.preferred_start_time,
        preferred_end_time: activeContract.preferred_end_time,
        active: true,
        start_date: activeContract.start_date,
        end_date: activeContract.end_date,
      })
    }
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

async function handleSubmit(payload: {
  employee: UpdateEmployeePayload
  contract: EditableContractPayload
}): Promise<void> {
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const employeeId = Number(route.params.id)

    await updateEmployee(employeeId, payload.employee)

    if (hasContractChanged(payload.contract)) {
      await createContract({
        employee_id: employeeId,
        ...normalizeContract(payload.contract),
      })
    }

    activityStore.addActivity(
      `${form.first_name} ${form.last_name}`,
      'Employee updated',
    )

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