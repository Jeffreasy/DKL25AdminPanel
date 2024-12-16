import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase/supabaseClient'
import { LoadingSkeleton } from '../../../components/auth/LoadingSkeleton'
import { ErrorText, SmallText } from '../../../components/typography'
import { PhotoCard } from '.'
import type { PhotoWithDetails } from '../types'

export function PhotoGrid() {
  const [photos, setPhotos] = useState<PhotoWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchPhotos()
  }, [yearFilter])

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('order_number', { ascending: true })
        .eq('visible', true)

      if (error) throw error
      setPhotos(data || [])
    } catch (err) {
      console.error('Error fetching photos:', err)
      setError('Er ging iets mis bij het ophalen van de foto\'s')
    } finally {
      setLoading(false)
    }
  }

  const years = [...new Set(photos.map(p => p.year))].sort((a, b) => b - a)

  const filteredPhotos = photos.filter(photo => {
    if (!filter) return true
    const searchTerm = filter.toLowerCase()
    return (
      photo.title?.toLowerCase().includes(searchTerm) ||
      photo.description?.toLowerCase().includes(searchTerm) ||
      photo.year?.toString().includes(searchTerm)
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

          <div className="flex gap-2">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="input-primary"
            >
              <option key="all" value="all">Alle jaren</option>
              {years.map(year => (
                <option key={`year-${year}`} value={year}>{year}</option>
              ))}
            </select>

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
        </div>

        <SmallText>
          {filteredPhotos.length} foto{filteredPhotos.length !== 1 ? 's' : ''} gevonden
        </SmallText>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <LoadingSkeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4">
          <ErrorText>{error}</ErrorText>
        </div>
      ) : (
        <div className={view === 'grid' 
          ? "p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          : "divide-y divide-gray-200"
        }>
          {filteredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              view={view}
              onUpdate={fetchPhotos}
            />
          ))}
        </div>
      )}

      {filteredPhotos.length === 0 && !loading && (
        <div className="text-center py-12">
          <SmallText>
            Geen foto's gevonden{filter ? ' voor deze zoekopdracht' : ''}
          </SmallText>
        </div>
      )}
    </div>
  )
} 