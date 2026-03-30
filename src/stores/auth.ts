import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export interface AuthUser {
  id: number
  email: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed<boolean>(() => token.value !== null)

  function setToken(newToken: string): void {
    token.value = newToken
    localStorage.setItem('access_token', newToken)
  }

  function clearAuth(): void {
    token.value = null
    user.value = null
    localStorage.removeItem('access_token')
  }

  function setUser(authUser: AuthUser): void {
    user.value = authUser
  }

  return {
    token,
    user,
    isAuthenticated,
    setToken,
    clearAuth,
    setUser,
  }
})