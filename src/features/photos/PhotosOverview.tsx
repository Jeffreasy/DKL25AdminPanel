import { useState, useEffect, useMemo, useCallback } from 'react'
import { H2 } from '../../components/typography'
import { PhotoGrid } from './components/PhotoGrid'
import { PhotoUploadModal } from './components/PhotoUploadModal'
import { CloudinaryImportModal } from './components/CloudinaryImportModal'
import { PhotoDetailsModal } from './components/PhotoDetailsModal'
import { PhotoErrorBoundary } from './components/PhotoErrorBoundary'
import { PhotoActionsBar } from './components/PhotoActionsBar'
import { fetchPhotos, fetchAllAlbums } from './services/photoService'
import type { Photo } from './types'
import type { AlbumWithDetails } from '../albums/types'
import { Link } from 'react-router-dom'
import {
  ViewColumnsIcon,
  ListBulletIcon,
  FolderIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline'
import { cc } from '../../styles/shared'
import { PhotoList } from './components/PhotoList'


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
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set())
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const PAGE_SIZE = 24

  const currentYear = String(new Date().getFullYear())

  const loadData = useCallback(async (resetPagination = true) => {
    try {
      setLoading(true)
      setError(null);

      if (resetPagination) {
        setCurrentPage(0)
        setHasMore(true)
      }

      const [photosData, albumsData] = await Promise.all([
        fetchPhotos({
          limit: resetPagination ? PAGE_SIZE : (currentPage + 1) * PAGE_SIZE,
          offset: resetPagination ? 0 : currentPage * PAGE_SIZE,
          search: searchQuery || undefined
        }),
        fetchAllAlbums()
      ])

      console.log("Fetched Photos Sample:", photosData?.[0]);
      console.log("Fetched Albums Sample:", albumsData?.[0]);

      if (resetPagination) {
        setPhotos(photosData || [])
      } else {
        setPhotos(prev => [...prev, ...(photosData || [])])
      }

      setAlbums(albumsData || [])

      // Check if we have more data
      if (photosData && photosData.length < PAGE_SIZE) {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError(new Error('Er ging iets mis bij het ophalen van de gegevens'))
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [currentPage, searchQuery, PAGE_SIZE])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Reset pagination when search changes
  useEffect(() => {
    if (searchQuery !== '') {
      loadData(true)
    }
  }, [searchQuery, loadData])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    setCurrentPage(prev => prev + 1)

    try {
      const photosData = await fetchPhotos({
        limit: PAGE_SIZE,
        offset: (currentPage + 1) * PAGE_SIZE,
        search: searchQuery || undefined
      })

      if (photosData && photosData.length > 0) {
        setPhotos(prev => [...prev, ...photosData])
      }

      if (!photosData || photosData.length < PAGE_SIZE) {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Error loading more data:', err)
      setError(new Error('Er ging iets mis bij het ophalen van meer gegevens'))
    } finally {
      setLoadingMore(false)
    }
  }

  const unorganizedPhotos = useMemo(() => {
    return photos.filter(photo =>
      !photo.album_photos || photo.album_photos.length === 0
    );
  }, [photos]);

  // Determine which photos to show based on active tab
  const photosToShowInGridOrList = activeTab === 'all' ? photos : unorganizedPhotos;



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


  const renderLibraryContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4 lg:gap-5">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      )
    }

    if (error) {
      return <div className="text-red-600 dark:text-red-400 text-center py-8">{error.message}</div>
    }


    // Get recent photos (last 6 uploaded)
    const recentPhotos = photosToShowInGridOrList
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 6);

    return (
      <div className="space-y-8">
        {/* Recent Photos Section */}
        {activeTab === 'all' && recentPhotos.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    Recent Toegevoegde Foto's
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Laatst geüploade foto's uit alle albums
                  </p>
                </div>
                <Link
                  to="/albums"
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm flex items-center gap-2"
                >
                  <FolderIcon className="w-4 h-4" />
                  Albums beheren
                </Link>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
                {recentPhotos.map(photo => (
                  <div
                    key={photo.id}
                    className="group relative aspect-square rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo.thumbnail_url || photo.url}
                      alt={photo.alt_text || photo.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-xs font-medium truncate" title={photo.title}>
                        {photo.title}
                      </p>
                      {/* Album Badge */}
                      {photo.album_photos && photo.album_photos.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {photo.album_photos.slice(0, 1).map(albumPhoto => {
                            const album = albums?.find(a => a.id === albumPhoto.album_id);
                            return album ? (
                              <span
                                key={album.id}
                                className="inline-block px-1.5 py-0.5 text-xs bg-indigo-500/90 text-white rounded backdrop-blur-sm"
                                title={album.title}
                              >
                                {album.title}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Photos Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {activeTab === 'all' ? 'Alle Foto\'s' : 'Niet-georganiseerde Foto\'s'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {activeTab === 'all'
                    ? `${photosToShowInGridOrList.length} foto${photosToShowInGridOrList.length !== 1 ? 's' : ''} uit alle albums`
                    : `${photosToShowInGridOrList.length} niet-georganiseerde foto${photosToShowInGridOrList.length !== 1 ? 's' : ''}`
                  }
                </p>
              </div>
              {activeTab === 'all' && !recentPhotos.length && (
                <Link
                  to="/albums"
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm flex items-center gap-2"
                >
                  <FolderIcon className="w-4 h-4" />
                  Albums beheren
                </Link>
              )}
            </div>
          </div>

          <div className="p-6">
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
                onSelectAll={() => handleSelectAll(photosToShowInGridOrList.map((p: Photo) => p.id))}
              />
            )}

            {/* Load More Button */}
            {hasMore && photosToShowInGridOrList.length > 0 && (
              <div className="flex justify-center pt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className={cc.button.base({ color: 'secondary', size: 'lg' })}
                >
                  {loadingMore ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Bezig met laden...
                    </div>
                  ) : (
                    'Meer foto\'s laden'
                  )}
                </button>
              </div>
            )}

            {/* Empty State */}
            {photosToShowInGridOrList.length === 0 && !loading && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {activeTab === 'all' ? 'Geen foto\'s gevonden' : 'Geen niet-georganiseerde foto\'s'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchQuery
                    ? `Geen resultaten voor "${searchQuery}"`
                    : activeTab === 'all'
                      ? 'Upload je eerste foto\'s om te beginnen'
                      : 'Alle foto\'s zijn georganiseerd in albums'
                  }
                </p>
                {activeTab === 'all' && !searchQuery && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className={cc.button.base({ color: 'primary' })}
                  >
                    <PhotoIcon className="w-5 h-5 mr-2" />
                    Foto's uploaden
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <PhotoErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div>
                <H2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Foto's</H2>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  Beheer al je foto's in albums en georganiseerde collecties
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
                  className={`${cc.button.base({ color: 'primary', size: 'lg' })} w-full sm:w-auto`}
                  title="Upload nieuwe foto's vanaf uw apparaat"
                >
                  <PhotoIcon className="w-5 h-5 mr-2" />
                  Upload Foto's
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">

      {/* Filters and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Alle Foto's
            </button>
            <button
              onClick={() => setActiveTab('unorganized')}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 relative ${
                activeTab === 'unorganized'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">Niet Georganiseerd</span>
              <span className="sm:hidden">Niet Geordend</span>
              {unorganizedPhotos.length > 0 && (
                <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {unorganizedPhotos.length}
                </span>
              )}
            </button>
          </div>

          {/* Search and View Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="search"
                placeholder="Zoek foto's..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center bg-gray-100 dark:bg-gray-700 p-1 rounded-lg self-start">
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  view === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Grid weergave"
              >
                <ViewColumnsIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  view === 'list'
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Lijst weergave"
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <PhotoActionsBar
        selectedPhotoIds={selectedPhotoIds}
        onClearSelection={() => setSelectedPhotoIds(new Set())}
        setError={setError}
        albums={albums}
      />

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

      {selectedPhoto && (
        <PhotoDetailsModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onUpdate={async () => { await loadData(); setSelectedPhoto(null); }}
          albums={albums}
          allPhotos={photosToShowInGridOrList}
          onNavigate={(photoId) => {
            const photo = photosToShowInGridOrList.find(p => p.id === photoId);
            if (photo) setSelectedPhoto(photo);
          }}
        />
      )}
          </div>
        </div>
      </div>
    </PhotoErrorBoundary>
  )
}