import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    
    expect(result.current).toBe('initial')
  })

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )
    
    expect(result.current).toBe('initial')
    
    // Change value
    rerender({ value: 'updated', delay: 500 })
    
    // Should still be initial
    expect(result.current).toBe('initial')
    
    // Advance time
    act(() => {
      vi.advanceTimersByTime(500)
    })
    
    // Now should be updated
    expect(result.current).toBe('updated')
  })

  it('cancels previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'first' } }
    )
    
    rerender({ value: 'second' })
    act(() => { vi.advanceTimersByTime(250) })
    
    rerender({ value: 'third' })
    act(() => { vi.advanceTimersByTime(250) })
    
    // Should still be 'first'
    expect(result.current).toBe('first')
    
    // Advance full delay
    act(() => { vi.advanceTimersByTime(500) })
    
    // Should be 'third' (last value)
    expect(result.current).toBe('third')
  })

  it('handles different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'test', delay: 1000 } }
    )
    
    rerender({ value: 'updated', delay: 1000 })
    
    act(() => { vi.advanceTimersByTime(999) })
    expect(result.current).toBe('test')
    
    act(() => { vi.advanceTimersByTime(1) })
    expect(result.current).toBe('updated')
  })

  it('works with objects', () => {
    const obj1 = { id: 1, name: 'First' }
    const obj2 = { id: 2, name: 'Second' }
    
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: obj1 } }
    )
    
    expect(result.current).toEqual(obj1)
    
    rerender({ value: obj2 })
    
    act(() => { vi.advanceTimersByTime(500) })
    
    expect(result.current).toEqual(obj2)
  })

  it('works with arrays', () => {
    const arr1 = [1, 2, 3]
    const arr2 = [4, 5, 6]
    
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: arr1 } }
    )
    
    expect(result.current).toEqual(arr1)
    
    rerender({ value: arr2 })
    
    act(() => { vi.advanceTimersByTime(500) })
    
    expect(result.current).toEqual(arr2)
  })

  it('cleans up timeout on unmount', () => {
    const { unmount, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'test' } }
    )
    
    rerender({ value: 'updated' })
    
    // Unmount before timeout
    unmount()
    
    // Advance time - should not throw
    act(() => { vi.advanceTimersByTime(500) })
  })
})