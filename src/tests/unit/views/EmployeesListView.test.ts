import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

import EmployeesListView from '../../../views/employees/EmployeesListView.vue'
import { getEmployees, updateEmployee } from '../../../api/employees'
import { getActiveContractByEmployee } from '../../../api/contracts'
import { employeesMock } from '../../mocks/employees'
import { contractMock } from '../../mocks/contracts'

vi.mock('../../../api/employees', () => ({
  getEmployees: vi.fn(),
  updateEmployee: vi.fn(),
}))

vi.mock('../../../api/contracts', () => ({
  getActiveContractByEmployee: vi.fn(),
}))

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/employees', component: { template: '<div />' } },
      { path: '/employees/new', component: { template: '<div />' } },
      { path: '/employees/:id/edit', component: { template: '<div />' } },
    ],
  })
}

async function mountView() {
  const router = createTestRouter()
  router.push('/employees')
  await router.isReady()

  const wrapper = mount(EmployeesListView, {
    global: {
      plugins: [router],
      stubs: {
        AppShell: {
          template: '<div><slot /></div>',
          props: ['title', 'subtitle'],
        },
        FiltersPanel: {
          template: '<div><slot /></div>',
        },
      },
    },
  })

  await flushPromises()
  return wrapper
}

describe('EmployeesListView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders employees and their active contract weekly hours', async () => {
    vi.mocked(getEmployees).mockResolvedValue(employeesMock)
    vi.mocked(getActiveContractByEmployee).mockResolvedValue(contractMock)

    const wrapper = await mountView()

    expect(wrapper.text()).toContain('Marta Lopez')
    expect(wrapper.text()).toContain('Alex Garcia')
    expect(wrapper.text()).toContain('40 h')
    expect(wrapper.text()).toContain('Active')
    expect(wrapper.text()).toContain('Inactive')
  })

  it('shows empty state when there are no employees', async () => {
    vi.mocked(getEmployees).mockResolvedValue([])
    vi.mocked(getActiveContractByEmployee).mockResolvedValue(contractMock)

    const wrapper = await mountView()

    expect(wrapper.text()).toContain('No employees found.')
  })

  it('filters employees by search query', async () => {
    vi.mocked(getEmployees).mockResolvedValue(employeesMock)
    vi.mocked(getActiveContractByEmployee).mockResolvedValue(contractMock)

    const wrapper = await mountView()

    const searchInput = wrapper.find('#employee-search')
    await searchInput.setValue('Marta')

    expect(wrapper.text()).toContain('Marta Lopez')
    expect(wrapper.text()).not.toContain('Alex Garcia')
  })

  it('updates employee status when clicking deactivate', async () => {
    vi.mocked(getEmployees).mockResolvedValue(employeesMock)
    vi.mocked(getActiveContractByEmployee).mockResolvedValue(contractMock)
    vi.mocked(updateEmployee).mockResolvedValue({
      ...employeesMock[0],
      active: false,
    })

    const wrapper = await mountView()

    const deactivateButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Deactivate')

    expect(deactivateButton).toBeDefined()

    await deactivateButton!.trigger('click')
    await flushPromises()

    expect(updateEmployee).toHaveBeenCalledWith(1, {
      first_name: 'Marta',
      last_name: 'Lopez',
      phone_number: '600123123',
      active: false,
    })
  })
})