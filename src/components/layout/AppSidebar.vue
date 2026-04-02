<template>
  <aside class="flex h-screen w-64 flex-col bg-slate-950 px-4 py-6 text-slate-100">
    <div class="border-b border-white/10 px-3 pb-4">
      <p class="text-xl font-semibold text-white">Orquestra</p>
      <p class="mt-1 text-sm text-slate-400">
        {{ isAdmin ? 'Admin panel' : 'Employee panel' }}
      </p>
    </div>

    <nav class="mt-6 flex flex-1 flex-col gap-2">
      <RouterLink
        v-for="item in visibleItems"
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
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { useAuthStore } from '../../stores/auth'

interface NavigationItem {
  label: string
  to: string
  adminOnly?: boolean
}

const route = useRoute()
const authStore = useAuthStore()

const items: NavigationItem[] = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Employees', to: '/employees' },
  { label: 'Shifts', to: '/shifts' },
  { label: 'Schedules', to: '/schedules' },
  { label: 'Equity analysis', to: '/metrics' },
]

const isAdmin = computed<boolean>(() => authStore.userRole === 'admin')

const visibleItems = computed<NavigationItem[]>(() =>
  items.filter((item) => !item.adminOnly || isAdmin.value),
)
</script>