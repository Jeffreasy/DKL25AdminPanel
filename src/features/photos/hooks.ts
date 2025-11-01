import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchPhotos,
  fetchPhotosCount,
  deletePhoto,
  updatePhotoVisibility,
  bulkDeletePhotos,
  bulkUpdatePhotoVisibility,
  bulkAddPhotosToAlbum,
  fetchAllAlbums
} from './services/photoService'
import type { Photo } from './types'

// ============================================================================
// QUERY KEYS
// ============================================================================

export const photoKeys = {
  all: ['photos'] as const,
  lists: () => [...photoKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...photoKeys.lists(), filters] as const,
  details: () => [...photoKeys.all, 'detail'] as const,
  detail: (id: string) => [...photoKeys.details(), id] as const,
  albums: ['albums'] as const,
}

// ============================================================================
// PHOTO QUERIES
// ============================================================================

/**
 * Hook to fetch photos list with pagination
 */
export function usePhotos(options: {
  limit?: number
  offset?: number
  search?: string
  albumId?: string
} = {}) {
  return useQuery({
    queryKey: photoKeys.list(options),
    queryFn: () => fetchPhotos(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch photos count
 */
export function usePhotosCount(options: {
  search?: string
  albumId?: string
} = {}) {
  return useQuery({
    queryKey: [...photoKeys.list(options), 'count'],
    queryFn: () => fetchPhotosCount(options),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to fetch albums
 */
export function useAlbums() {
  return useQuery({
    queryKey: photoKeys.albums,
    queryFn: fetchAllAlbums,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

// ============================================================================
// PHOTO MUTATIONS
// ============================================================================

/**
 * Hook to delete a single photo with optimistic updates
 */
export function useDeletePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePhoto,
    onMutate: async (photoId: string) => {
      await queryClient.cancelQueries({ queryKey: photoKeys.all })
      const previousPhotos = queryClient.getQueryData(photoKeys.lists())

      queryClient.setQueryData(photoKeys.lists(), (old: Photo[] | undefined) => {
        return old?.filter(photo => photo.id !== photoId) || []
      })

      return { previousPhotos }
    },
    onError: (err, photoId, context) => {
      if (context?.previousPhotos) {
        queryClient.setQueryData(photoKeys.lists(), context.previousPhotos)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: photoKeys.all })
    },
  })
}

/**
 * Hook to update photo visibility with optimistic updates
 */
export function useUpdatePhotoVisibility() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ photoId, visible }: { photoId: string; visible: boolean }) =>
      updatePhotoVisibility(photoId, visible),
    onMutate: async ({ photoId, visible }) => {
      await queryClient.cancelQueries({ queryKey: photoKeys.all })
      const previousPhotos = queryClient.getQueryData(photoKeys.lists())

      queryClient.setQueryData(photoKeys.lists(), (old: Photo[] | undefined) => {
        return old?.map(photo =>
          photo.id === photoId ? { ...photo, visible } : photo
        ) || []
      })

      return { previousPhotos }
    },
    onError: (err, variables, context) => {
      if (context?.previousPhotos) {
        queryClient.setQueryData(photoKeys.lists(), context.previousPhotos)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: photoKeys.all })
    },
  })
}

/**
 * Hook to bulk delete photos
 */
export function useBulkDeletePhotos() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bulkDeletePhotos,
    onMutate: async (photoIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: photoKeys.all })
      const previousPhotos = queryClient.getQueryData(photoKeys.lists())

      queryClient.setQueryData(photoKeys.lists(), (old: Photo[] | undefined) => {
        return old?.filter(photo => !photoIds.includes(photo.id)) || []
      })

      return { previousPhotos }
    },
    onError: (err, photoIds, context) => {
      if (context?.previousPhotos) {
        queryClient.setQueryData(photoKeys.lists(), context.previousPhotos)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: photoKeys.all })
    },
  })
}

/**
 * Hook to bulk update photo visibility
 */
export function useBulkUpdatePhotoVisibility() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ photoIds, visible }: { photoIds: string[]; visible: boolean }) =>
      bulkUpdatePhotoVisibility(photoIds, visible),
    onMutate: async ({ photoIds, visible }) => {
      await queryClient.cancelQueries({ queryKey: photoKeys.all })
      const previousPhotos = queryClient.getQueryData(photoKeys.lists())

      queryClient.setQueryData(photoKeys.lists(), (old: Photo[] | undefined) => {
        return old?.map(photo =>
          photoIds.includes(photo.id) ? { ...photo, visible } : photo
        ) || []
      })

      return { previousPhotos }
    },
    onError: (err, variables, context) => {
      if (context?.previousPhotos) {
        queryClient.setQueryData(photoKeys.lists(), context.previousPhotos)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: photoKeys.all })
    },
  })
}

/**
 * Hook to bulk add photos to an album
 */
export function useBulkAddPhotosToAlbum() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ photoIds, albumId }: { photoIds: string[]; albumId: string }) =>
      bulkAddPhotosToAlbum(photoIds, albumId),
    onMutate: async ({ photoIds, albumId }) => {
      await queryClient.cancelQueries({ queryKey: photoKeys.all })
      const previousPhotos = queryClient.getQueryData(photoKeys.lists())

      queryClient.setQueryData(photoKeys.lists(), (old: Photo[] | undefined) => {
        return old?.map(photo =>
          photoIds.includes(photo.id)
            ? {
                ...photo,
                album_photos: [...(photo.album_photos || []), { album_id: albumId }]
              }
            : photo
        ) || []
      })

      return { previousPhotos }
    },
    onError: (err, variables, context) => {
      if (context?.previousPhotos) {
        queryClient.setQueryData(photoKeys.lists(), context.previousPhotos)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: photoKeys.all })
    },
  })
}

// ============================================================================
// PHOTO ACTIONS HOOK
// ============================================================================

interface UsePhotoActionsProps {
  setError: (error: Error | null) => void
}

/**
 * Hook to handle common photo actions (delete, visibility toggle)
 */
export function usePhotoActions({ setError }: UsePhotoActionsProps) {
  const deleteMutation = useDeletePhoto()
  const visibilityMutation = useUpdatePhotoVisibility()

  const handleError = (message: string) => {
    setError(new Error(message))
  }

  const handleDelete = async (photo: { id: string } | null) => {
    if (!photo) return
    try {
      await deleteMutation.mutateAsync(photo.id)
    } catch (err) {
      console.error("Error deleting photo:", err)
      handleError('Er ging iets mis bij het verwijderen van de foto')
    }
  }

  const handleVisibilityToggle = async (photo: { id: string; visible: boolean } | null) => {
    if (!photo) return
    try {
      await visibilityMutation.mutateAsync({ photoId: photo.id, visible: !photo.visible })
    } catch (err) {
      console.error("Error toggling visibility:", err)
      handleError('Kon zichtbaarheid niet wijzigen')
    }
  }

  return {
    loading: deleteMutation.isPending || visibilityMutation.isPending,
    handleDelete,
    handleVisibilityToggle,
    handleError
  }
}

// ============================================================================
// PHOTO SELECTION HOOK
// ============================================================================

/**
 * Hook to manage photo selection state and actions
 */
export function usePhotoSelection() {
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set())

  const handleSelectionChange = useCallback((photoId: string, isSelected: boolean) => {
    setSelectedPhotoIds(prevSelectedIds => {
      const newSelectedIds = new Set(prevSelectedIds)
      if (isSelected) {
        newSelectedIds.add(photoId)
      } else {
        newSelectedIds.delete(photoId)
      }
      return newSelectedIds
    })
  }, [])

  const handleSelectAll = useCallback((photoIds: string[]) => {
    const currentPhotoIdSet = new Set(photoIds)
    const allSelected = photoIds.every(id => selectedPhotoIds.has(id))

    if (allSelected) {
      setSelectedPhotoIds(new Set())
    } else {
      setSelectedPhotoIds(currentPhotoIdSet)
    }
  }, [selectedPhotoIds])

  const clearSelection = useCallback(() => {
    setSelectedPhotoIds(new Set())
  }, [])

  return {
    selectedPhotoIds,
    handleSelectionChange,
    handleSelectAll,
    clearSelection,
    selectedCount: selectedPhotoIds.size
  }
}