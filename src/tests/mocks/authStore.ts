import { vi } from 'vitest'

export const authStoreMock = {
  isAuthLoading: false,
  authError: '',
  mustChangePassword: false,

  clearError: vi.fn(),
  login: vi.fn(),
  changePassword: vi.fn(),
  logout: vi.fn(),
}