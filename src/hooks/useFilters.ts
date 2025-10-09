import { useState, useCallback, useMemo } from 'react'

/**
 * Generic filter management hook
 * Provides filter state and utilities for filtering data
 */

export type FilterValue = string | number | boolean | null | undefined | string[]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface FilterConfig<T extends string = string> {
  [key: string]: FilterValue
}

export interface UseFiltersOptions<T extends string = string> {
  initialFilters?: FilterConfig<T>
  onFilterChange?: (filters: FilterConfig<T>) => void
}

export interface UseFiltersReturn<T extends string = string> {
  filters: FilterConfig<T>
  activeFiltersCount: number
  hasActiveFilters: boolean
  setFilter: (key: T, value: FilterValue) => void
  setFilters: (filters: Partial<FilterConfig<T>>) => void
  clearFilter: (key: T) => void
  clearAllFilters: () => void
  toggleFilter: (key: T, value: FilterValue) => void
  isFilterActive: (key: T) => boolean
  getFilterValue: (key: T) => FilterValue
}

export function useFilters<T extends string = string>({
  initialFilters = {},
  onFilterChange
}: UseFiltersOptions<T> = {}): UseFiltersReturn<T> {
  const [filters, setFiltersState] = useState<FilterConfig<T>>(initialFilters)

  // Count active filters (non-null, non-undefined, non-empty)
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => {
      if (value === null || value === undefined || value === '') return false
      if (Array.isArray(value)) return value.length > 0
      return true
    }).length
  }, [filters])

  const hasActiveFilters = activeFiltersCount > 0

  // Set a single filter
  const setFilter = useCallback((key: T, value: FilterValue) => {
    setFiltersState(prev => {
      const newFilters = { ...prev, [key]: value }
      onFilterChange?.(newFilters)
      return newFilters
    })
  }, [onFilterChange])

  // Set multiple filters at once
  const setFilters = useCallback((newFilters: Partial<FilterConfig<T>>) => {
    setFiltersState(prev => {
      const updated = { ...prev, ...newFilters }
      onFilterChange?.(updated)
      return updated
    })
  }, [onFilterChange])

  // Clear a single filter
  const clearFilter = useCallback((key: T) => {
    setFiltersState(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      onFilterChange?.(newFilters)
      return newFilters
    })
  }, [onFilterChange])

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFiltersState({})
    onFilterChange?.({})
  }, [onFilterChange])

  // Toggle a filter value (useful for boolean filters)
  const toggleFilter = useCallback((key: T, value: FilterValue) => {
    setFiltersState(prev => {
      const currentValue = prev[key]
      const newValue = currentValue === value ? undefined : value
      const newFilters = { ...prev, [key]: newValue }
      onFilterChange?.(newFilters)
      return newFilters
    })
  }, [onFilterChange])

  // Check if a filter is active
  const isFilterActive = useCallback((key: T): boolean => {
    const value = filters[key]
    if (value === null || value === undefined || value === '') return false
    if (Array.isArray(value)) return value.length > 0
    return true
  }, [filters])

  // Get filter value
  const getFilterValue = useCallback((key: T): FilterValue => {
    return filters[key]
  }, [filters])

  return {
    filters,
    activeFiltersCount,
    hasActiveFilters,
    setFilter,
    setFilters,
    clearFilter,
    clearAllFilters,
    toggleFilter,
    isFilterActive,
    getFilterValue
  }
}

/**
 * Helper function to apply filters to data
 */
export function applyFilters<T>(
  data: T[],
  filters: FilterConfig,
  filterFn: (item: T, filters: FilterConfig) => boolean
): T[] {
  if (Object.keys(filters).length === 0) {
    return data
  }
  return data.filter(item => filterFn(item, filters))
}

/**
 * Example usage:
 * 
 * ```typescript
 * interface Product {
 *   id: string
 *   name: string
 *   category: string
 *   price: number
 *   inStock: boolean
 * }
 * 
 * function ProductList({ products }: { products: Product[] }) {
 *   const filters = useFilters<'category' | 'inStock' | 'search'>({
 *     initialFilters: {
 *       category: '',
 *       inStock: undefined,
 *       search: ''
 *     }
 *   })
 * 
 *   const filteredProducts = useMemo(() => {
 *     return applyFilters(products, filters.filters, (product, filters) => {
 *       if (filters.category && product.category !== filters.category) {
 *         return false
 *       }
 *       if (filters.inStock !== undefined && product.inStock !== filters.inStock) {
 *         return false
 *       }
 *       if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
 *         return false
 *       }
 *       return true
 *     })
 *   }, [products, filters.filters])
 * 
 *   return (
 *     <div>
 *       <div className="filters">
 *         <input
 *           type="text"
 *           placeholder="Search..."
 *           value={filters.getFilterValue('search') as string || ''}
 *           onChange={(e) => filters.setFilter('search', e.target.value)}
 *         />
 * 
 *         <select
 *           value={filters.getFilterValue('category') as string || ''}
 *           onChange={(e) => filters.setFilter('category', e.target.value)}
 *         >
 *           <option value="">All Categories</option>
 *           <option value="electronics">Electronics</option>
 *           <option value="clothing">Clothing</option>
 *         </select>
 * 
 *         <label>
 *           <input
 *             type="checkbox"
 *             checked={filters.getFilterValue('inStock') as boolean || false}
 *             onChange={(e) => filters.setFilter('inStock', e.target.checked)}
 *           />
 *           In Stock Only
 *         </label>
 * 
 *         {filters.hasActiveFilters && (
 *           <button onClick={filters.clearAllFilters}>
 *             Clear Filters ({filters.activeFiltersCount})
 *           </button>
 *         )}
 *       </div>
 * 
 *       <div className="products">
 *         {filteredProducts.map(product => (
 *           <div key={product.id}>{product.name}</div>
 *         ))}
 *       </div>
 *     </div>
 *   )
 * }
 * ```
 */