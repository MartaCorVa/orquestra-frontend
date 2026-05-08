import { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'
import { getBackendErrorMessage } from '../../../utils/api'

describe('getBackendErrorMessage', () => {
  const fallbackMessage = 'Fallback error message'

  function createAxiosError(detail: unknown): AxiosError {
    return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
      data: { detail },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as any,
    })
  }

  it('returns backend detail when it is a non-empty string', () => {
    const error = createAxiosError('Invalid credentials')

    expect(getBackendErrorMessage(error, fallbackMessage)).toBe('Invalid credentials')
  })

  it('returns fallback message when backend detail is an empty string', () => {
    const error = createAxiosError('   ')

    expect(getBackendErrorMessage(error, fallbackMessage)).toBe(fallbackMessage)
  })

  it('returns joined errors when backend detail contains an errors array', () => {
    const error = createAxiosError({
      errors: ['Email is required', 'Password is required'],
    })

    expect(getBackendErrorMessage(error, fallbackMessage)).toBe(
      'Email is required · Password is required',
    )
  })

  it('returns fallback message when backend detail contains an empty errors array', () => {
    const error = createAxiosError({
      errors: [],
    })

    expect(getBackendErrorMessage(error, fallbackMessage)).toBe(fallbackMessage)
  })

  it('returns message when backend detail contains a non-empty message', () => {
    const error = createAxiosError({
      message: 'User not found',
    })

    expect(getBackendErrorMessage(error, fallbackMessage)).toBe('User not found')
  })

  it('returns fallback message when backend detail message is empty', () => {
    const error = createAxiosError({
      message: '   ',
    })

    expect(getBackendErrorMessage(error, fallbackMessage)).toBe(fallbackMessage)
  })

  it('returns fallback message when error is not an AxiosError', () => {
    const error = new Error('Generic error')

    expect(getBackendErrorMessage(error, fallbackMessage)).toBe(fallbackMessage)
  })

  it('returns fallback message when AxiosError has no response detail', () => {
    const error = new AxiosError('Request failed')

    expect(getBackendErrorMessage(error, fallbackMessage)).toBe(fallbackMessage)
  })

  it('returns fallback message when backend detail message is not a string', () => {
    const error = createAxiosError({
      message: 123,
    })
  
    expect(getBackendErrorMessage(error, fallbackMessage)).toBe(
      fallbackMessage,
    )
  })
})