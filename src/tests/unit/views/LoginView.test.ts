import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import LoginView from '../../../views/auth/LoginView.vue'
import { authStoreMock } from '../../mocks/authStore'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push,
  }),
}))

vi.mock('../../../stores/auth', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('LoginView', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    authStoreMock.isAuthLoading = false
    authStoreMock.authError = ''
    authStoreMock.mustChangePassword = false
    authStoreMock.login = vi.fn().mockResolvedValue(undefined)
    authStoreMock.clearError = vi.fn()
  })

  it('renders the login form', () => {
    const wrapper = mount(LoginView)

    expect(wrapper.text()).toContain('Sign in')
    expect(wrapper.find('input#username').exists()).toBe(true)
    expect(wrapper.find('input#password').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Login')
  })

  it('submits credentials and redirects to dashboard', async () => {
    const wrapper = mount(LoginView)

    await wrapper.find('input#username').setValue('admin@orquestra.com')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    await flushPromises()

    expect(authStoreMock.clearError).toHaveBeenCalledOnce()
    expect(authStoreMock.login).toHaveBeenCalledWith({
      username: 'admin@orquestra.com',
      password: 'password123',
    })
    expect(push).toHaveBeenCalledWith({ name: 'dashboard' })
  })

  it('redirects to change password when required', async () => {
    authStoreMock.mustChangePassword = true

    const wrapper = mount(LoginView)

    await wrapper.find('input#username').setValue('employee@orquestra.com')
    await wrapper.find('input#password').setValue('temporary123')
    await wrapper.find('form').trigger('submit.prevent')

    await flushPromises()

    expect(authStoreMock.login).toHaveBeenCalledOnce()
    expect(push).toHaveBeenCalledWith({ name: 'change-password' })
  })

  it('shows the authentication error when login fails', () => {
    authStoreMock.authError = 'Invalid credentials. Please try again.'

    const wrapper = mount(LoginView)

    expect(wrapper.text()).toContain('Invalid credentials. Please try again.')
  })

  it('disables inputs and shows loading text while signing in', () => {
    authStoreMock.isAuthLoading = true

    const wrapper = mount(LoginView)

    expect(wrapper.find('input#username').attributes('disabled')).toBeDefined()
    expect(wrapper.find('input#password').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button[type="submit"]').text()).toBe('Signing in...')
  })
})