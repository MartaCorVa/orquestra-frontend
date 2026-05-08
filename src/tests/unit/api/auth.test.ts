import { beforeEach, describe, expect, it, vi } from 'vitest'

const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn(),
}))

vi.mock('../../../api/axios', () => ({
  default: {
    post: postMock,
  },
}))

import { changePasswordRequest, loginRequest } from '../../../api/auth'

describe('auth api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('logs in a user', async () => {
    const credentials = {
      username: 'marta',
      password: 'password123',
    }

    const responseData = {
      access_token: 'token',
      token_type: 'bearer',
    }

    postMock.mockResolvedValue({
      data: responseData,
    })

    const result = await loginRequest(credentials)

    expect(postMock).toHaveBeenCalledWith(
      '/auth/login',
      expect.any(URLSearchParams),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )

    const formData = postMock.mock.calls[0][1] as URLSearchParams

    expect(formData.get('username')).toBe(credentials.username)
    expect(formData.get('password')).toBe(credentials.password)

    expect(result).toEqual(responseData)
  })

  it('changes password', async () => {
    const payload = {
      current_password: 'oldPassword',
      new_password: 'newPassword',
    }

    postMock.mockResolvedValue({})

    await changePasswordRequest(payload)

    expect(postMock).toHaveBeenCalledWith(
      '/auth/change-password',
      payload,
    )
  })
})