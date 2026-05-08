import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getAccessTokenMock, clearAuthStorageMock } = vi.hoisted(() => ({
  getAccessTokenMock: vi.fn(),
  clearAuthStorageMock: vi.fn(),
}))

vi.mock('../../../utils/storage', () => ({
  getAccessToken: getAccessTokenMock,
  clearAuthStorage: clearAuthStorageMock,
}))

import apiClient from '../../../api/axios'

function getRequestFulfilledInterceptor() {
  const interceptor = apiClient.interceptors.request.handlers?.[0]?.fulfilled

  if (!interceptor) {
    throw new Error('Request interceptor not found')
  }

  return interceptor
}

function getResponseRejectedInterceptor() {
  const interceptor = apiClient.interceptors.response.handlers?.[0]?.rejected

  if (!interceptor) {
    throw new Error('Response interceptor not found')
  }

  return interceptor
}

describe('axios api client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('adds authorization header when token exists', async () => {
    getAccessTokenMock.mockReturnValue('mock-token')

    const interceptor = getRequestFulfilledInterceptor()
    const config = { headers: {} }

    const result = (await interceptor(config as any)) as any

    expect(result.headers.Authorization).toBe('Bearer mock-token')
  })

  it('does not add authorization header when token does not exist', async () => {
    getAccessTokenMock.mockReturnValue(null)

    const interceptor = getRequestFulfilledInterceptor()
    const config = { headers: {} }

    const result = (await interceptor(config as any)) as any

    expect(result.headers.Authorization).toBeUndefined()
  })

  it('clears auth storage on 401 response', () => {
    const interceptor = getResponseRejectedInterceptor()

    const error = new AxiosError('Unauthorized')
    error.response = {
      status: 401,
      data: {},
      statusText: 'Unauthorized',
      headers: {},
      config: {} as any,
    }

    expect(() => interceptor(error)).toThrow(error)
    expect(clearAuthStorageMock).toHaveBeenCalled()
  })

  it('does not clear auth storage on non-401 response', () => {
    const interceptor = getResponseRejectedInterceptor()
    
    const error = new AxiosError('Server error')
    error.response = {
      status: 500,
      data: {},
      statusText: 'Server Error',
      headers: {},
      config: {} as any,
    }
  
    expect(() => interceptor(error)).toThrow(error)
    expect(clearAuthStorageMock).not.toHaveBeenCalled()
  })
})