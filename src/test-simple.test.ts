import { describe, it, expect, test } from 'vitest'

test('simple math', () => {
  expect(1 + 1).toBe(2)
})

describe('Simple Test Suite', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })
  
  test('another test', () => {
    expect(2 + 2).toBe(4)
  })
})