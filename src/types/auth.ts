export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  must_change_password: boolean
  role: string
  user: string
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
}

export interface AuthUser {
  id: number
  email: string
  role: string
}