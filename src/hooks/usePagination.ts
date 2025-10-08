import { useState, useCallback, useMemo } from 'react'

/**
 * Generic pagination hook
 * Provides pagination state and controls
 */

export interface UsePaginationOptions {
  initialPage?: number
  initialPageSize?: number
  totalItems: number
  pageSizeOptions?: number[]
}

export interface UsePaginationReturn {
  currentPage: number
  pageSize: number
  totalPages: number
  totalItems: number
  startIndex: number
  endIndex: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  pageSizeOptions: number[]
  goToPage: (page: number) => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void
  setPageSize: (size: number) => void
  reset: () => void
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
  totalItems,
  pageSizeOptions = [10, 25, 50, 100]
}: UsePaginationOptions): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize) || 1
  }, [totalItems, pageSize])

  // Calculate start and end indices for current page
  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize
  }, [currentPage, pageSize])

  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize, totalItems)
  }, [startIndex, pageSize, totalItems])

  // Check if there are next/previous pages
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }, [totalPages])

  const goToNextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }, [hasNextPage])

  const goToPreviousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1)
    }
  }, [hasPreviousPage])

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages)
  }, [totalPages])

  // Change page size and reset to first page
  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    setCurrentPage(1)
  }, [])

  // Reset to initial state
  const reset = useCallback(() => {
    setCurrentPage(initialPage)
    setPageSizeState(initialPageSize)
  }, [initialPage, initialPageSize])

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    pageSizeOptions,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    setPageSize,
    reset
  }
}

/**
 * Example usage:
 * 
 * ```typescript
 * function DataTable({ data }: { data: Item[] }) {
 *   const pagination = usePagination({
 *     totalItems: data.length,
 *     initialPageSize: 25
 *   })
 * 
 *   const paginatedData = data.slice(
 *     pagination.startIndex,
 *     pagination.endIndex
 *   )
 * 
 *   return (
 *     <div>
 *       <table>
 *         {paginatedData.map(item => (
 *           <tr key={item.id}>...</tr>
 *         ))}
 *       </table>
 * 
 *       <div className="pagination">
 *         <button
 *           onClick={pagination.goToPreviousPage}
 *           disabled={!pagination.hasPreviousPage}
 *         >
 *           Previous
 *         </button>
 * 
 *         <span>
 *           Page {pagination.currentPage} of {pagination.totalPages}
 *         </span>
 * 
 *         <button
 *           onClick={pagination.goToNextPage}
 *           disabled={!pagination.hasNextPage}
 *         >
 *           Next
 *         </button>
 * 
 *         <select
 *           value={pagination.pageSize}
 *           onChange={(e) => pagination.setPageSize(Number(e.target.value))}
 *         >
 *           {pagination.pageSizeOptions.map(size => (
 *             <option key={size} value={size}>{size}</option>
 *           ))}
 *         </select>
 *       </div>
 *     </div>
 *   )
 * }
 * ```
 */