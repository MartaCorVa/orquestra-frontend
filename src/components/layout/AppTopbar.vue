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
  </header>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
}

defineProps<Props>()
</script>