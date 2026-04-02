const ACCESS_TOKEN_KEY = 'access_token'
const MUST_CHANGE_PASSWORD_KEY = 'must_change_password'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function removeAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export function getMustChangePassword(): boolean {
  return localStorage.getItem(MUST_CHANGE_PASSWORD_KEY) === 'true'
}

export function setMustChangePassword(value: boolean): void {
  localStorage.setItem(MUST_CHANGE_PASSWORD_KEY, String(value))
}

export function removeMustChangePassword(): void {
  localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY)
}

export function clearAuthStorage(): void {
  removeAccessToken()
  removeMustChangePassword()
}