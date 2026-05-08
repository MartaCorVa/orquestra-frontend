import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getMock, postMock, deleteMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  deleteMock: vi.fn(),
}))

vi.mock('../../../api/axios', () => ({
  default: {
    get: getMock,
    post: postMock,
    delete: deleteMock,
  },
}))

import {
  createAssignment,
  deleteAssignment,
  getAssignments,
  type Assignment,
} from '../../../api/assignments'

describe('assignments api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets assignments', async () => {
    const assignments: Assignment[] = [
      {
        id: 1,
        employee_id: 10,
        shift_id: 20,
        assigned_at: '2026-01-01',
      },
    ]

    getMock.mockResolvedValue({ data: assignments })

    const result = await getAssignments()

    expect(getMock).toHaveBeenCalledWith('/assignments/')
    expect(result).toEqual(assignments)
  })

  it('creates an assignment', async () => {
    const payload = {
      employee_id: 10,
      shift_id: 20,
    }

    const assignment: Assignment = {
      id: 1,
      ...payload,
      assigned_at: '2026-01-01',
    }

    postMock.mockResolvedValue({ data: assignment })

    const result = await createAssignment(payload)

    expect(postMock).toHaveBeenCalledWith('/assignments/', payload)
    expect(result).toEqual(assignment)
  })

  it('deletes an assignment', async () => {
    deleteMock.mockResolvedValue({})

    await deleteAssignment(1)

    expect(deleteMock).toHaveBeenCalledWith('/assignments/1')
  })
})