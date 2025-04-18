import { useState, useEffect, useMemo, ChangeEvent } from 'react'
import { H2 } from '../../components/typography'
import { PhotoGrid } from './components/PhotoGrid'
import { PhotoUploadModal } from './components/PhotoUploadModal'
import { BulkUploadButton } from './components/BulkUploadButton'
import { CloudinaryImportModal } from './components/CloudinaryImportModal'
import { fetchPhotos, fetchAllAlbums } from './services/photoService'
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
  MagnifyingGlassIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline'
import { cc } from '../../styles/shared'

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
    <div className={cc.card({ className: 'overflow-hidden p-0' })}>
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          onToggle?.()
        }}
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors border-b border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDownIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
          <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">({count})</span>
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
  console.log("--- PhotosOverview component mounted! ---");

  const [photos, setPhotos] = useState<Photo[]>([])
  const [albums, setAlbums] = useState<AlbumWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showCloudinaryImportModal, setShowCloudinaryImportModal] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'all' | 'unorganized'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['recent-albums']))

  const currentYear = String(new Date().getFullYear())
  const [selectedYear, setSelectedYear] = useState<string>(currentYear)

  const yearOptions = useMemo(() => {
    const yearsFromPhotos = photos.map(p => p.year).filter(Boolean).map(String);
    const uniqueYearsFromPhotos = [...new Set(yearsFromPhotos)];
    const uniqueYears = [...new Set([currentYear, ...uniqueYearsFromPhotos])];
    return uniqueYears.sort((a, b) => parseInt(b) - parseInt(a));
  }, [photos, currentYear]);

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null);
      const [photosData, albumsData] = await Promise.all([
        fetchPhotos(),
        fetchAllAlbums()
      ])
      console.log("Fetched Photos Sample:", photosData?.[0]);
      console.log("Fetched Albums Sample:", albumsData?.[0]);
      setPhotos(photosData || [])
      setAlbums(albumsData || [])
    } catch (err) {
      console.error('Error loading data:', err)
      setError(new Error('Er ging iets mis bij het ophalen van de gegevens'))
    } finally {
      setLoading(false)
    }
  }

  const unorganizedPhotos = useMemo(() => {
    return photos.filter(photo => 
      !photo.album_photos || photo.album_photos.length === 0
    );
  }, [photos]);

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
      photo.alt_text?.toLowerCase().includes(query) ||
      photo.year?.toString().includes(query)
    )
  }

  const renderLibraryContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      )
    }

    if (error) {
      return <div className="text-red-600 dark:text-red-400 text-center py-8">{error.message}</div>
    }

    const filteredAlbums = albums.filter(album => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return album.title?.toLowerCase().includes(query) || album.description?.toLowerCase().includes(query);
    });

    const filteredUnorganizedPhotos = filterPhotos(unorganizedPhotos);

    return (
      <div className="space-y-4">
        {activeTab === 'all' && (
          <CollapsibleSection 
            title="Recent gebruikte albums" 
            count={albums.length}
            defaultOpen={expandedSections.has('recent-albums')}
            onToggle={() => toggleSection('recent-albums')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {albums.slice(0, 4).map(album => (
                <Link
                  key={album.id}
                  to={`/albums?openAlbum=${album.id}`}
                  className="group relative aspect-[4/3] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden hover:ring-2 hover:ring-indigo-500"
                >
                  {album.cover_photo ? (
                    <img
                      src={album.cover_photo.thumbnail_url || album.cover_photo.url}
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <div>
                      <h4 className="text-white font-medium">{album.title}</h4>
                      <p className="text-sm text-gray-300">
                        {album.photos_count?.[0]?.count || 0} foto's
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              <Link
                to="/albums"
                className="flex items-center justify-center aspect-[4/3] bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
              >
                <div className="text-center">
                  <FolderIcon className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
                  <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
                    Alle albums bekijken
                  </span>
                </div>
              </Link>
            </div>
          </CollapsibleSection>
        )}

        {activeTab === 'all' ? (
          <> 
            {filteredAlbums.map(album => {
              const albumPhotos = photos.filter(photo => 
                photo.album_photos?.some(ap => ap.album_id === album.id)
              );
              const photoCount = album.photos_count?.[0]?.count ?? albumPhotos.length;

              return (
                <CollapsibleSection
                  key={album.id}
                  title={album.title}
                  count={photoCount}
                  defaultOpen={expandedSections.has(`album-${album.id}`)}
                  onToggle={() => toggleSection(`album-${album.id}`)}
                >
                  <PhotoGrid
                    photos={albumPhotos} 
                    loading={false}
                    error={null} 
                    setError={setError}
                    onUpdate={loadData}
                    albums={albums}
                  />
                </CollapsibleSection>
              );
            })}
            {filteredAlbums.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Geen albums gevonden{searchQuery ? ' voor deze zoekopdracht' : ''}
              </div>
            )}
          </>
        ) : (
          <div className={cc.card({ className: 'p-4' })}>
            <PhotoGrid
              photos={filteredUnorganizedPhotos}
              loading={false}
              error={null}
              setError={setError}
              onUpdate={loadData}
              albums={albums}
            />
             {filteredUnorganizedPhotos.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Geen niet-georganiseerde foto's gevonden{searchQuery ? ' voor deze zoekopdracht' : ''}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className={cc.card({ className: 'p-4' })}>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex-shrink min-w-0">
            <H2>Foto bibliotheek</H2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Beheer hier alle foto's en albums
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4 w-full lg:w-auto">
            <div className="relative order-3 lg:order-1 w-full sm:w-auto lg:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="search"
                placeholder="Zoek in albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cc.form.input({ className: 'pl-10 w-full' })}
              />
            </div>

            <div className="hidden sm:flex rounded-md border border-gray-300 dark:border-gray-600 shadow-sm order-2">
              <button
                onClick={() => setView('grid')}
                className={`p-2 ${ view === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600' } rounded-l-md transition-colors`}
                title="Grid weergave"
              >
                <ViewColumnsIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 ${ view === 'list' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600' } rounded-r-md border-l border-gray-300 dark:border-gray-600 transition-colors`}
                title="Lijst weergave"
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 order-1 lg:order-3 w-full sm:w-auto">
              <div className="flex-shrink-0">
                <label htmlFor="bulk-year-select" className="sr-only">
                  Kies jaar voor upload/import
                </label>
                <select
                  id="bulk-year-select"
                  name="bulk-year"
                  value={selectedYear}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedYear(e.target.value)}
                  className={cc.form.select({ className: 'h-full' })}
                  title="Jaar voor upload/import"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 flex-grow sm:flex-grow-0">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className={cc.button.base({ color: 'primary', className: 'flex-1 sm:flex-initial flex items-center gap-1.5 justify-center' })}
                >
                  <PhotoIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Foto</span>
                  <span> Toevoegen</span>
                </button>
                <button
                  onClick={() => setShowCloudinaryImportModal(true)}
                  className={cc.button.base({ 
                    color: 'secondary', 
                    className: 'flex-1 sm:flex-initial flex items-center gap-1.5 justify-center p-2 sm:px-3 sm:py-1.5'
                  })}
                  title="Importeer vanuit Cloudinary"
                >
                  <CloudArrowDownIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Importeer</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium whitespace-nowrap
                ${activeTab === 'all' 
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'}
              `}
            >
              <PhotoIcon className="w-5 h-5" />
              Alle foto's ({photos.length})
            </button>
            <button
              onClick={() => setActiveTab('unorganized')}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium whitespace-nowrap
                ${activeTab === 'unorganized'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'}
              `}
            >
              <FolderIcon className="w-5 h-5" />
              Niet in album ({unorganizedPhotos.length})
            </button>
          </nav>
        </div>
      </div>

      <div className={cc.card({ className: 'p-6' })}>
        {renderLibraryContent()}
      </div>

      <PhotoUploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onComplete={() => {
          setShowUploadModal(false)
          loadData()
        }}
        albums={albums}
      />

      <CloudinaryImportModal
        open={showCloudinaryImportModal}
        onClose={() => setShowCloudinaryImportModal(false)}
        onComplete={() => {
          setShowCloudinaryImportModal(false)
          loadData()
        }}
        targetYear={selectedYear}
      />
    </div>
  )
} 