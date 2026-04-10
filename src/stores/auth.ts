import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { changePasswordRequest, loginRequest } from '../api/auth'
import {
  clearAuthStorage,
  getAccessToken,
  getMustChangePassword,
  getRole,
  getUserEmail,
  setAccessToken,
  setMustChangePassword,
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
  const mustChangePassword = ref<boolean>(false)
  const userEmail = ref<string>('')
  const isAuthLoading = ref<boolean>(false)
  const authError = ref<string>('')
  const isAuthInitialized = ref<boolean>(false)

  const isAuthenticated = computed<boolean>(() => accessToken.value !== null)
  const userRole = ref<string>('')

  function initializeAuth(): void {
    accessToken.value = getAccessToken()
    mustChangePassword.value = getMustChangePassword()
    userRole.value = getRole()
    userEmail.value = getUserEmail()
    isAuthInitialized.value = true
  }

  function setSession(payload: {
    accessToken: string
    mustChangePassword: boolean
    role: string
    userEmail: string
  }): void {
    accessToken.value = payload.accessToken
    mustChangePassword.value = payload.mustChangePassword
    userRole.value = payload.role
    userEmail.value = payload.userEmail

    setAccessToken(payload.accessToken)
    setMustChangePassword(payload.mustChangePassword)
    setRole(payload.role)
    setUserEmail(payload.userEmail)
  }

  function clearSession(): void {
    accessToken.value = null
    mustChangePassword.value = false
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
        mustChangePassword: response.must_change_password,
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

  function clearError(): void {
    authError.value = ''
  }

  return {
    accessToken,
    mustChangePassword,
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