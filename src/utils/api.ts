import { AxiosError } from 'axios'

import type { BackendErrorResponse } from '../types/api'

export function getBackendErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (error instanceof AxiosError) {
    const backendDetail = (error.response?.data as BackendErrorResponse | undefined)?.detail

    if (typeof backendDetail === 'string' && backendDetail.trim().length > 0) {
      return backendDetail
    }

    if (
      typeof backendDetail === 'object' &&
      backendDetail !== null &&
      'errors' in backendDetail &&
      Array.isArray((backendDetail as any).errors)
    ) {
      const errors = (backendDetail as any).errors as string[]

      if (errors.length > 0) {
        return errors.join(' · ')
      }
    }

    if (
      typeof backendDetail === 'object' &&
      backendDetail !== null &&
      'message' in backendDetail
    ) {
      const message = (backendDetail as any).message

      if (typeof message === 'string' && message.trim().length > 0) {
        return message
      }
    }
  }

  return fallbackMessage
}