<template>
  <main class="h-screen w-full">
    <section class="h-full w-full">
      <div class="grid h-full w-full lg:grid-cols-[1.05fr_0.95fr]">
        <div
          class="relative flex h-full bg-[radial-gradient(circle_at_top_left,#1e3a8a_0%,#1d4ed8_45%,#0f172a_100%)] px-8 py-10 text-white lg:px-12 lg:py-14"
        >
          <p
            class="absolute top-10 left-8 text-sm font-semibold uppercase tracking-[0.2em] text-blue-100 lg:left-12"
          >
            Orquestra
          </p>

          <div class="flex w-full items-center justify-center">
            <div class="w-full max-w-3xl">
              <h1 class="text-4xl font-semibold leading-tight lg:text-5xl">
                Organize weekly shifts in a simple, fast, and fair way.
              </h1>

              <p class="mt-6 text-base leading-7 text-blue-100">
                Access the system to manage employees, validate restrictions,
                and automatically generate the schedule.
              </p>

              <div class="mt-10 grid max-w-3xl gap-4">
                <article
                  class="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
                >
                  <h2 class="text-base font-semibold text-white">
                    Automatic planning
                  </h2>
                  <p class="mt-2 text-sm leading-6 text-blue-100">
                    Intelligent shift generation based on rules, availability,
                    and workload distribution.
                  </p>
                </article>

                <article
                  class="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
                >
                  <h2 class="text-base font-semibold text-white">
                    Equity analysis
                  </h2>
                  <p class="mt-2 text-sm leading-6 text-blue-100">
                    Visualize assigned hours and detect imbalances across employees
                    in a clear way.
                  </p>
                </article>
              </div>
            </div>
          </div>

          <p class="absolute bottom-10 left-8 text-sm text-blue-100 lg:left-12">
            Web-based shift management system · TFG
          </p>
        </div>

        <div class="flex h-full items-center justify-center bg-white px-6 py-10 lg:px-12">
          <div class="w-full max-w-md">
            <div class="mb-6">
              <h2 class="text-2xl font-semibold text-slate-900">Sign in</h2>
              <p class="mt-1 text-sm text-slate-600">
                Enter your credentials to access the application.
              </p>
            </div>

            <form class="space-y-4" @submit.prevent="handleSubmit">
              <div>
                <label
                  for="username"
                  class="mb-1 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="username"
                  v-model="form.username"
                  type="email"
                  autocomplete="username"
                  placeholder="admin@orquestra.com"
                  class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600"
                  :disabled="authStore.isAuthLoading"
                />
              </div>

              <div>
                <label
                  for="password"
                  class="mb-1 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600"
                  :disabled="authStore.isAuthLoading"
                />
              </div>

              <div class="flex items-center justify-between text-xs text-slate-500">
                <label class="flex items-center gap-2">
                  <input type="checkbox" class="h-4 w-4" disabled />
                  <span>Remember me</span>
                </label>

                <span class="text-slate-400">Forgot password?</span>
              </div>

              <p
                v-if="authStore.authError"
                class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {{ authStore.authError }}
              </p>

              <button
                type="submit"
                class="w-full rounded-xl bg-blue-700 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-70"
                :disabled="authStore.isAuthLoading"
              >
                {{ authStore.isAuthLoading ? 'Signing in...' : 'Login' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '../../stores/auth'
import type { LoginCredentials } from '../../types/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive<LoginCredentials>({
  username: '',
  password: '',
})

async function handleSubmit(): Promise<void> {
  authStore.clearError()

  try {
    await authStore.login(form)

    await router.push(
      authStore.mustChangeCredentials
        ? { name: 'change-password' }
        : { name: 'dashboard' },
    )
  } catch {
    // Error is handled by the store
  }
}
</script>