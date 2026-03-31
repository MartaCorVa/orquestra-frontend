<template>
  <header class="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
    <div>
      <h1 class="text-2xl font-semibold text-slate-900">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="mt-1 text-sm text-slate-500">
        {{ subtitle }}
      </p>
    </div>

    <button
      type="button"
      class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      @click="handleLogout"
    >
      Logout
    </button>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useAuthStore } from '../../stores/auth'

interface Props {
  title: string
  subtitle?: string
}

defineProps<Props>()

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout(): Promise<void> {
  authStore.logout()
  await router.push({ name: 'login' })
}
</script>