import { beforeEach, describe, expect, it } from 'vitest'

import {
  clearAuthStorage,
  getAccessToken,
  getMustChangeCredentials,
  getRole,
  getUserEmail,
  setAccessToken,
  setMustChangeCredentials,
  setRole,
  setUserEmail,
} from '../../../utils/storage'

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('sets and gets access token', () => {
    setAccessToken('mock-token')

    expect(getAccessToken()).toBe('mock-token')
  })

  it('returns null when access token does not exist', () => {
    expect(getAccessToken()).toBeNull()
  })

  it('sets and gets must change credentials flag', () => {
    setMustChangeCredentials(true)

    expect(getMustChangeCredentials()).toBe(true)
  })

  it('returns false when must change credentials flag does not exist', () => {
    expect(getMustChangeCredentials()).toBe(false)
  })

  it('sets and gets role', () => {
    setRole('manager')

    expect(getRole()).toBe('manager')
  })

  it('returns empty string when role does not exist', () => {
    expect(getRole()).toBe('')
  })

  it('sets and gets user email', () => {
    setUserEmail('marta@example.com')

    expect(getUserEmail()).toBe('marta@example.com')
  })

  it('returns empty string when user email does not exist', () => {
    expect(getUserEmail()).toBe('')
  })

  it('clears auth storage', () => {
    setAccessToken('mock-token')
    setMustChangeCredentials(true)
    setRole('manager')
    setUserEmail('marta@example.com')

    clearAuthStorage()

    expect(getAccessToken()).toBeNull()
    expect(getMustChangeCredentials()).toBe(false)
    expect(getRole()).toBe('')
    expect(getUserEmail()).toBe('')
  })
})