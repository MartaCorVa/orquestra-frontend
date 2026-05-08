import { AxiosError } from 'axios'

import type { BackendErrorResponse } from '../types/api'

function isValidString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function extractErrors(detail: unknown): string | null {
  if (
    typeof detail === 'object' &&
    detail !== null &&
    'errors' in detail &&
    Array.isArray((detail as any).errors)
  ) {
    const errors = (detail as any).errors as string[]

    if (errors.length > 0) {
      return errors.join(' · ')
    }
  }

  return null
}

function extractMessage(detail: unknown): string | null {
  if (
    typeof detail === 'object' &&
    detail !== null &&
    'message' in detail
  ) {
    const message = (detail as any).message

    if (isValidString(message)) {
      return message
    }
  }

  return null
}

export function getBackendErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (!(error instanceof AxiosError)) {
    return fallbackMessage
  }

  const backendDetail = (
    error.response?.data as BackendErrorResponse | undefined
  )?.detail

  if (isValidString(backendDetail)) {
    return backendDetail
  }

  const errors = extractErrors(backendDetail)

  if (errors) {
    return errors
  }

  const message = extractMessage(backendDetail)

  if (message) {
    return message
  }

  return fallbackMessage
}