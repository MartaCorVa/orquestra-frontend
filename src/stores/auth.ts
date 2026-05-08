import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { changePasswordRequest, loginRequest } from '../api/auth'
import {
  clearAuthStorage,
  getAccessToken,
  getMustChangeCredentials,
  getRole,
  getUserEmail,
  setAccessToken,
  setMustChangeCredentials,
  setRole,
  setUserEmail,
} from '../utils/storage'
import { getBackendErrorMessage } from '../utils/api'
import type {
  ChangePasswordPayload,
  LoginCredentials,
} from '../types/auth'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const mustChangeCredentials = ref<boolean>(false)
  const userEmail = ref<string>('')
  const isAuthLoading = ref<boolean>(false)
  const authError = ref<string>('')
  const isAuthInitialized = ref<boolean>(false)

  const isAuthenticated = computed<boolean>(() => accessToken.value !== null)
  const userRole = ref<string>('')

  function initializeAuth(): void {
    accessToken.value = getAccessToken()
    mustChangeCredentials.value = getMustChangeCredentials()
    userRole.value = getRole()
    userEmail.value = getUserEmail()
    isAuthInitialized.value = true
  }

  function setSession(payload: {
    accessToken: string
    mustChangeCredentials: boolean
    role: string
    userEmail: string
  }): void {
    accessToken.value = payload.accessToken
    mustChangeCredentials.value = payload.mustChangeCredentials
    userRole.value = payload.role
    userEmail.value = payload.userEmail

    setAccessToken(payload.accessToken)
    setMustChangeCredentials(payload.mustChangeCredentials)
    setRole(payload.role)
    setUserEmail(payload.userEmail)
  }

  function clearSession(): void {
    accessToken.value = null
    mustChangeCredentials.value = false
    userRole.value = ''
    userEmail.value = ''
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
        mustChangeCredentials: response.must_change_password,
        role: response.role,
        userEmail: response.user,
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

      mustChangeCredentials.value = false
      setMustChangeCredentials(false)
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

  function clearError(): void {
    authError.value = ''
  }

  return {
    accessToken,
    mustChangeCredentials,
    userEmail,
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
    clearError,
  }
})