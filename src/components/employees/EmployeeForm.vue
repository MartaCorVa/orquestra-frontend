<template>
  <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div class="grid gap-6 md:grid-cols-2">
        <div>
          <label
            for="first-name"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            First name
          </label>
          <input
            id="first-name"
            v-model="localForm.first_name"
            type="text"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
            :disabled="isSubmitting"
          />
        </div>

        <div>
          <label
            for="last-name"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Last name
          </label>
          <input
            id="last-name"
            v-model="localForm.last_name"
            type="text"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
            :disabled="isSubmitting"
          />
        </div>

        <div>
          <label
            for="phone-number"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Phone number
          </label>
          <input
            id="phone-number"
            v-model="localForm.phone_number"
            type="text"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
            :disabled="isSubmitting"
          />
        </div>

        <div>
          <label
            for="max-weekly-hours"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Max weekly hours
          </label>
          <input
            id="max-weekly-hours"
            v-model.number="localForm.max_weekly_hours"
            type="number"
            min="1"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
            :disabled="isSubmitting"
          />
        </div>

        <div class="flex items-end">
          <label class="flex items-center gap-3 text-sm text-slate-700">
            <input
              v-model="localForm.active"
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              :disabled="isSubmitting"
            />
            <span>Employee active</span>
          </label>
        </div>
      </div>

      <p
        v-if="errorMessage"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ errorMessage }}
      </p>

      <div class="flex justify-end gap-3">
        <RouterLink
          to="/employees"
          class="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Cancel
        </RouterLink>

        <button
          type="submit"
          class="rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
          :disabled="isSubmitting"
        >
          {{ submitLabel }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { RouterLink } from 'vue-router'

import type { UpdateEmployeePayload } from '../../api/employees'

interface Props {
  form: UpdateEmployeePayload
  isSubmitting: boolean
  errorMessage: string
  submitLabel: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [payload: UpdateEmployeePayload]
}>()

const localForm = reactive<UpdateEmployeePayload>({
  first_name: props.form.first_name,
  last_name: props.form.last_name,
  phone_number: props.form.phone_number,
  max_weekly_hours: props.form.max_weekly_hours,
  active: props.form.active,
})

watch(
  () => props.form,
  (newForm) => {
    localForm.first_name = newForm.first_name
    localForm.last_name = newForm.last_name
    localForm.phone_number = newForm.phone_number
    localForm.max_weekly_hours = newForm.max_weekly_hours
    localForm.active = newForm.active
  },
  { deep: true },
)

function handleSubmit(): void {
  emit('submit', {
    first_name: localForm.first_name,
    last_name: localForm.last_name,
    phone_number: localForm.phone_number,
    max_weekly_hours: localForm.max_weekly_hours,
    active: localForm.active,
  })
}
</script>