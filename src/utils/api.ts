import { AxiosError } from 'axios'

import type { BackendErrorResponse } from '../types/api'

export function getBackendErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (error instanceof AxiosError) {
    const backendMessage = (error.response?.data as BackendErrorResponse | undefined)?.detail

    if (typeof backendMessage === 'string' && backendMessage.trim().length > 0) {
      return backendMessage
    }
  }

  return fallbackMessage
}