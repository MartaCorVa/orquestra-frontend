<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
    <section class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div class="mb-8">
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Orquestra
        </p>
        <h1 class="mt-4 text-3xl font-semibold text-slate-900">
          Change password
        </h1>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          For security reasons, you must change your password before accessing the application.
        </p>
      </div>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label
            for="current-password"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Current password
          </label>
          <input
            id="current-password"
            v-model="form.current_password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600"
            :disabled="authStore.isAuthLoading"
          />
        </div>

        <div>
          <label
            for="new-password"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            New password
          </label>
          <input
            id="new-password"
            v-model="form.new_password"
            type="password"
            autocomplete="new-password"
            placeholder="••••••••"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600"
            :disabled="authStore.isAuthLoading"
          />
        </div>

        <p
          v-if="authStore.authError"
          class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {{ authStore.authError }}
        </p>

        <button
          type="submit"
          class="w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
          :disabled="authStore.isAuthLoading"
        >
          {{ authStore.isAuthLoading ? 'Updating password...' : 'Change password' }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '../../stores/auth'
import type { ChangePasswordPayload } from '../../types/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive<ChangePasswordPayload>({
  current_password: '',
  new_password: '',
})

async function handleSubmit(): Promise<void> {
  authStore.clearError()

  try {
    await authStore.changePassword(form)
    await router.push({ name: 'dashboard' })
  } catch {
    // Error is handled by the store
  }
}
</script>