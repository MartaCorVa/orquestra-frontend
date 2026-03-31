import apiClient from './axios'
import type { LoginCredentials, LoginResponse } from '../types/auth'

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const formData = new URLSearchParams()
  formData.append('username', credentials.username)
  formData.append('password', credentials.password)

  const response = await apiClient.post<LoginResponse>(
    '/auth/login',
    formData,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  )

  return response.data
}