<template>
  <div class="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[256px_1fr]">
    <AppSidebar />

    <div class="min-h-screen">
      <AppTopbar :title="title" :subtitle="subtitle" />

      <main class="p-8">
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