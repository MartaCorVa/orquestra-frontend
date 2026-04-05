<template>
  <div class="h-screen bg-slate-50 lg:grid lg:grid-cols-[256px_1fr]">
    <AppSidebar />

    <div class="flex h-screen flex-col overflow-hidden">
      <AppTopbar :title="title" :subtitle="subtitle" />

      <main class="flex-1 overflow-y-auto p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'

interface Props {
  title: string
  subtitle?: string
}

defineProps<Props>()
</script>