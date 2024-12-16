import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase/supabaseClient'
import { LoadingSkeleton } from '../../../components/auth/LoadingSkeleton'
import { ErrorText, SmallText } from '../../../components/typography'
import { AlbumCard } from './AlbumCard'
import type { AlbumWithDetails } from '../types'

export function AlbumGrid() {
  const [albums, setAlbums] = useState<AlbumWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const fetchAlbums = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('albums')
        .select(`
          *,
          cover_photo:cover_photo_id(*),
          photos:photos_albums(count)
        `)
        .order('order_number', { ascending: true })

      if (fetchError) throw fetchError

      const transformedData: AlbumWithDetails[] = (data || []).map(album => ({
        ...album,
        cover_photo: album.cover_photo ? {
          id: album.cover_photo.id,
          url: album.cover_photo.url
        } : null,
        photos_count: album.photos[0]?.count || 0
      }))

      setAlbums(transformedData)
    } catch (err) {
      console.error('Error fetching albums:', err)
      setError('Er ging iets mis bij het ophalen van de albums')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlbums()
  }, [fetchAlbums])

  const filteredAlbums = albums.filter(album => {
    if (!filter) return true
    const searchTerm = filter.toLowerCase()
    return (
      album.title.toLowerCase().includes(searchTerm) ||
      album.description?.toLowerCase().includes(searchTerm)
    )
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="search"
              placeholder="Zoeken..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 input-primary"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-2 rounded-l-md border ${
                view === 'grid'
                  ? 'bg-primary-50 text-primary-600 border-primary-200'
                  : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 rounded-r-md border-t border-r border-b -ml-px ${
                view === 'list'
                  ? 'bg-primary-50 text-primary-600 border-primary-200'
                  : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <SmallText>
          {filteredAlbums.length} album{filteredAlbums.length !== 1 ? 's' : ''} gevonden
        </SmallText>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <LoadingSkeleton key={i} className="aspect-[4/3]" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4">
          <ErrorText>{error}</ErrorText>
        </div>
      ) : (
        <div className={view === 'grid' 
          ? "p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          : "divide-y divide-gray-200"
        }>
          {filteredAlbums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              view={view}
              onUpdate={fetchAlbums}
            />
          ))}
        </div>
      )}

      {filteredAlbums.length === 0 && !loading && (
        <div className="text-center py-12">
          <SmallText>
            Geen albums gevonden{filter ? ' voor deze zoekopdracht' : ''}
          </SmallText>
        </div>
      )}
    </div>
  )
} 