import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { loginRequest } from '../api/auth'
import { getAccessToken, removeAccessToken, setAccessToken } from '../utils/storage'
import type { AuthUser, LoginCredentials } from '../types/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getAccessToken())
  const user = ref<AuthUser | null>(null)
  const isLoading = ref<boolean>(false)
  const errorMessage = ref<string>('')

  const isAuthenticated = computed<boolean>(() => token.value !== null)
  const userRole = computed<string | null>(() => user.value?.role ?? null)

  async function login(credentials: LoginCredentials): Promise<void> {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await loginRequest(credentials)

      token.value = response.access_token
      setAccessToken(response.access_token)
    } catch (error: unknown) {
      errorMessage.value = 'Invalid credentials. Please try again.'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  function logout(): void {
    token.value = null
    user.value = null
    errorMessage.value = ''
    removeAccessToken()
  }

  function setUser(authUser: AuthUser): void {
    user.value = authUser
  }

  function clearError(): void {
    errorMessage.value = ''
  }

  return {
    token,
    user,
    isLoading,
    errorMessage,
    isAuthenticated,
    userRole,
    login,
    logout,
    setUser,
    clearError,
  }
})