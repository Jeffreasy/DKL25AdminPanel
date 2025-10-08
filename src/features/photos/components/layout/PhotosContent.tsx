import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { cc } from '../../../../styles/shared'
import type { Photo } from '../../types'
import type { AlbumWithDetails } from '../../../albums/types'
import { PhotoGrid } from '../display/PhotoGrid'
import { PhotoList } from '../display/PhotoList'

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

interface PhotosContentProps {
  activeTab: 'all' | 'unorganized'
  view: 'grid' | 'list'
  photos: Photo[]
  albums: AlbumWithDetails[]
  filteredAlbums: AlbumWithDetails[]
  filteredUnorganizedPhotos: Photo[]
  loading: boolean
  error: Error | null
  searchQuery: string
  expandedSections: Set<string>
  selectedPhotoIds: Set<string>
  onToggleSection: (sectionId: string) => void
  onUpdate: () => Promise<void>
  onSetError: (error: Error | null) => void
  onSelectionChange: (photoId: string, isSelected: boolean) => void
  onSelectAll: (photoIds: string[]) => void
}

export function PhotosContent({
  activeTab,
  view,
  photos,
  albums,
  filteredAlbums,
  filteredUnorganizedPhotos,
  loading,
  error,
  searchQuery,
  expandedSections,
  selectedPhotoIds,
  onToggleSection,
  onUpdate,
  onSetError,
  onSelectionChange,
  onSelectAll
}: PhotosContentProps) {
  if (loading) {
    return (
      <div className={`${cc.grid.compact()} gap-4`}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400 text-center py-8">{error.message}</div>
  }

  return (
    <div className="space-y-4">
      {activeTab === 'all' && (
        <CollapsibleSection
          title="Recent gebruikte albums"
          count={albums.length}
          defaultOpen={expandedSections.has('recent-albums')}
          onToggle={() => onToggleSection('recent-albums')}
        >
          <div className={`${cc.grid.compact()} gap-4`}>
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
              className={`flex items-center justify-center aspect-[4/3] bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 hover:bg-gray-100 dark:hover:bg-gray-700 group ${cc.transition.colors}`}
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
                onToggle={() => onToggleSection(`album-${album.id}`)}
              >
                <PhotoGrid
                  photos={albumPhotos}
                  loading={false}
                  error={null}
                  onUpdate={onUpdate}
                  setError={onSetError}
                  albums={albums}
                  selectedPhotoIds={selectedPhotoIds}
                  onSelectionChange={onSelectionChange}
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
            onUpdate={onUpdate}
            setError={onSetError}
            albums={albums}
            selectedPhotoIds={selectedPhotoIds}
            onSelectionChange={onSelectionChange}
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
          onToggle={() => onToggleSection('unorganized')}
        >
          <PhotoGrid
            photos={filteredUnorganizedPhotos}
            loading={loading}
            error={error}
            onUpdate={onUpdate}
            setError={onSetError}
            albums={albums}
            selectedPhotoIds={selectedPhotoIds}
            onSelectionChange={onSelectionChange}
          />
        </CollapsibleSection>
      )}

      {view === 'grid' ? (
        <PhotoGrid
          photos={filteredUnorganizedPhotos}
          loading={loading}
          error={error}
          onUpdate={onUpdate}
          setError={onSetError}
          albums={albums}
          selectedPhotoIds={selectedPhotoIds}
          onSelectionChange={onSelectionChange}
        />
      ) : (
        <PhotoList
          photos={filteredUnorganizedPhotos}
          loading={loading}
          error={error}
          onUpdate={onUpdate}
          setError={onSetError}
          albums={albums}
          selectedPhotoIds={selectedPhotoIds}
          onSelectionChange={onSelectionChange}
          onSelectAll={() => onSelectAll(filteredUnorganizedPhotos.map(p => p.id))}
        />
      )}
    </div>
  )
}