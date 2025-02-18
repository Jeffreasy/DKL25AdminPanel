import { useState, useEffect } from 'react'
import { H2 } from '../../components/typography'
import { PhotoGrid } from './components/PhotoGrid'
import { PhotoUploadModal } from './components/PhotoUploadModal'
import { BulkUploadButton } from './components/BulkUploadButton'
import { fetchPhotos, fetchAllAlbums } from '../../features/services/photoService'
import type { Photo, PhotoCount } from './types'
import type { AlbumWithDetails } from '../albums/types'
import { Link } from 'react-router-dom'
import { 
  ViewColumnsIcon, 
  ListBulletIcon,
  FolderIcon,
  PhotoIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface PhotosByYear {
  [key: string]: Photo[]
}

interface CollapsibleSectionProps {
  title: string
  count: number
  children: React.ReactNode
  defaultOpen?: boolean
  onToggle?: () => void
}

function CollapsibleSection({ title, count, children, defaultOpen = true, onToggle }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          onToggle?.()
        }}
        className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-gray-500" />
          )}
          <h3 className="font-medium text-gray-900">{title}</h3>
          <span className="text-sm text-gray-500">({count})</span>
        </div>
      </button>
      {isOpen && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  )
}

export function PhotosOverview() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [albums, setAlbums] = useState<AlbumWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'all' | 'unorganized'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [photosData, albumsData] = await Promise.all([
        fetchPhotos(),
        fetchAllAlbums()
      ])
      setPhotos(photosData)
      setAlbums(albumsData)
    } catch (err) {
      console.error('Error loading data:', err)
      setError(new Error('Er ging iets mis bij het ophalen van de gegevens'))
    } finally {
      setLoading(false)
    }
  }

  // Filter photos that are not in any album
  const unorganizedPhotos = photos.filter(photo => {
    // Haal eerst alle foto IDs uit de album_photos relaties
    const albumPhotoIds = albums.flatMap(album => 
      (album.photos_count as PhotoCount[]).map(pc => pc.photo_id)
    )
    // Check of deze foto in een album zit
    return !albumPhotoIds.includes(photo.id)
  })

  // Groepeer foto's per jaar
  const groupPhotosByYear = (photoList: Photo[]): PhotosByYear => {
    return photoList.reduce((acc: PhotosByYear, photo) => {
      const year = String(photo.year || new Date(photo.created_at).getFullYear())
      if (!acc[year]) {
        acc[year] = []
      }
      acc[year].push(photo)
      return acc
    }, {})
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const filterPhotos = (photoList: Photo[]) => {
    if (!searchQuery) return photoList

    const query = searchQuery.toLowerCase()
    return photoList.filter(photo => 
      photo.title?.toLowerCase().includes(query) ||
      photo.description?.toLowerCase().includes(query) ||
      photo.alt?.toLowerCase().includes(query) ||
      photo.year?.toString().includes(query)
    )
  }

  const renderLibraryContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square animate-pulse bg-gray-200 rounded-lg" />
          ))}
        </div>
      )
    }

    if (error) {
      return <div className="text-red-600 text-center py-8">{error.message}</div>
    }

    const photosByYear = groupPhotosByYear(
      filterPhotos(activeTab === 'all' ? photos : unorganizedPhotos)
    )
    const years = Object.keys(photosByYear).sort((a, b) => Number(b) - Number(a))

    return (
      <div className="space-y-4">
        {/* Recent Albums Sectie */}
        {activeTab === 'all' && (
          <CollapsibleSection 
            title="Recent gebruikte albums" 
            count={albums.length}
            defaultOpen={expandedSections.has('albums')}
            onToggle={() => toggleSection('albums')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {albums.slice(0, 4).map(album => (
                <Link
                  key={album.id}
                  to={`/albums/${album.id}`}
                  className="group relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-indigo-500"
                >
                  {album.cover_photo ? (
                    <img
                      src={album.cover_photo.thumbnail_url || album.cover_photo.url}
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <div>
                      <h4 className="text-white font-medium">{album.title}</h4>
                      <p className="text-sm text-gray-300">
                        {album.photos_count[0]?.count || 0} foto's
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              <Link
                to="/albums"
                className="flex items-center justify-center aspect-[4/3] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-gray-100 transition-colors group"
              >
                <div className="text-center">
                  <FolderIcon className="w-8 h-8 mx-auto text-gray-400 group-hover:text-indigo-500" />
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Alle albums bekijken
                  </span>
                </div>
              </Link>
            </div>
          </CollapsibleSection>
        )}

        {/* Foto's per jaar */}
        {years.map(year => (
          <CollapsibleSection
            key={year}
            title={`Foto's ${year}`}
            count={photosByYear[year].length}
            defaultOpen={expandedSections.has(`year-${year}`)}
            onToggle={() => toggleSection(`year-${year}`)}
          >
            <PhotoGrid
              photos={photosByYear[year]}
              loading={false}
              error={null}
              setError={setError}
              onUpdate={loadData}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            />
          </CollapsibleSection>
        ))}

        {years.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Geen foto's gevonden{searchQuery ? ' voor deze zoekopdracht' : ''}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header met acties */}
      <div className="bg-white shadow-sm rounded-lg p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <H2>Foto bibliotheek</H2>
            <p className="text-sm text-gray-500 mt-1">
              Beheer hier alle foto's en albums
            </p>
          </div>
          
          {/* Zoekbalk */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Zoek in foto's..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* View toggle */}
          <div className="flex rounded-lg shadow-sm">
            <button
              onClick={() => setView('grid')}
              className={`p-2 ${
                view === 'grid'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:text-gray-900 border border-gray-300'
              } rounded-l-lg`}
              title="Grid weergave"
            >
              <ViewColumnsIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 ${
                view === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:text-gray-900 border border-l-0 border-gray-300'
              } rounded-r-lg`}
              title="Lijst weergave"
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Upload buttons */}
          <div className="flex gap-2">
            <BulkUploadButton
              onUploadComplete={loadData}
              className="bg-white shadow-sm"
            />
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              Foto toevoegen
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium
                ${activeTab === 'all' 
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <PhotoIcon className="w-5 h-5" />
              Alle foto's ({photos.length})
            </button>
            <button
              onClick={() => setActiveTab('unorganized')}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium
                ${activeTab === 'unorganized'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <FolderIcon className="w-5 h-5" />
              Niet in album ({unorganizedPhotos.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Library Content */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        {renderLibraryContent()}
      </div>

      <PhotoUploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onComplete={() => {
          setShowUploadModal(false)
          loadData()
        }}
      />
    </div>
  )
} 