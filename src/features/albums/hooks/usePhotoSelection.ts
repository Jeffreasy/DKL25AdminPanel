import { useState, useCallback, useEffect } from 'react'
import type { Photo } from '../../photos/types'

interface UsePhotoSelectionOptions {
  initialSelection?: string[]
  multiSelect?: boolean
}

interface UsePhotoSelectionReturn {
  selectedPhotoIds: string[]
  isSelected: (photoId: string) => boolean
  toggleSelection: (photoId: string) => void
  selectAll: (photoIds: string[]) => void
  clearSelection: () => void
  setSelection: (photoIds: string[]) => void
}

export function usePhotoSelection(options: UsePhotoSelectionOptions = {}): UsePhotoSelectionReturn {
  const { initialSelection = [], multiSelect = true } = options
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>(initialSelection)

  useEffect(() => {
    setSelectedPhotoIds(initialSelection)
  }, [initialSelection])

  const isSelected = useCallback(
    (photoId: string) => selectedPhotoIds.includes(photoId),
    [selectedPhotoIds]
  )

  const toggleSelection = useCallback(
    (photoId: string) => {
      setSelectedPhotoIds(prev => {
        if (prev.includes(photoId)) {
          return prev.filter(id => id !== photoId)
        }
        if (multiSelect) {
          return [...prev, photoId]
        }
        return [photoId]
      })
    },
    [multiSelect]
  )

  const selectAll = useCallback((photoIds: string[]) => {
    setSelectedPhotoIds(photoIds)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedPhotoIds([])
  }, [])

  const setSelection = useCallback((photoIds: string[]) => {
    setSelectedPhotoIds(photoIds)
  }, [])

  return {
    selectedPhotoIds,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    setSelection
  }
}

interface UseAvailablePhotosOptions {
  excludePhotoIds?: string[]
}

interface UseAvailablePhotosReturn {
  photos: Photo[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useAvailablePhotos(options: UseAvailablePhotosOptions = {}): UseAvailablePhotosReturn {
  const { excludePhotoIds = [] } = options
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPhotos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Geen actieve gebruikerssessie gevonden')
      }

      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://dklemailservice.onrender.com'
      const response = await fetch(`${API_BASE}/api/photos/admin`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Geen toegang tot foto\'s')
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const availablePhotos = (data || []).filter(
        (photo: Photo) => !excludePhotoIds.includes(photo.id)
      )
      
      setPhotos(availablePhotos)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kon foto\'s niet laden'
      setError(message)
      console.error('Error loading photos:', err)
    } finally {
      setLoading(false)
    }
  }, [excludePhotoIds])

  useEffect(() => {
    loadPhotos()
  }, [loadPhotos])

  return {
    photos,
    loading,
    error,
    refresh: loadPhotos
  }
}