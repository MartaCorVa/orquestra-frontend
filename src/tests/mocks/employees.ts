import type { Employee } from '../../api/employees'

export const employeesMock: Employee[] = [
  {
    id: 1,
    first_name: 'Marta',
    last_name: 'Lopez',
    phone_number: '600123123',
    active: true,
    user_id: 10,
    created_at: '2026-04-20T10:00:00',
  },
  {
    id: 2,
    first_name: 'Alex',
    last_name: 'Garcia',
    phone_number: '',
    active: false,
    user_id: 11,
    created_at: '2026-04-21T10:00:00',
  },
]