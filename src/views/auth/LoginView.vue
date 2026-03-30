<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-6">
    <section class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 class="mb-2 text-2xl font-semibold text-slate-900">Sign in</h1>
      <p class="mb-6 text-sm text-slate-600">
        Enter your credentials to access Orquestra.
      </p>

      <form class="space-y-4">
        <div>
          <label for="email" class="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
            placeholder="admin@orquestra.com"
          />
        </div>

        <div>
          <label for="password" class="mb-2 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          class="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
</script>