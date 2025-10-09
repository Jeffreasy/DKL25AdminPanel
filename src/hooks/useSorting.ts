import { useState, useCallback } from 'react'

/**
 * Generic sorting hook for tables and lists
 * Provides sorting state and utilities
 */

export type SortDirection = 'asc' | 'desc' | null

export interface SortConfig<T extends string = string> {
  key: T | null
  direction: SortDirection
}

export interface UseSortingOptions<T extends string = string> {
  initialSortKey?: T | null
  initialSortDirection?: SortDirection
  onSortChange?: (config: SortConfig<T>) => void
}

export interface UseSortingReturn<T extends string = string> {
  sortConfig: SortConfig<T>
  sortBy: (key: T) => void
  clearSort: () => void
  getSortDirection: (key: T) => SortDirection
  isSorted: (key: T) => boolean
  toggleSort: (key: T) => void
}

export function useSorting<T extends string = string>({
  initialSortKey = null,
  initialSortDirection = 'asc',
  onSortChange
}: UseSortingOptions<T> = {}): UseSortingReturn<T> {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: initialSortKey,
    direction: initialSortKey ? initialSortDirection : null
  })

  // Sort by a specific key
  const sortBy = useCallback((key: T) => {
    setSortConfig(prev => {
      let newDirection: SortDirection = 'asc'
      
      if (prev.key === key) {
        // Cycle through: asc -> desc -> null
        if (prev.direction === 'asc') {
          newDirection = 'desc'
        } else if (prev.direction === 'desc') {
          newDirection = null
        }
      }

      const newConfig: SortConfig<T> = {
        key: newDirection === null ? null : key,
        direction: newDirection
      }

      onSortChange?.(newConfig)
      return newConfig
    })
  }, [onSortChange])

  // Toggle sort for a key (asc <-> desc)
  const toggleSort = useCallback((key: T) => {
    setSortConfig(prev => {
      const newDirection: SortDirection = 
        prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
      
      const newConfig: SortConfig<T> = {
        key,
        direction: newDirection
      }

      onSortChange?.(newConfig)
      return newConfig
    })
  }, [onSortChange])

  // Clear sorting
  const clearSort = useCallback(() => {
    const newConfig: SortConfig<T> = {
      key: null,
      direction: null
    }
    setSortConfig(newConfig)
    onSortChange?.(newConfig)
  }, [onSortChange])

  // Get sort direction for a specific key
  const getSortDirection = useCallback((key: T): SortDirection => {
    return sortConfig.key === key ? sortConfig.direction : null
  }, [sortConfig])

  // Check if a key is currently sorted
  const isSorted = useCallback((key: T): boolean => {
    return sortConfig.key === key && sortConfig.direction !== null
  }, [sortConfig])

  return {
    sortConfig,
    sortBy,
    clearSort,
    getSortDirection,
    isSorted,
    toggleSort
  }
}

/**
 * Helper function to apply sorting to data
 */
export function applySorting<T>(
  data: T[],
  sortConfig: SortConfig,
  compareFn?: (a: T, b: T, key: string) => number
): T[] {
  if (!sortConfig.key || !sortConfig.direction) {
    return data
  }

  return [...data].sort((a, b) => {
    // Use custom compare function if provided
    if (compareFn) {
      const result = compareFn(a, b, sortConfig.key!)
      return sortConfig.direction === 'asc' ? result : -result
    }

    // Default comparison
    const aValue = (a as Record<string, unknown>)[sortConfig.key!]
    const bValue = (b as Record<string, unknown>)[sortConfig.key!]

    // Handle null/undefined
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return 1
    if (bValue == null) return -1

    // String comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const result = aValue.localeCompare(bValue)
      return sortConfig.direction === 'asc' ? result : -result
    }

    // Number/Date comparison
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })
}

/**
 * Example usage:
 * 
 * ```typescript
 * interface User {
 *   id: string
 *   name: string
 *   email: string
 *   age: number
 *   createdAt: string
 * }
 * 
 * function UserTable({ users }: { users: User[] }) {
 *   const sorting = useSorting<keyof User>({
 *     initialSortKey: 'name',
 *     initialSortDirection: 'asc'
 *   })
 * 
 *   const sortedUsers = useMemo(() => {
 *     return applySorting(users, sorting.sortConfig)
 *   }, [users, sorting.sortConfig])
 * 
 *   return (
 *     <table>
 *       <thead>
 *         <tr>
 *           <th onClick={() => sorting.sortBy('name')}>
 *             Name
 *             {sorting.isSorted('name') && (
 *               <span>{sorting.getSortDirection('name') === 'asc' ? '↑' : '↓'}</span>
 *             )}
 *           </th>
 *           <th onClick={() => sorting.sortBy('email')}>
 *             Email
 *             {sorting.isSorted('email') && (
 *               <span>{sorting.getSortDirection('email') === 'asc' ? '↑' : '↓'}</span>
 *             )}
 *           </th>
 *           <th onClick={() => sorting.sortBy('age')}>
 *             Age
 *             {sorting.isSorted('age') && (
 *               <span>{sorting.getSortDirection('age') === 'asc' ? '↑' : '↓'}</span>
 *             )}
 *           </th>
 *         </tr>
 *       </thead>
 *       <tbody>
 *         {sortedUsers.map(user => (
 *           <tr key={user.id}>
 *             <td>{user.name}</td>
 *             <td>{user.email}</td>
 *             <td>{user.age}</td>
 *           </tr>
 *         ))}
 *       </tbody>
 *     </table>
 *   )
 * }
 * 
 * // With custom compare function
 * const sortedUsers = useMemo(() => {
 *   return applySorting(users, sorting.sortConfig, (a, b, key) => {
 *     if (key === 'createdAt') {
 *       return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
 *     }
 *     // Fallback to default comparison
 *     return 0
 *   })
 * }, [users, sorting.sortConfig])
 * ```
 */