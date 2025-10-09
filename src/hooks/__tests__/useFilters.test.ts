import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilters } from '../useFilters'

describe('useFilters', () => {
  it('initializes with empty filters', () => {
    const { result } = renderHook(() => useFilters())
    
    expect(result.current.filters).toEqual({})
  })

  it('sets filter value', () => {
    const { result } = renderHook(() => useFilters())
    
    act(() => {
      result.current.setFilter('status', 'active')
    })
    
    expect(result.current.filters).toEqual({ status: 'active' })
  })

  it('sets multiple filters', () => {
    const { result } = renderHook(() => useFilters())
    
    act(() => {
      result.current.setFilter('status', 'active')
      result.current.setFilter('category', 'news')
    })
    
    expect(result.current.filters).toEqual({
      status: 'active',
      category: 'news'
    })
  })

  it('updates existing filter', () => {
    const { result } = renderHook(() => useFilters())
    
    act(() => {
      result.current.setFilter('status', 'active')
      result.current.setFilter('status', 'inactive')
    })
    
    expect(result.current.filters).toEqual({ status: 'inactive' })
  })

  it('removes filter', () => {
    const { result } = renderHook(() => useFilters())
    
    act(() => {
      result.current.setFilter('status', 'active')
      result.current.setFilter('category', 'news')
      result.current.clearFilter('status')
    })
    
    expect(result.current.filters).toEqual({ category: 'news' })
  })

  it('clears all filters', () => {
    const { result } = renderHook(() => useFilters())
    
    act(() => {
      result.current.setFilter('status', 'active')
      result.current.setFilter('category', 'news')
      result.current.clearAllFilters()
    })
    
    expect(result.current.filters).toEqual({})
  })

  it('checks if filter is active', () => {
    const { result } = renderHook(() => useFilters())
    
    act(() => {
      result.current.setFilter('status', 'active')
    })
    
    expect(result.current.isFilterActive('status')).toBe(true)
    expect(result.current.isFilterActive('category')).toBe(false)
  })

  it('gets filter value', () => {
    const { result } = renderHook(() => useFilters())
    
    act(() => {
      result.current.setFilter('status', 'active')
    })
    
    expect(result.current.getFilterValue('status')).toBe('active')
    expect(result.current.getFilterValue('category')).toBeUndefined()
  })

  it('handles different value types', () => {
    const { result } = renderHook(() => useFilters())
    
    act(() => {
      result.current.setFilter('count', 5)
      result.current.setFilter('enabled', true)
      result.current.setFilter('tags', ['tag1', 'tag2'])
    })
    
    expect(result.current.filters).toEqual({
      count: 5,
      enabled: true,
      tags: ['tag1', 'tag2']
    })
  })
})