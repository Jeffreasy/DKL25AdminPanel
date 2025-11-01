import { useState, useEffect, useCallback } from 'react'
import { fetchAllAlbums, fetchAlbumById } from '../services/albumService'
import type { AlbumWithDetails } from '../types'

interface UseAlbumDataOptions {
  albumId?: string
  autoLoad?: boolean
}

interface UseAlbumDataReturn {
  album: AlbumWithDetails | null
  albums: AlbumWithDetails[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  loadAlbum: (id: string) => Promise<void>
}

export function useAlbumData(options: UseAlbumDataOptions = {}): UseAlbumDataReturn {
  const { albumId, autoLoad = true } = options
  
  const [album, setAlbum] = useState<AlbumWithDetails | null>(null)
  const [albums, setAlbums] = useState<AlbumWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAlbum = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchAlbumById(id)
      setAlbum(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kon album niet laden'
      setError(message)
      console.error('Error loading album:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadAlbums = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchAllAlbums()
      setAlbums(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kon albums niet laden'
      setError(message)
      console.error('Error loading albums:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    if (albumId) {
      await loadAlbum(albumId)
    } else {
      await loadAlbums()
    }
  }, [albumId, loadAlbum, loadAlbums])

  useEffect(() => {
    if (autoLoad) {
      if (albumId) {
        loadAlbum(albumId)
      } else {
        loadAlbums()
      }
    }
  }, [albumId, autoLoad, loadAlbum, loadAlbums])

  return {
    album,
    albums,
    loading,
    error,
    refresh,
    loadAlbum
  }
}