<template>
  <aside class="flex h-screen w-64 flex-col bg-slate-950 px-4 py-6 text-slate-100">
    <div class="border-b border-white/10 px-3 pb-4">
      <p class="text-xl font-semibold text-white">Orquestra</p>
      <p class="mt-1 text-sm text-slate-400">
        {{ panelLabel }}
      </p>
    </div>

    <nav class="mt-6 flex flex-1 flex-col gap-2">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-blue-500/10 hover:text-white"
        :class="{
          'bg-blue-500/15 text-white': route.path === item.to,
        }"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="border-t border-white/10 px-3 pt-4">
      <div v-if="userEmail" class="mb-4">
        <p class="text-sm font-medium text-white break-all">
          {{ userEmail }}
        </p>
        <p class="text-xs text-slate-400 capitalize">
          {{ userRole }}
        </p>
      </div>

      <button
        @click="handleLogout"
        class="w-full rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 hover:text-white"
      >
        Logout
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../../stores/auth'

interface NavigationItem {
  label: string
  to: string
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const { userRole, userEmail } = storeToRefs(authStore)

const isAdmin = computed(() => userRole.value === 'admin')

const panelLabel = computed(() =>
  isAdmin.value ? 'Admin panel' : 'Employee panel'
)

const items = computed<NavigationItem[]>(() => {
  const baseItems: NavigationItem[] = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Shifts', to: '/shifts' },
    { label: 'Schedules', to: '/schedules' },
  ]

  if (isAdmin.value) {
    baseItems.splice(1, 0, { label: 'Employees', to: '/employees' })
    baseItems.push({ label: 'Equity analysis', to: '/metrics' })
  }

  return baseItems
})

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>