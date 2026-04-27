<template>
  <AppShell
    title="Create shift"
    subtitle="Create a single shift or repeated shifts linked to a schedule."
  >
    <section class="mx-auto max-w-4xl space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div class="inline-flex rounded-2xl border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            class="rounded-xl px-4 py-2 text-sm font-medium transition"
            :class="
              creationMode === 'single'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            "
            @click="creationMode = 'single'"
          >
            Single shift
          </button>

          <button
            type="button"
            class="rounded-xl px-4 py-2 text-sm font-medium transition"
            :class="
              creationMode === 'recurrent'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            "
            @click="creationMode = 'recurrent'"
          >
            Recurrent shifts
          </button>
        </div>
      </div>

      <div
        v-if="isLoadingSchedules || isLoadingEmployees"
        class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <p class="text-sm text-slate-500">Loading shift form data...</p>
      </div>

      <ShiftForm
        v-else-if="creationMode === 'single'"
        :form="form"
        :schedules="schedules"
        :employees="employees"
        :is-submitting="isSubmitting"
        :error-message="errorMessage"
        submit-label="Create shift"
        @submit="handleSingleSubmit"
      />

      <RecurrentShiftForm
        v-else
        :form="recurrentForm"
        :schedules="schedules"
        :employees="employees"
        :is-submitting="isSubmitting"
        :error-message="errorMessage"
        submit-label="Create recurrent shifts"
        @submit="handleRecurrentSubmit"
      />
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import AppShell from '../../components/layout/AppShell.vue'
import ShiftForm from '../../components/shifts/ShiftForm.vue'
import RecurrentShiftForm from '../../components/shifts/RecurrentShiftForm.vue'
import { getSchedules, type Schedule } from '../../api/schedules'
import {
  createRecurrentShifts,
  createShift,
  type CreateRecurrentShiftPayload,
  type CreateShiftPayload,
  type Weekday,
} from '../../api/shifts'
import { getBackendErrorMessage } from '../../utils/api'
import { getEmployees, type Employee } from '../../api/employees'
import { useActivityStore } from '../../stores/activity'

type CreationMode = 'single' | 'recurrent'

const router = useRouter()
const activityStore = useActivityStore()

const creationMode = ref<CreationMode>('single')

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

const recurrentForm = reactive({
  employee_id: null as number | null,
  schedule_id: 0,
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: '',
  weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as Weekday[],
  creation_type: 'manual',
  status: 'planned',
})

watch(
  [form, recurrentForm, creationMode],
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

    if (schedules.value.length > 0) {
      if (form.schedule_id === 0) {
        form.schedule_id = schedules.value[0].id
      }

      if (recurrentForm.schedule_id === 0) {
        recurrentForm.schedule_id = schedules.value[0].id
      }
    }
  } finally {
    isLoadingSchedules.value = false
  }
}

async function handleSingleSubmit(payload: CreateShiftPayload): Promise<void> {
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await createShift(payload)

    activityStore.addActivity(
      `${payload.start_datetime} - ${payload.end_datetime}`,
      'Shift created',
    )

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

async function handleRecurrentSubmit(
  payload: CreateRecurrentShiftPayload,
): Promise<void> {
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const createdShifts = await createRecurrentShifts(payload)

    activityStore.addActivity(
      `${payload.start_date} - ${payload.end_date}`,
      `${createdShifts.length} recurrent shifts created`,
    )

    await router.push({ name: 'shifts' })
  } catch (error: unknown) {
    errorMessage.value = getBackendErrorMessage(
      error,
      'Unable to create recurrent shifts. Please review the form and try again.',
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