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
} from '../services/photoService'
import type { Photo } from '../types'

// Query keys
export const photoKeys = {
  all: ['photos'] as const,
  lists: () => [...photoKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...photoKeys.lists(), filters] as const,
  details: () => [...photoKeys.all, 'detail'] as const,
  detail: (id: string) => [...photoKeys.details(), id] as const,
  albums: ['albums'] as const,
}

// Photos list hook with pagination
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

// Photos count hook
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

// Albums hook
export function useAlbums() {
  return useQuery({
    queryKey: photoKeys.albums,
    queryFn: fetchAllAlbums,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Delete photo mutation with optimistic updates
export function useDeletePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePhoto,
    onMutate: async (photoId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: photoKeys.all })

      // Snapshot previous value
      const previousPhotos = queryClient.getQueryData(photoKeys.lists())

      // Optimistically remove photo
      queryClient.setQueryData(photoKeys.lists(), (old: Photo[] | undefined) => {
        return old?.filter(photo => photo.id !== photoId) || []
      })

      return { previousPhotos }
    },
    onError: (err, photoId, context) => {
      // Revert on error
      if (context?.previousPhotos) {
        queryClient.setQueryData(photoKeys.lists(), context.previousPhotos)
      }
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: photoKeys.all })
    },
  })
}

// Update visibility mutation with optimistic updates
export function useUpdatePhotoVisibility() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ photoId, visible }: { photoId: string; visible: boolean }) =>
      updatePhotoVisibility(photoId, visible),
    onMutate: async ({ photoId, visible }) => {
      await queryClient.cancelQueries({ queryKey: photoKeys.all })

      const previousPhotos = queryClient.getQueryData(photoKeys.lists())

      // Optimistically update visibility
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

// Bulk delete mutation
export function useBulkDeletePhotos() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bulkDeletePhotos,
    onMutate: async (photoIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: photoKeys.all })

      const previousPhotos = queryClient.getQueryData(photoKeys.lists())

      // Optimistically remove photos
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

// Bulk update visibility mutation
export function useBulkUpdatePhotoVisibility() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ photoIds, visible }: { photoIds: string[]; visible: boolean }) =>
      bulkUpdatePhotoVisibility(photoIds, visible),
    onMutate: async ({ photoIds, visible }) => {
      await queryClient.cancelQueries({ queryKey: photoKeys.all })

      const previousPhotos = queryClient.getQueryData(photoKeys.lists())

      // Optimistically update visibility
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

// Bulk add to album mutation
export function useBulkAddPhotosToAlbum() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ photoIds, albumId }: { photoIds: string[]; albumId: string }) =>
      bulkAddPhotosToAlbum(photoIds, albumId),
    onMutate: async ({ photoIds, albumId }) => {
      await queryClient.cancelQueries({ queryKey: photoKeys.all })

      const previousPhotos = queryClient.getQueryData(photoKeys.lists())

      // Optimistically add album relations
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