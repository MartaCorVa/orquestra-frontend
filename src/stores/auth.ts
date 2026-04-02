import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { AxiosError } from 'axios'

import { changePasswordRequest, loginRequest } from '../api/auth'
import {
  clearAuthStorage,
  getAccessToken,
  getMustChangePassword,
  setAccessToken,
  setMustChangePassword,
} from '../utils/storage'
import type {
  AuthUser,
  ChangePasswordPayload,
  LoginCredentials,
} from '../types/auth'

interface BackendErrorResponse {
  detail?: string
}

function getBackendErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof AxiosError) {
    const backendMessage = (error.response?.data as BackendErrorResponse | undefined)?.detail

    if (typeof backendMessage === 'string' && backendMessage.trim().length > 0) {
      return backendMessage
    }
  }

  return fallbackMessage
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const mustChangePassword = ref<boolean>(false)
  const user = ref<AuthUser | null>(null)
  const isAuthLoading = ref<boolean>(false)
  const authError = ref<string>('')
  const isAuthInitialized = ref<boolean>(false)

  const isAuthenticated = computed<boolean>(() => accessToken.value !== null)
  const userRole = computed<string | null>(() => user.value?.role ?? null)

  function initializeAuth(): void {
    accessToken.value = getAccessToken()
    mustChangePassword.value = getMustChangePassword()
    isAuthInitialized.value = true
  }

  function setSession(payload: {
    accessToken: string
    mustChangePassword: boolean
  }): void {
    accessToken.value = payload.accessToken
    mustChangePassword.value = payload.mustChangePassword

    setAccessToken(payload.accessToken)
    setMustChangePassword(payload.mustChangePassword)
  }

  function clearSession(): void {
    accessToken.value = null
    mustChangePassword.value = false
    user.value = null
    authError.value = ''

    clearAuthStorage()
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    isAuthLoading.value = true
    authError.value = ''

    try {
      const response = await loginRequest(credentials)

      setSession({
        accessToken: response.access_token,
        mustChangePassword: response.must_change_password,
      })
    } catch (error: unknown) {
      authError.value = getBackendErrorMessage(
        error,
        'Invalid credentials. Please try again.',
      )
      throw error
    } finally {
      isAuthLoading.value = false
    }
  }

  async function changePassword(payload: ChangePasswordPayload): Promise<void> {
    isAuthLoading.value = true
    authError.value = ''

    try {
      await changePasswordRequest(payload)

      mustChangePassword.value = false
      setMustChangePassword(false)
    } catch (error: unknown) {
      authError.value = getBackendErrorMessage(
        error,
        'Unable to change password. Please try again.',
      )
      throw error
    } finally {
      isAuthLoading.value = false
    }
  }

  function logout(): void {
    clearSession()
  }

  function setUser(authUser: AuthUser): void {
    user.value = authUser
  }

  function clearError(): void {
    authError.value = ''
  }

  return {
    accessToken,
    mustChangePassword,
    user,
    isAuthLoading,
    authError,
    isAuthInitialized,
    isAuthenticated,
    userRole,
    initializeAuth,
    setSession,
    clearSession,
    login,
    changePassword,
    logout,
    setUser,
    clearError,
  }
})