<template>
  <main class="min-h-screen bg-slate-50 p-8">
    <section class="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
            Orquestra
          </p>
          <h1 class="mt-2 text-3xl font-semibold text-slate-900">
            Dashboard
          </h1>
          <p class="mt-3 max-w-2xl text-slate-600">
            Authentication is connected. The frontend foundation is now ready for
            the application layout and feature modules.
          </p>
        </div>

        <button
          type="button"
          class="rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
          @click="handleLogout"
        >
          Logout
        </button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout(): Promise<void> {
  authStore.logout()
  await router.push({ name: 'login' })
}
</script>