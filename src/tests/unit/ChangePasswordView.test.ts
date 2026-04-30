import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ChangePasswordView from '../../views/auth/ChangePasswordView.vue'
import { authStoreMock } from '../mocks/authStore'

const pushMock = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

vi.mock('../../stores/auth', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('ChangePasswordView', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    authStoreMock.isAuthLoading = false
    authStoreMock.authError = ''
  })

  it('renders the change password form', () => {
    const wrapper = mount(ChangePasswordView)

    expect(wrapper.text()).toContain('Change password')
    expect(wrapper.find('#current-password').exists()).toBe(true)
    expect(wrapper.find('#new-password').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Change password')
  })

  it('changes password and redirects to dashboard on success', async () => {
    authStoreMock.changePassword.mockResolvedValueOnce(undefined)

    const wrapper = mount(ChangePasswordView)

    await wrapper.find('#current-password').setValue('old-password')
    await wrapper.find('#new-password').setValue('new-password')
    await wrapper.find('form').trigger('submit.prevent')

    expect(authStoreMock.clearError).toHaveBeenCalledOnce()
    expect(authStoreMock.changePassword).toHaveBeenCalledWith({
      current_password: 'old-password',
      new_password: 'new-password',
    })
    expect(pushMock).toHaveBeenCalledWith({ name: 'dashboard' })
  })

  it('shows auth error and does not redirect when password change fails', async () => {
    authStoreMock.authError = 'Unable to change password. Please try again.'
    authStoreMock.changePassword.mockRejectedValueOnce(new Error('Invalid password'))

    const wrapper = mount(ChangePasswordView)

    await wrapper.find('#current-password').setValue('wrong-password')
    await wrapper.find('#new-password').setValue('new-password')
    await wrapper.find('form').trigger('submit.prevent')

    expect(authStoreMock.clearError).toHaveBeenCalledOnce()
    expect(authStoreMock.changePassword).toHaveBeenCalledWith({
      current_password: 'wrong-password',
      new_password: 'new-password',
    })
    expect(wrapper.text()).toContain('Unable to change password. Please try again.')
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('disables inputs and shows loading text while updating password', () => {
    authStoreMock.isAuthLoading = true

    const wrapper = mount(ChangePasswordView)

    expect(wrapper.find('#current-password').attributes('disabled')).toBeDefined()
    expect(wrapper.find('#new-password').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button[type="submit"]').text()).toBe('Updating password...')
  })
})