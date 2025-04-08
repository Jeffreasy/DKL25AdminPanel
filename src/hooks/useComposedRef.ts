import { useCallback } from 'react'
import type { RefCallback } from 'react'

export function useComposedRef<T>(
  localRef: React.MutableRefObject<T | null>,
  forwardedRef: RefCallback<T> | null
): RefCallback<T> {
  return useCallback(
    (element: T | null) => {
      if (localRef) localRef.current = element
      if (forwardedRef) forwardedRef(element)
    },
    [localRef, forwardedRef]
  )
} 