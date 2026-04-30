import type { Schedule } from '../../api/schedules'

export const schedulesMock: Schedule[] = [
  {
    id: 1,
    start_date: '2026-05-01',
    end_date: '2026-05-31',
    status: 'draft',
    created_at: '2026-04-20T10:00:00',
  },
  {
    id: 2,
    start_date: '2026-06-01',
    end_date: '2026-06-30',
    status: 'generated',
    created_at: '2026-04-21T10:00:00',
  },
]