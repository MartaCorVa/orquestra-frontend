<template>
  <AppShell
    title="Edit shift"
    subtitle="Update shift information and schedule association."
  >
    <section class="mx-auto max-w-4xl space-y-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-2xl font-semibold text-slate-900">Edit shift</h2>
          <p class="mt-2 text-sm text-slate-600">
            Update the shift details, schedule, assigned employee, and current status.
          </p>
        </div>
      </div>

      <div
        v-if="isLoading"
        class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <p class="text-sm text-slate-500">Loading shift data...</p>
      </div>

      <div
        v-else-if="hasError"
        class="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm"
      >
        <p class="text-sm text-red-700">Failed to load shift data.</p>
      </div>

      <ShiftForm
        v-else
        :form="form"
        :schedules="schedules"
        :employees="employees"
        :is-submitting="isSubmitting"
        :error-message="errorMessage"
        submit-label="Save changes"
        @submit="handleSubmit"
      />
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'

import AppShell from '../../components/layout/AppShell.vue'
import ShiftForm from '../../components/shifts/ShiftForm.vue'
import { getSchedules, type Schedule } from '../../api/schedules'
import { getEmployees, type Employee } from '../../api/employees'
import { getShiftById, updateShift, type CreateShiftPayload } from '../../api/shifts'
import { getBackendErrorMessage } from '../../utils/api'

const route = useRoute()
const router = useRouter()

const schedules = ref<Schedule[]>([])
const employees = ref<Employee[]>([])
const isLoading = ref<boolean>(false)
const hasError = ref<boolean>(false)
const isSubmitting = ref<boolean>(false)
const errorMessage = ref<string>('')

const form = reactive({
  employee_id: null as number | null,
  start_date: '',
  start_time: '',
  end_date: '',
  end_time: '',
  creation_type: 'manual',
  status: 'planned',
  schedule_id: 0,
})

async function loadData(): Promise<void> {
  isLoading.value = true
  hasError.value = false

  try {
    const shiftId = Number(route.params.id)

    const [schedulesData, employeesData, shiftData] = await Promise.all([
      getSchedules(),
      getEmployees(),
      getShiftById(shiftId),
    ])

    schedules.value = schedulesData
    employees.value = employeesData

    form.employee_id = shiftData.employee_id ?? null
    form.start_date = dayjs(shiftData.start_datetime).format('YYYY-MM-DD')
    form.start_time = dayjs(shiftData.start_datetime).format('HH:mm')
    form.end_date = dayjs(shiftData.end_datetime).format('YYYY-MM-DD')
    form.end_time = dayjs(shiftData.end_datetime).format('HH:mm')
    form.creation_type = shiftData.creation_type
    form.status = shiftData.status
    form.schedule_id = shiftData.schedule_id
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

async function handleSubmit(payload: CreateShiftPayload): Promise<void> {
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const shiftId = Number(route.params.id)
    await updateShift(shiftId, payload)
    await router.push({ name: 'shifts' })
  } catch (error: unknown) {
    errorMessage.value = getBackendErrorMessage(
      error,
      'Unable to update shift. Please review the form and try again.',
    )
  } finally {
    isSubmitting.value = false
  }
}

watch(
  form,
  () => {
    if (errorMessage.value) {
      errorMessage.value = ''
    }
  },
  { deep: true },
)

onMounted(() => {
  void loadData()
})
</script>