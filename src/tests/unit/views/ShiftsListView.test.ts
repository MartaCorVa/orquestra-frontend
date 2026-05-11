import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import dayjs from 'dayjs'

import ShiftsListView from '../../../views/shifts/ShiftsListView.vue'
import { useAuthStore } from '../../../stores/auth'
import { getShiftsTable, deleteShift } from '../../../api/shifts'

vi.mock('../../../api/shifts', () => ({
  getShiftsTable: vi.fn(),
  deleteShift: vi.fn(),
}))

vi.mock('../../../utils/api', () => ({
  getBackendErrorMessage: vi.fn(() => 'Unable to delete shift. Please try again.'),
}))

describe('ShiftsListView', () => {
  const futureDate = dayjs().add(1, 'day').format('YYYY-MM-DD')
  const laterFutureDate = dayjs().add(2, 'day').format('YYYY-MM-DD')
  const pastDate = '2020-01-01'

  const shifts = [
    {
      id: 1,
      employee_id: 1,
      employee_name: 'Marta Lopez',
      start_datetime: `${futureDate}T09:00:00`,
      end_datetime: `${futureDate}T17:00:00`,
      creation_type: 'manual',
      status: 'planned',
    },
    {
      id: 2,
      employee_id: 2,
      employee_name: 'Alex Smith',
      start_datetime: `${laterFutureDate}T10:00:00`,
      end_datetime: `${laterFutureDate}T18:00:00`,
      creation_type: 'automatic',
      status: 'assigned',
    },
    {
      id: 3,
      employee_id: 3,
      employee_name: 'John Doe',
      start_datetime: `${pastDate}T09:00:00`,
      end_datetime: `${pastDate}T17:00:00`,
      creation_type: 'manual',
      status: 'planned',
    },
  ]

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  function setAuthRole(role: 'admin' | 'employee') {
    const authStore = useAuthStore()
    ;(authStore as unknown as { userRole: string }).userRole = role
  }

  function mountView() {
    return mount(ShiftsListView, {
      global: {
        stubs: {
          AppShell: {
            template: '<main><slot /></main>',
          },
          FiltersPanel: {
            template: '<section><slot /></section>',
            props: ['columnsClass'],
          },
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
        },
      },
    })
  }

  function tableText(wrapper: ReturnType<typeof mountView>): string {
    return wrapper.find('tbody').text()
  }

  it('loads and renders upcoming shifts ordered by most recent date first', async () => {
    setAuthRole('admin')
    vi.mocked(getShiftsTable).mockResolvedValue(shifts)

    const wrapper = mountView()

    await nextTick()
    await nextTick()

    const text = tableText(wrapper)

    expect(getShiftsTable).toHaveBeenCalled()
    expect(text).toContain('Alex Smith')
    expect(text).toContain('Marta Lopez')
    expect(text).not.toContain('John Doe')
    expect(text.indexOf('Alex Smith')).toBeLessThan(text.indexOf('Marta Lopez'))
  })

  it('shows past shifts when filtering by a past date range', async () => {
    setAuthRole('admin')
    vi.mocked(getShiftsTable).mockResolvedValue(shifts)

    const wrapper = mountView()

    await nextTick()
    await nextTick()

    await wrapper.find('#shift-start-date').setValue(pastDate)
    await wrapper.find('#shift-end-date').setValue(pastDate)

    const text = tableText(wrapper)

    expect(text).toContain('John Doe')
    expect(text).not.toContain('Marta Lopez')
    expect(text).not.toContain('Alex Smith')
  })

  it('filters shifts by employee status and creation type', async () => {
    setAuthRole('admin')
    vi.mocked(getShiftsTable).mockResolvedValue(shifts)

    const wrapper = mountView()

    await nextTick()
    await nextTick()

    await wrapper.find('#shift-employee').setValue('2')
    await wrapper.find('#shift-status').setValue('assigned')
    await wrapper.find('#shift-creation-type').setValue('automatic')

    const text = tableText(wrapper)

    expect(text).toContain('Alex Smith')
    expect(text).not.toContain('Marta Lopez')
    expect(text).not.toContain('John Doe')
  })

  it('shows empty state when there are no upcoming shifts', async () => {
    setAuthRole('admin')
    vi.mocked(getShiftsTable).mockResolvedValue([shifts[2]])

    const wrapper = mountView()

    await nextTick()
    await nextTick()

    expect(wrapper.text()).toContain('No shifts scheduled for today or upcoming dates.')
  })

  it('does not render delete button for past shifts', async () => {
    setAuthRole('admin')
    vi.mocked(getShiftsTable).mockResolvedValue(shifts)

    const wrapper = mountView()

    await nextTick()
    await nextTick()

    await wrapper.find('#shift-start-date').setValue(pastDate)
    await wrapper.find('#shift-end-date').setValue(pastDate)

    expect(tableText(wrapper)).toContain('John Doe')
    expect(tableText(wrapper)).not.toContain('Delete')
  })

  it('deletes an upcoming shift when confirmed', async () => {
    setAuthRole('admin')
    vi.mocked(getShiftsTable).mockResolvedValue(shifts)
    vi.mocked(deleteShift).mockResolvedValue()
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true)

    const wrapper = mountView()

    await nextTick()
    await nextTick()

    const deleteButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Delete')

    expect(deleteButton).toBeTruthy()

    await deleteButton!.trigger('click')

    expect(deleteShift).toHaveBeenCalledWith(2)
  })

  it('shows an error message when loading shifts fails', async () => {
    setAuthRole('admin')
    vi.mocked(getShiftsTable).mockRejectedValue(new Error('Network error'))

    const wrapper = mountView()

    await nextTick()
    await nextTick()

    expect(wrapper.text()).toContain('Failed to load shifts.')
  })
})