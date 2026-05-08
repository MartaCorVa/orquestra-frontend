import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const {
  loginRequestMock,
  changePasswordRequestMock,
  getAccessTokenMock,
  getMustChangeCredentialsMock,
  getRoleMock,
  getUserEmailMock,
  setAccessTokenMock,
  setMustChangeCredentialsMock,
  setRoleMock,
  setUserEmailMock,
  clearAuthStorageMock,
  getBackendErrorMessageMock,
} = vi.hoisted(() => ({
  loginRequestMock: vi.fn(),
  changePasswordRequestMock: vi.fn(),
  getAccessTokenMock: vi.fn(),
  getMustChangeCredentialsMock: vi.fn(),
  getRoleMock: vi.fn(),
  getUserEmailMock: vi.fn(),
  setAccessTokenMock: vi.fn(),
  setMustChangeCredentialsMock: vi.fn(),
  setRoleMock: vi.fn(),
  setUserEmailMock: vi.fn(),
  clearAuthStorageMock: vi.fn(),
  getBackendErrorMessageMock: vi.fn(),
}))

vi.mock('../../../api/auth', () => ({
  loginRequest: loginRequestMock,
  changePasswordRequest: changePasswordRequestMock,
}))

vi.mock('../../../utils/storage', () => ({
  getAccessToken: getAccessTokenMock,
  getMustChangeCredentials: getMustChangeCredentialsMock,
  getRole: getRoleMock,
  getUserEmail: getUserEmailMock,
  setAccessToken: setAccessTokenMock,
  setMustChangeCredentials: setMustChangeCredentialsMock,
  setRole: setRoleMock,
  setUserEmail: setUserEmailMock,
  clearAuthStorage: clearAuthStorageMock,
}))

vi.mock('../../../utils/api', () => ({
  getBackendErrorMessage: getBackendErrorMessageMock,
}))

import { useAuthStore } from '../../../stores/auth'

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes auth from storage', () => {
    getAccessTokenMock.mockReturnValue('token')
    getMustChangeCredentialsMock.mockReturnValue(true)
    getRoleMock.mockReturnValue('manager')
    getUserEmailMock.mockReturnValue('marta@example.com')

    const store = useAuthStore()

    store.initializeAuth()

    expect(store.accessToken).toBe('token')
    expect(store.mustChangeCredentials).toBe(true)
    expect(store.userRole).toBe('manager')
    expect(store.userEmail).toBe('marta@example.com')
    expect(store.isAuthInitialized).toBe(true)
  })

  it('sets session and persists it in storage', () => {
    const store = useAuthStore()

    store.setSession({
      accessToken: 'token',
      mustChangeCredentials: true,
      role: 'manager',
      userEmail: 'marta@example.com',
    })

    expect(store.accessToken).toBe('token')
    expect(store.mustChangeCredentials).toBe(true)
    expect(store.userRole).toBe('manager')
    expect(store.userEmail).toBe('marta@example.com')
    expect(store.isAuthenticated).toBe(true)

    expect(setAccessTokenMock).toHaveBeenCalledWith('token')
    expect(setMustChangeCredentialsMock).toHaveBeenCalledWith(true)
    expect(setRoleMock).toHaveBeenCalledWith('manager')
    expect(setUserEmailMock).toHaveBeenCalledWith('marta@example.com')
  })

  it('clears session and auth storage', () => {
    const store = useAuthStore()

    store.setSession({
      accessToken: 'token',
      mustChangeCredentials: true,
      role: 'manager',
      userEmail: 'marta@example.com',
    })

    store.clearSession()

    expect(store.accessToken).toBeNull()
    expect(store.mustChangeCredentials).toBe(false)
    expect(store.userRole).toBe('')
    expect(store.userEmail).toBe('')
    expect(store.authError).toBe('')
    expect(store.isAuthenticated).toBe(false)
    expect(clearAuthStorageMock).toHaveBeenCalled()
  })

  it('logs in successfully', async () => {
    loginRequestMock.mockResolvedValue({
      access_token: 'token',
      must_change_password: true,
      role: 'manager',
      user: 'marta@example.com',
    })

    const store = useAuthStore()

    await store.login({
      username: 'marta',
      password: 'password123',
    })

    expect(loginRequestMock).toHaveBeenCalledWith({
      username: 'marta',
      password: 'password123',
    })
    expect(store.accessToken).toBe('token')
    expect(store.mustChangeCredentials).toBe(true)
    expect(store.userRole).toBe('manager')
    expect(store.userEmail).toBe('marta@example.com')
    expect(store.isAuthLoading).toBe(false)
    expect(store.authError).toBe('')
  })

  it('sets auth error when login fails', async () => {
    const error = new Error('Login failed')
    loginRequestMock.mockRejectedValue(error)
    getBackendErrorMessageMock.mockReturnValue('Invalid credentials')

    const store = useAuthStore()

    await expect(
      store.login({
        username: 'marta',
        password: 'wrong-password',
      }),
    ).rejects.toThrow('Login failed')

    expect(store.authError).toBe('Invalid credentials')
    expect(store.isAuthLoading).toBe(false)
  })

  it('changes password successfully', async () => {
    changePasswordRequestMock.mockResolvedValue(undefined)

    const store = useAuthStore()
    store.mustChangeCredentials = true

    await store.changePassword({
      current_password: 'oldPassword',
      new_password: 'newPassword',
    })

    expect(changePasswordRequestMock).toHaveBeenCalledWith({
      current_password: 'oldPassword',
      new_password: 'newPassword',
    })
    expect(store.mustChangeCredentials).toBe(false)
    expect(setMustChangeCredentialsMock).toHaveBeenCalledWith(false)
    expect(store.isAuthLoading).toBe(false)
  })

  it('sets auth error when change password fails', async () => {
    const error = new Error('Change password failed')
    changePasswordRequestMock.mockRejectedValue(error)
    getBackendErrorMessageMock.mockReturnValue('Unable to change password')

    const store = useAuthStore()

    await expect(
      store.changePassword({
        current_password: 'oldPassword',
        new_password: 'newPassword',
      }),
    ).rejects.toThrow('Change password failed')

    expect(store.authError).toBe('Unable to change password')
    expect(store.isAuthLoading).toBe(false)
  })

  it('logs out by clearing the session', () => {
    const store = useAuthStore()

    store.setSession({
      accessToken: 'token',
      mustChangeCredentials: true,
      role: 'manager',
      userEmail: 'marta@example.com',
    })

    store.logout()

    expect(store.accessToken).toBeNull()
    expect(clearAuthStorageMock).toHaveBeenCalled()
  })

  it('clears auth error', () => {
    const store = useAuthStore()

    store.authError = 'Some error'

    store.clearError()

    expect(store.authError).toBe('')
  })
})