import { describe, it, expect } from 'vitest'
import { safeParse } from '../src/utils/jsonUtils'

describe('safeParse', () => {
  it('parses valid json', () => {
    const { parsed, error } = safeParse('{"a":1}')
    expect(error).toBeNull()
    expect(parsed).toEqual({ a: 1 })
  })
  it('returns error on invalid json', () => {
    const { parsed, error } = safeParse('{a:1}')
    expect(parsed).toBeNull()
    expect(error).not.toBeNull()
  })
})