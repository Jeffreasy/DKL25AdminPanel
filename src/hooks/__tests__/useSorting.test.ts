import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSorting, applySorting } from '../useSorting'

describe('useSorting', () => {
  describe('Initialization', () => {
    it('initializes with default values', () => {
      const { result } = renderHook(() => useSorting())

      expect(result.current.sortConfig).toEqual({
        key: null,
        direction: null,
      })
    })

    it('initializes with provided sort key and direction', () => {
      const { result } = renderHook(() =>
        useSorting({
          initialSortKey: 'name',
          initialSortDirection: 'desc',
        })
      )

      expect(result.current.sortConfig).toEqual({
        key: 'name',
        direction: 'desc',
      })
    })

    it('sets direction to null when no initial key provided', () => {
      const { result } = renderHook(() =>
        useSorting({
          initialSortDirection: 'desc',
        })
      )

      expect(result.current.sortConfig.direction).toBeNull()
    })
  })

  describe('sortBy', () => {
    it('sorts by key in ascending order initially', () => {
      const { result } = renderHook(() => useSorting())

      act(() => {
        result.current.sortBy('name')
      })

      expect(result.current.sortConfig).toEqual({
        key: 'name',
        direction: 'asc',
      })
    })

    it('cycles through asc -> desc -> null', () => {
      const { result } = renderHook(() => useSorting())

      // First click: asc
      act(() => {
        result.current.sortBy('name')
      })
      expect(result.current.sortConfig.direction).toBe('asc')

      // Second click: desc
      act(() => {
        result.current.sortBy('name')
      })
      expect(result.current.sortConfig.direction).toBe('desc')

      // Third click: null
      act(() => {
        result.current.sortBy('name')
      })
      expect(result.current.sortConfig).toEqual({
        key: null,
        direction: null,
      })
    })

    it('resets to asc when sorting by different key', () => {
      const { result } = renderHook(() => useSorting())

      act(() => {
        result.current.sortBy('name')
      })

      act(() => {
        result.current.sortBy('name')
      })
      expect(result.current.sortConfig.direction).toBe('desc')

      act(() => {
        result.current.sortBy('email')
      })
      expect(result.current.sortConfig).toEqual({
        key: 'email',
        direction: 'asc',
      })
    })

    it('calls onSortChange callback', () => {
      const onSortChange = vi.fn()
      const { result } = renderHook(() => useSorting({ onSortChange }))

      act(() => {
        result.current.sortBy('name')
      })

      expect(onSortChange).toHaveBeenCalledWith({
        key: 'name',
        direction: 'asc',
      })
    })
  })

  describe('toggleSort', () => {
    it('toggles between asc and desc', () => {
      const { result } = renderHook(() => useSorting())

      act(() => {
        result.current.toggleSort('name')
      })
      expect(result.current.sortConfig.direction).toBe('asc')

      act(() => {
        result.current.toggleSort('name')
      })
      expect(result.current.sortConfig.direction).toBe('desc')

      act(() => {
        result.current.toggleSort('name')
      })
      expect(result.current.sortConfig.direction).toBe('asc')
    })

    it('sets to asc when toggling different key', () => {
      const { result } = renderHook(() => useSorting())

      act(() => {
        result.current.toggleSort('name')
      })
      act(() => {
        result.current.toggleSort('name')
      })
      expect(result.current.sortConfig.direction).toBe('desc')

      act(() => {
        result.current.toggleSort('email')
      })
      expect(result.current.sortConfig).toEqual({
        key: 'email',
        direction: 'asc',
      })
    })

    it('calls onSortChange callback', () => {
      const onSortChange = vi.fn()
      const { result } = renderHook(() => useSorting({ onSortChange }))

      act(() => {
        result.current.toggleSort('name')
      })

      expect(onSortChange).toHaveBeenCalledWith({
        key: 'name',
        direction: 'asc',
      })
    })
  })

  describe('clearSort', () => {
    it('clears sorting', () => {
      const { result } = renderHook(() =>
        useSorting({
          initialSortKey: 'name',
          initialSortDirection: 'asc',
        })
      )

      act(() => {
        result.current.clearSort()
      })

      expect(result.current.sortConfig).toEqual({
        key: null,
        direction: null,
      })
    })

    it('calls onSortChange callback', () => {
      const onSortChange = vi.fn()
      const { result } = renderHook(() =>
        useSorting({
          initialSortKey: 'name',
          onSortChange,
        })
      )

      act(() => {
        result.current.clearSort()
      })

      expect(onSortChange).toHaveBeenCalledWith({
        key: null,
        direction: null,
      })
    })
  })

  describe('getSortDirection', () => {
    it('returns direction for sorted key', () => {
      const { result } = renderHook(() =>
        useSorting<'name' | 'email'>({
          initialSortKey: 'name',
          initialSortDirection: 'desc',
        })
      )

      expect(result.current.getSortDirection('name')).toBe('desc')
    })

    it('returns null for unsorted key', () => {
      const { result } = renderHook(() =>
        useSorting<'name' | 'email'>({
          initialSortKey: 'name',
        })
      )

      expect(result.current.getSortDirection('email')).toBeNull()
    })
  })

  describe('isSorted', () => {
    it('returns true for sorted key', () => {
      const { result } = renderHook(() =>
        useSorting<'name' | 'email'>({
          initialSortKey: 'name',
        })
      )

      expect(result.current.isSorted('name')).toBe(true)
    })

    it('returns false for unsorted key', () => {
      const { result } = renderHook(() =>
        useSorting<'name' | 'email'>({
          initialSortKey: 'name',
        })
      )

      expect(result.current.isSorted('email')).toBe(false)
    })

    it('returns false when direction is null', () => {
      const { result } = renderHook(() => useSorting())

      expect(result.current.isSorted('name')).toBe(false)
    })
  })
})

describe('applySorting', () => {
  interface TestData {
    id: number
    name: string
    age: number
    email: string
    createdAt: string
  }

  const testData: TestData[] = [
    { id: 1, name: 'Charlie', age: 30, email: 'charlie@example.com', createdAt: '2023-01-15' },
    { id: 2, name: 'Alice', age: 25, email: 'alice@example.com', createdAt: '2023-03-20' },
    { id: 3, name: 'Bob', age: 35, email: 'bob@example.com', createdAt: '2023-02-10' },
  ]

  describe('String Sorting', () => {
    it('sorts strings in ascending order', () => {
      const sorted = applySorting(testData, { key: 'name', direction: 'asc' })

      expect(sorted.map(d => d.name)).toEqual(['Alice', 'Bob', 'Charlie'])
    })

    it('sorts strings in descending order', () => {
      const sorted = applySorting(testData, { key: 'name', direction: 'desc' })

      expect(sorted.map(d => d.name)).toEqual(['Charlie', 'Bob', 'Alice'])
    })
  })

  describe('Number Sorting', () => {
    it('sorts numbers in ascending order', () => {
      const sorted = applySorting(testData, { key: 'age', direction: 'asc' })

      expect(sorted.map(d => d.age)).toEqual([25, 30, 35])
    })

    it('sorts numbers in descending order', () => {
      const sorted = applySorting(testData, { key: 'age', direction: 'desc' })

      expect(sorted.map(d => d.age)).toEqual([35, 30, 25])
    })
  })

  describe('No Sorting', () => {
    it('returns original data when key is null', () => {
      const sorted = applySorting(testData, { key: null, direction: 'asc' })

      expect(sorted).toEqual(testData)
    })

    it('returns original data when direction is null', () => {
      const sorted = applySorting(testData, { key: 'name', direction: null })

      expect(sorted).toEqual(testData)
    })
  })

  describe('Null/Undefined Handling', () => {
    it('handles null values', () => {
      const dataWithNull = [
        { id: 1, name: 'Alice', value: 10 },
        { id: 2, name: null as any, value: 20 },
        { id: 3, name: 'Bob', value: 30 },
      ]

      const sorted = applySorting(dataWithNull, { key: 'name', direction: 'asc' })

      expect(sorted[0].name).toBe('Alice')
      expect(sorted[1].name).toBe('Bob')
      expect(sorted[2].name).toBeNull()
    })

    it('handles undefined values', () => {
      const dataWithUndefined = [
        { id: 1, name: 'Alice', value: 10 },
        { id: 2, name: undefined as any, value: 20 },
        { id: 3, name: 'Bob', value: 30 },
      ]

      const sorted = applySorting(dataWithUndefined, { key: 'name', direction: 'asc' })

      expect(sorted[0].name).toBe('Alice')
      expect(sorted[1].name).toBe('Bob')
      expect(sorted[2].name).toBeUndefined()
    })

    it('handles both null values equally', () => {
      const dataWithNulls = [
        { id: 1, name: null as any },
        { id: 2, name: null as any },
      ]

      const sorted = applySorting(dataWithNulls, { key: 'name', direction: 'asc' })

      expect(sorted).toHaveLength(2)
    })
  })

  describe('Custom Compare Function', () => {
    it('uses custom compare function', () => {
      const compareFn = (a: TestData, b: TestData, key: string) => {
        if (key === 'createdAt') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        }
        return 0
      }

      const sorted = applySorting(testData, { key: 'createdAt', direction: 'asc' }, compareFn)

      expect(sorted.map(d => d.createdAt)).toEqual([
        '2023-01-15',
        '2023-02-10',
        '2023-03-20',
      ])
    })

    it('respects direction with custom compare function', () => {
      const compareFn = (a: TestData, b: TestData, key: string) => {
        if (key === 'createdAt') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        }
        return 0
      }

      const sorted = applySorting(testData, { key: 'createdAt', direction: 'desc' }, compareFn)

      expect(sorted.map(d => d.createdAt)).toEqual([
        '2023-03-20',
        '2023-02-10',
        '2023-01-15',
      ])
    })
  })

  describe('Immutability', () => {
    it('does not mutate original array', () => {
      const original = [...testData]
      applySorting(testData, { key: 'name', direction: 'asc' })

      expect(testData).toEqual(original)
    })
  })
})