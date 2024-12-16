import { useInfiniteQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase/supabaseClient'

interface UseInfiniteListProps {
  queryKey: string
  table: string
  pageSize?: number
  filters?: Record<string, any>
  sortBy?: { column: string; ascending: boolean }
  searchQuery?: string
}

export function useInfiniteList({
  queryKey,
  table,
  pageSize = 20,
  filters = {},
  sortBy,
  searchQuery
}: UseInfiniteListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const fetchPage = async ({ pageParam = 0 }) => {
    let query = supabase
      .from(table)
      .select('*', { count: 'exact' })
      .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1)

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value)
      }
    })

    // Apply search
    if (searchQuery) {
      query = query.or(`naam.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
    }

    // Apply sorting
    if (sortBy) {
      query = query.order(sortBy.column, { ascending: sortBy.ascending })
    }

    const { data, count, error } = await query

    if (error) throw error

    return {
      items: data,
      totalCount: count || 0,
      nextPage: data.length === pageSize ? pageParam + 1 : undefined
    }
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    refetch,
    isRefetching
  } = useInfiniteQuery({
    queryKey: [queryKey, filters, sortBy, searchQuery],
    queryFn: fetchPage,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0
  })

  const allItems = data?.pages.flatMap((page) => page.items) ?? []

  const virtualizer = useVirtualizer({
    count: hasNextPage ? allItems.length + 1 : allItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5
  })

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const bottom = target.scrollHeight - target.scrollTop === target.clientHeight

    if (bottom && hasNextPage && !isFetching) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetching])

  return {
    parentRef,
    virtualizer,
    items: allItems,
    isLoading: isFetching,
    isRefetching,
    refetch,
    handleScroll
  }
} 