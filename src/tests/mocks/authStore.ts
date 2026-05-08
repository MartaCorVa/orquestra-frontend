import { vi } from 'vitest'

export const authStoreMock = {
  isAuthLoading: false,
  authError: '',
  mustChangeCredentials: false,

  clearError: vi.fn(),
  login: vi.fn(),
  changePassword: vi.fn(),
  logout: vi.fn(),
}