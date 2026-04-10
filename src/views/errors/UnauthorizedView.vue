<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-6">
    <section class="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 class="text-3xl font-semibold text-slate-900">403</h1>
      <p class="mt-2 text-slate-600">
        You do not have permission to access this page.
      </p>
      <RouterLink
        to="/dashboard"
        class="mt-6 inline-flex rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
      >
        Go to dashboard
      </RouterLink>
    </section>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>