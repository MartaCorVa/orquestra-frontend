<template>
  <AppShell
    title="Create shift"
    subtitle="Create a new shift and link it to a schedule."
  >
    <section class="mx-auto max-w-4xl space-y-6">
      <div
        v-if="isLoadingSchedules || isLoadingEmployees"
        class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <p class="text-sm text-slate-500">Loading shift form data...</p>
      </div>

      <ShiftForm
        v-else
        :form="form"
        :schedules="schedules"
        :employees="employees"
        :is-submitting="isSubmitting"
        :error-message="errorMessage"
        submit-label="Create shift"
        @submit="handleSubmit"
      />
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import AppShell from '../../components/layout/AppShell.vue'
import ShiftForm from '../../components/shifts/ShiftForm.vue'
import { getSchedules, type Schedule } from '../../api/schedules'
import { createShift, type CreateShiftPayload } from '../../api/shifts'
import { getBackendErrorMessage } from '../../utils/api'
import { getEmployees, type Employee } from '../../api/employees'

const router = useRouter()

const employees = ref<Employee[]>([])
const isLoadingEmployees = ref<boolean>(false)
const schedules = ref<Schedule[]>([])
const isLoadingSchedules = ref<boolean>(false)
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

watch(
  form,
  () => {
    if (errorMessage.value) {
      errorMessage.value = ''
    }
  },
  { deep: true },
)

async function loadEmployees(): Promise<void> {
  isLoadingEmployees.value = true

  try {
    employees.value = await getEmployees()
  } finally {
    isLoadingEmployees.value = false
  }
}

async function loadSchedules(): Promise<void> {
  isLoadingSchedules.value = true

  try {
    schedules.value = await getSchedules()

    if (schedules.value.length > 0 && form.schedule_id === 0) {
      form.schedule_id = schedules.value[0].id
    }
  } finally {
    isLoadingSchedules.value = false
  }
}

async function handleSubmit(payload: CreateShiftPayload): Promise<void> {
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await createShift(payload)
    await router.push({ name: 'shifts' })
  } catch (error: unknown) {
    errorMessage.value = getBackendErrorMessage(
      error,
      'Unable to create shift. Please review the form and try again.',
    )
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  void Promise.all([
    loadSchedules(),
    loadEmployees(),
  ])
})
</script>