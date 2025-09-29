import { useState, useEffect, useMemo, useCallback } from 'react'
import { H2 } from '../../components/typography'
import { PhotoGrid } from './components/PhotoGrid'
import { PhotoUploadModal } from './components/PhotoUploadModal'
import { CloudinaryImportModal } from './components/CloudinaryImportModal'
import { fetchPhotos, fetchAllAlbums } from './services/photoService'
import type { Photo } from './types'
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
import { PhotoList } from './components/PhotoList'

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
        className="w-full px-2 py-2 sm:px-4 sm:py-3 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors border-b border-gray-200 dark:border-gray-700"
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
        <div className="p-2 sm:p-4">
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
  const [view, setView] = useState<'grid' | 'list'>('list')
  const [activeTab, setActiveTab] = useState<'all' | 'unorganized'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['recent-albums']))
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set())

  const currentYear = String(new Date().getFullYear())

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

  const filterPhotos = useCallback((photoList: Photo[]) => {
    if (!searchQuery) return photoList

    const query = searchQuery.toLowerCase()
    return photoList.filter(photo => 
      photo.title?.toLowerCase().includes(query) ||
      photo.description?.toLowerCase().includes(query) ||
      photo.alt_text?.toLowerCase().includes(query) ||
      photo.year?.toString().includes(query)
    )
  }, [searchQuery])

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
    const currentPhotoIdSet = new Set(photoIds);
    const allSelected = photoIds.every(id => selectedPhotoIds.has(id));

    if (allSelected) {
        setSelectedPhotoIds(new Set());
    } else {
        setSelectedPhotoIds(currentPhotoIdSet);
    }
  }, [selectedPhotoIds])

  const displayedPhotos = useMemo(() => {
    return filterPhotos(activeTab === 'unorganized' ? unorganizedPhotos : photos);
  }, [activeTab, photos, unorganizedPhotos, filterPhotos]);

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

    const photosToShowInGridOrList = displayedPhotos;

    const idsForSelectAll = photosToShowInGridOrList.map(p => p.id);

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
                    selectedPhotoIds={selectedPhotoIds}
                    onSelectionChange={handleSelectionChange}
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
              selectedPhotoIds={selectedPhotoIds}
              onSelectionChange={handleSelectionChange}
            />
             {filteredUnorganizedPhotos.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Geen niet-georganiseerde foto's gevonden{searchQuery ? ' voor deze zoekopdracht' : ''}
              </div>
            )}
          </div>
        )}

        {activeTab === 'unorganized' && (
          <CollapsibleSection 
            title="Niet-georganiseerde foto's" 
            count={filteredUnorganizedPhotos.length} 
            defaultOpen={expandedSections.has('unorganized')} 
            onToggle={() => toggleSection('unorganized')}
          >
            <PhotoGrid
              photos={filteredUnorganizedPhotos}
              loading={loading}
              error={error}
              setError={setError}
              onUpdate={loadData}
              albums={albums}
              selectedPhotoIds={selectedPhotoIds}
              onSelectionChange={handleSelectionChange}
            />
          </CollapsibleSection>
        )}

        {view === 'grid' ? (
          <PhotoGrid
            photos={photosToShowInGridOrList} 
            loading={loading} 
            error={error} 
            setError={setError} 
            onUpdate={loadData} 
            albums={albums}
            selectedPhotoIds={selectedPhotoIds}
            onSelectionChange={handleSelectionChange}
          />
        ) : (
          <PhotoList 
            photos={photosToShowInGridOrList}
            loading={loading}
            error={error}
            onUpdate={loadData}
            setError={setError} 
            albums={albums}
            selectedPhotoIds={selectedPhotoIds}
            onSelectionChange={handleSelectionChange}
            onSelectAll={() => handleSelectAll(idsForSelectAll)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <H2>Foto's</H2>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCloudinaryImportModal(true)}
            className={`${cc.button.base({ color: 'secondary' })} hidden sm:inline-flex`}
            title="Importeer foto's vanuit Cloudinary"
          >
            <CloudArrowDownIcon className="w-5 h-5 mr-2" />
            Importeer (Cloudinary)
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className={cc.button.base({ color: 'primary' })}
            title="Upload nieuwe foto's vanaf uw apparaat"
          >
            <PhotoIcon className="w-5 h-5 mr-2" />
            Upload Foto's
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex border-b border-gray-200 dark:border-gray-700 w-full md:w-auto overflow-x-auto">
          <button 
            onClick={() => setActiveTab('all')} 
            className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'all' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            Alle Foto's
          </button>
          <button 
            onClick={() => setActiveTab('unorganized')} 
            className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'unorganized' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            Niet Georganiseerd ({unorganizedPhotos.length})
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <input
              type="search"
              placeholder="Zoek foto's & albums..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={cc.form.input({ className: 'pl-10' })}
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          
          <div className="flex items-center rounded-md bg-gray-100 dark:bg-gray-700 p-0.5">
            <button 
              onClick={() => setView('grid')} 
              className={`p-1.5 rounded ${view === 'grid' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              title="Grid weergave"
            >
              <ViewColumnsIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setView('list')} 
              className={`p-1.5 rounded ${view === 'list' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              title="Lijst weergave"
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {selectedPhotoIds.size > 0 && (
        <div className="sticky top-0 z-10 bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-md px-4 py-2 flex items-center justify-between shadow-sm">
          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            {selectedPhotoIds.size} foto{selectedPhotoIds.size !== 1 ? '' : 's'} geselecteerd
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => alert('TODO: Bulk Actie')} className={cc.button.base({ color: 'secondary', size: 'sm' })}>Bulk Actie</button>
            <button onClick={() => setSelectedPhotoIds(new Set())} className={cc.button.base({ color: 'secondary', size: 'sm' })}>Deselecteer</button>
          </div>
        </div>
      )}

      {renderLibraryContent()}

      {showUploadModal && (
        <PhotoUploadModal
          open={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onComplete={() => {
            setShowUploadModal(false)
            loadData()
          }}
          albums={albums} 
        />
      )}

      {showCloudinaryImportModal && (
        <CloudinaryImportModal
          open={showCloudinaryImportModal}
          onClose={() => setShowCloudinaryImportModal(false)}
          onComplete={() => {
            setShowCloudinaryImportModal(false)
            loadData()
          }}
          targetYear={currentYear}
        />
      )}
    </div>
  )
} 