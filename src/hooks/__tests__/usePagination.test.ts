import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePagination } from '../usePagination'

describe('usePagination', () => {
  it('initializes with correct values', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100 }))
    
    expect(result.current.currentPage).toBe(1)
    expect(result.current.pageSize).toBe(10)
    expect(result.current.totalPages).toBe(10)
    expect(result.current.startIndex).toBe(0)
    expect(result.current.endIndex).toBe(10)
  })

  it('goes to next page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100 }))
    
    act(() => {
      result.current.goToNextPage()
    })
    
    expect(result.current.currentPage).toBe(2)
    expect(result.current.startIndex).toBe(10)
    expect(result.current.endIndex).toBe(20)
  })

  it('goes to previous page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100 }))
    
    act(() => {
      result.current.goToPage(3)
    })
    
    expect(result.current.currentPage).toBe(3)
    
    act(() => {
      result.current.goToPreviousPage()
    })
    
    expect(result.current.currentPage).toBe(2)
  })

  it('goes to specific page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100 }))
    
    act(() => {
      result.current.goToPage(5)
    })
    
    expect(result.current.currentPage).toBe(5)
    expect(result.current.startIndex).toBe(40)
    expect(result.current.endIndex).toBe(50)
  })

  it('goes to first page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100 }))
    
    act(() => {
      result.current.goToPage(5)
      result.current.goToFirstPage()
    })
    
    expect(result.current.currentPage).toBe(1)
  })

  it('goes to last page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100 }))
    
    act(() => {
      result.current.goToLastPage()
    })
    
    expect(result.current.currentPage).toBe(10)
  })

  it('does not go beyond last page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100 }))
    
    act(() => {
      result.current.goToPage(15)
    })
    
    expect(result.current.currentPage).toBe(10)
  })

  it('does not go before first page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100 }))
    
    act(() => {
      result.current.goToPage(0)
    })
    
    expect(result.current.currentPage).toBe(1)
  })

  it('changes page size', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100 }))
    
    act(() => {
      result.current.setPageSize(25)
    })
    
    expect(result.current.pageSize).toBe(25)
    expect(result.current.totalPages).toBe(4)
    expect(result.current.currentPage).toBe(1)
  })

  it('resets to initial state', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100, initialPage: 1, initialPageSize: 10 }))
    
    act(() => {
      result.current.goToPage(5)
      result.current.setPageSize(25)
    })
    
    expect(result.current.currentPage).toBe(1)
    expect(result.current.pageSize).toBe(25)
    
    act(() => {
      result.current.reset()
    })
    
    expect(result.current.currentPage).toBe(1)
    expect(result.current.pageSize).toBe(10)
  })

  it('handles zero items', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 0 }))
    
    expect(result.current.totalPages).toBe(1)
    expect(result.current.hasNextPage).toBe(false)
  })

  it('handles single page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 5 }))
    
    expect(result.current.totalPages).toBe(1)
    expect(result.current.hasNextPage).toBe(false)
    expect(result.current.hasPreviousPage).toBe(false)
  })
})