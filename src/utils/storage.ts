const ACCESS_TOKEN_KEY = 'access_token'
const MUST_CHANGE_CREDENTIALS_KEY = 'must_change_credentials'
const ROLE_KEY = 'role'
const USER_EMAIL_KEY = 'user_email'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function getMustChangeCredentials(): boolean {
  return localStorage.getItem(MUST_CHANGE_CREDENTIALS_KEY) === 'true'
}

export function setMustChangeCredentials(value: boolean): void {
  localStorage.setItem(MUST_CHANGE_CREDENTIALS_KEY, String(value))
}

export function getRole(): string {
  return localStorage.getItem(ROLE_KEY) ?? ''
}

export function setRole(role: string): void {
  localStorage.setItem(ROLE_KEY, role)
}

export function getUserEmail(): string {
  return localStorage.getItem(USER_EMAIL_KEY) ?? ''
}

export function setUserEmail(email: string): void {
  localStorage.setItem(USER_EMAIL_KEY, email)
}

export function clearAuthStorage(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(MUST_CHANGE_CREDENTIALS_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(USER_EMAIL_KEY)
}