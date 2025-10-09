import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * API hook - generic data fetching with caching, loading states, and error handling
 * Provides a consistent interface for API calls throughout the application
 */

export interface UseAPIOptions<T> {
  initialData?: T
  enabled?: boolean
  refetchOnMount?: boolean
  refetchOnWindowFocus?: boolean
  cacheTime?: number
  staleTime?: number
  retry?: number
  retryDelay?: number
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export interface UseAPIReturn<T> {
  data: T | undefined
  error: Error | null
  isLoading: boolean
  isFetching: boolean
  isSuccess: boolean
  isError: boolean
  refetch: () => Promise<void>
  mutate: (newData: T | ((prev: T | undefined) => T)) => void
}

interface CacheEntry {
  data: unknown
  timestamp: number
}

// Global cache
const cache = new Map<string, CacheEntry>()

export function useAPI<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: UseAPIOptions<T> = {}
): UseAPIReturn<T> {
  const {
    initialData,
    enabled = true,
    refetchOnMount = true,
    refetchOnWindowFocus = false,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 0,
    retry = 0,
    retryDelay = 1000,
    onSuccess,
    onError
  } = options

  const [data, setData] = useState<T | undefined>(initialData)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  
  const mountedRef = useRef(true)
  const retryCountRef = useRef(0)
  const fetcherRef = useRef(fetcher)

  // Update fetcher ref when it changes
  useEffect(() => {
    fetcherRef.current = fetcher
  }, [fetcher])

  // Derived states
  const isSuccess = data !== undefined && error === null
  const isError = error !== null

  // Get cached data
  const getCachedData = useCallback((): T | null => {
    if (!key) return null
    
    const cached = cache.get(key)
    if (!cached) return null

    const now = Date.now()
    const age = now - cached.timestamp

    // Check if cache is still valid
    if (age > cacheTime) {
      cache.delete(key)
      return null
    }

    // Check if data is stale
    if (age < staleTime) {
      return cached.data as T
    }

    return null
  }, [key, cacheTime, staleTime])

  // Set cached data
  const setCachedData = useCallback((newData: T) => {
    if (!key) return

    cache.set(key, {
      data: newData,
      timestamp: Date.now()
    })
  }, [key])

  // Fetch data
  const fetchData = useCallback(async (isRefetch = false) => {
    if (!key || !enabled) return

    // Check cache first (only on initial fetch, not refetch)
    if (!isRefetch) {
      const cachedData = getCachedData()
      if (cachedData !== null) {
        setData(cachedData)
        setError(null)
        return
      }
    }

    setIsFetching(true)
    if (!isRefetch) {
      setIsLoading(true)
    }
    setError(null)

    try {
      const result = await fetcherRef.current()
      
      if (!mountedRef.current) return

      setData(result)
      setCachedData(result)
      retryCountRef.current = 0
      onSuccess?.(result)
    } catch (err) {
      if (!mountedRef.current) return

      const error = err instanceof Error ? err : new Error(String(err))
      
      // Retry logic
      if (retryCountRef.current < retry) {
        retryCountRef.current++
        setTimeout(() => {
          fetchData(isRefetch)
        }, retryDelay * retryCountRef.current)
        return
      }

      setError(error)
      onError?.(error)
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
        setIsFetching(false)
      }
    }
  }, [key, enabled, getCachedData, setCachedData, retry, retryDelay, onSuccess, onError])

  // Refetch function
  const refetch = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  // Mutate function (optimistic updates)
  const mutate = useCallback((newData: T | ((prev: T | undefined) => T)) => {
    setData(prev => {
      const updated = newData instanceof Function ? newData(prev) : newData
      if (key) {
        setCachedData(updated)
      }
      return updated
    })
  }, [key, setCachedData])

  // Initial fetch
  useEffect(() => {
    if (enabled && refetchOnMount) {
      fetchData()
    }
  }, [enabled, refetchOnMount, fetchData])

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return

    const handleFocus = () => {
      if (enabled) {
        fetchData(true)
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnWindowFocus, enabled, fetchData])

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  return {
    data,
    error,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    refetch,
    mutate
  }
}

/**
 * Clear cache for a specific key or all keys
 */
export function clearAPICache(key?: string) {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}

/**
 * Example usage:
 * 
 * ```typescript
 * // 1. Basic usage
 * function UserProfile({ userId }: { userId: string }) {
 *   const { data: user, isLoading, error, refetch } = useAPI(
 *     `user-${userId}`,
 *     () => fetchUser(userId)
 *   )
 * 
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *   if (!user) return null
 * 
 *   return (
 *     <div>
 *       <h1>{user.name}</h1>
 *       <button onClick={refetch}>Refresh</button>
 *     </div>
 *   )
 * }
 * 
 * // 2. With options
 * function ProductList() {
 *   const { data: products, isLoading } = useAPI(
 *     'products',
 *     () => fetchProducts(),
 *     {
 *       cacheTime: 10 * 60 * 1000, // 10 minutes
 *       staleTime: 5 * 60 * 1000,  // 5 minutes
 *       refetchOnWindowFocus: true,
 *       retry: 3,
 *       onSuccess: (data) => console.log('Fetched', data.length, 'products'),
 *       onError: (error) => console.error('Failed to fetch products:', error)
 *     }
 *   )
 * 
 *   return (
 *     <div>
 *       {isLoading ? (
 *         <div>Loading...</div>
 *       ) : (
 *         products?.map(product => (
 *           <div key={product.id}>{product.name}</div>
 *         ))
 *       )}
 *     </div>
 *   )
 * }
 * 
 * // 3. Conditional fetching
 * function ConditionalData({ shouldFetch }: { shouldFetch: boolean }) {
 *   const { data } = useAPI(
 *     shouldFetch ? 'data-key' : null, // null key disables fetching
 *     () => fetchData(),
 *     { enabled: shouldFetch }
 *   )
 * 
 *   return <div>{data ? JSON.stringify(data) : 'Not fetched'}</div>
 * }
 * 
 * // 4. Optimistic updates
 * function TodoList() {
 *   const { data: todos, mutate } = useAPI('todos', () => fetchTodos())
 * 
 *   const addTodo = async (text: string) => {
 *     const newTodo = { id: Date.now().toString(), text, completed: false }
 *     
 *     // Optimistic update
 *     mutate(prev => [...(prev || []), newTodo])
 * 
 *     try {
 *       await createTodo(newTodo)
 *     } catch (error) {
 *       // Revert on error
 *       mutate(prev => prev?.filter(t => t.id !== newTodo.id))
 *     }
 *   }
 * 
 *   return (
 *     <div>
 *       {todos?.map(todo => (
 *         <div key={todo.id}>{todo.text}</div>
 *       ))}
 *     </div>
 *   )
 * }
 * 
 * // 5. Clear cache
 * function CacheManager() {
 *   return (
 *     <div>
 *       <button onClick={() => clearAPICache('users')}>
 *         Clear Users Cache
 *       </button>
 *       <button onClick={() => clearAPICache()}>
 *         Clear All Cache
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */