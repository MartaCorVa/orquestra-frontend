import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { usePlanningResultsStore } from '../../../stores/planningResults'

describe('planningResults store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('sets a planning result', () => {
    const store = usePlanningResultsStore()

    const result = {
      message: 'Planning generated successfully',
      assignments_created: [],
      unfilled_shifts: [],
      employees_below_target: [],
      missing_contract_hours_total: 0,
    }

    store.setResult(1, result)

    expect(store.results[1]).toEqual(result)
  })

  it('gets a planning result', () => {
    const store = usePlanningResultsStore()

    const result = {
      message: 'Planning generated successfully',
      assignments_created: [],
      unfilled_shifts: [],
      employees_below_target: [],
      missing_contract_hours_total: 0,
    }

    store.setResult(1, result)

    expect(store.getResult(1)).toEqual(result)
  })

  it('returns null when planning result does not exist', () => {
    const store = usePlanningResultsStore()

    expect(store.getResult(999)).toBeNull()
  })

  it('clears a planning result', () => {
    const store = usePlanningResultsStore()

    const result = {
      message: 'Planning generated successfully',
      assignments_created: [],
      unfilled_shifts: [],
      employees_below_target: [],
      missing_contract_hours_total: 0,
    }

    store.setResult(1, result)

    store.clearResult(1)

    expect(store.getResult(1)).toBeNull()
  })
})