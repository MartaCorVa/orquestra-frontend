import type { Shift, ShiftTableItem } from '../../api/shifts'

export const shiftMock: Shift = {
  id: 1,
  start_datetime: '2026-05-01T09:00:00',
  end_datetime: '2026-05-01T17:00:00',
  creation_type: 'manual',
  status: 'draft',
  schedule_id: 1,
  created_at: '2026-04-20T10:00:00',
  employee_id: 1,
  employee_name: 'Marta Lopez',
}

export const shiftsMock: Shift[] = [
  shiftMock,
  {
    id: 2,
    start_datetime: '2026-05-02T09:00:00',
    end_datetime: '2026-05-02T17:00:00',
    creation_type: 'recurrent',
    status: 'published',
    schedule_id: 1,
    created_at: '2026-04-21T10:00:00',
    employee_id: null,
    employee_name: null,
  },
]

export const shiftsTableMock: ShiftTableItem[] = [
  {
    id: 1,
    start_datetime: '2026-05-01T09:00:00',
    end_datetime: '2026-05-01T17:00:00',
    creation_type: 'manual',
    status: 'draft',
    employee_id: 1,
    employee_name: 'Marta Lopez',
  },
  {
    id: 2,
    start_datetime: '2026-05-02T09:00:00',
    end_datetime: '2026-05-02T17:00:00',
    creation_type: 'recurrent',
    status: 'published',
    employee_id: null,
    employee_name: null,
  },
]