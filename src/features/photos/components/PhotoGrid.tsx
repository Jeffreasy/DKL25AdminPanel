import { useState } from 'react'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton'
import { Dialog } from '@headlessui/react'
import { TrashIcon, PencilIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { Z_INDEX } from '../../../constants/zIndex'
import type { Photo } from '../types'
import type { AlbumWithDetails } from '../../albums/types'
import { cc } from '../../../styles/shared'
import { PhotoDetailsModal } from './PhotoDetailsModal'
import { usePhotoActions } from '../hooks/usePhotoActions'
import { usePhotoSelection } from '../hooks/usePhotoSelection'

interface PhotoGridProps {
  photos: Photo[]
  loading: boolean
  error: Error | null
  onUpdate: () => Promise<void>
  setError: (error: Error | null) => void
  albums?: AlbumWithDetails[]
  selectedPhotoIds?: Set<string>
  onSelectionChange?: (photoId: string, isSelected: boolean) => void
}

export function PhotoGrid({
  photos,
  loading,
  error,
  onUpdate,
  setError,
  albums,
  selectedPhotoIds: externalSelectedPhotoIds,
  onSelectionChange: externalOnSelectionChange
}: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null)

  const photoActions = usePhotoActions({ setError })
  const internalPhotoSelection = usePhotoSelection()

  // Use external selection if provided, otherwise use internal
  const photoSelection = externalSelectedPhotoIds !== undefined ? {
    selectedPhotoIds: externalSelectedPhotoIds,
    handleSelectionChange: externalOnSelectionChange || (() => {}),
    handleSelectAll: () => {},
    clearSelection: () => {},
    selectedCount: externalSelectedPhotoIds.size
  } : internalPhotoSelection

  if (loading) {
    return (
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4 lg:gap-5">
        {[...Array(12)].map((_, i) => (
          <LoadingSkeleton key={i} className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error.message}</p>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Nog geen foto's geüpload
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4 lg:gap-5">
        {photos.map(photo => {
          const isSelected = photoSelection.selectedPhotoIds.has(photo.id);
          return (
            <div
              key={photo.id}
              className={`group relative aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/50 border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg scale-[1.02]'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
              }`}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('.photo-grid-actions')) return;
                photoSelection.handleSelectionChange(photo.id, !isSelected);
              }}
            >
              {/* Selection Checkbox */}
              <div className={`absolute top-3 left-3 z-20 transition-opacity duration-200 ${
                isSelected || photoSelection.selectedPhotoIds.size > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => photoSelection.handleSelectionChange(photo.id, e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 rounded border-2 border-white/80 text-indigo-600 focus:ring-indigo-500 bg-white/90 backdrop-blur-sm shadow-sm"
                />
              </div>

              {/* Photo Image */}
              <div className="relative w-full h-full">
                <img
                  src={photo.thumbnail_url || photo.url}
                  alt={photo.alt_text || photo.title}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Action Buttons */}
                <div className="photo-grid-actions absolute inset-0 flex items-center justify-center gap-2 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPhoto(photo);
                      }}
                      className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
                      title="Bekijk / Bewerk details"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        photoActions.handleVisibilityToggle(photo);
                      }}
                      className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
                      title={photo.visible ? 'Verberg foto' : 'Maak foto zichtbaar'}
                    >
                      {photo.visible ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoToDelete(photo);
                      }}
                      className="p-2 rounded-full bg-red-500/90 backdrop-blur-sm text-white hover:bg-red-500 hover:scale-110 transition-all duration-200 shadow-lg"
                      title="Verwijder foto"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Photo Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-white">
                    <p className="text-sm font-medium truncate" title={photo.title}>
                      {photo.title}
                    </p>
                    {photo.year && (
                      <p className="text-xs text-gray-200">{photo.year}</p>
                    )}
                    {/* Album Badges */}
                    {photo.album_photos && photo.album_photos.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {photo.album_photos.slice(0, 2).map(albumPhoto => {
                          const album = albums?.find(a => a.id === albumPhoto.album_id);
                          return album ? (
                            <span
                              key={album.id}
                              className="inline-block px-2 py-0.5 text-xs bg-indigo-500/80 text-white rounded-full backdrop-blur-sm"
                              title={album.title}
                            >
                              {album.title}
                            </span>
                          ) : null;
                        })}
                        {photo.album_photos.length > 2 && (
                          <span className="inline-block px-2 py-0.5 text-xs bg-gray-500/80 text-white rounded-full backdrop-blur-sm">
                            +{photo.album_photos.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPhoto && (
        <PhotoDetailsModal 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)} 
          onUpdate={async () => { await onUpdate(); setSelectedPhoto(null); }} 
          albums={albums}
        />
      )}

      {photoToDelete && (
        <Dialog open={!!photoToDelete} onClose={() => setPhotoToDelete(null)} className={`relative z-[${Z_INDEX.PHOTO_SELECTOR + 1}]`}>
          <div className={`fixed inset-0 bg-black/30 dark:bg-black/70 z-[${Z_INDEX.PHOTO_SELECTOR + 1}]`} aria-hidden="true" />
          <div className={`fixed inset-0 flex items-center justify-center p-4 z-[${Z_INDEX.PHOTO_SELECTOR + 1}]`}>
            {photoToDelete && (
              <Dialog.Panel className={cc.card({ className: "max-w-md" })}>
                <div className="p-4 sm:p-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Foto Verwijderen
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Weet je zeker dat je de foto "{photoToDelete.title}" wilt verwijderen?
                      Dit kan niet ongedaan worden gemaakt.
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button onClick={() => photoActions.handleDelete(photoToDelete)} className={cc.button.base({ color: 'danger', className: 'w-full sm:ml-3 sm:w-auto' })}>
                    Verwijderen
                  </button>
                  <button onClick={() => setPhotoToDelete(null)} className={cc.button.base({ color: 'secondary', className: 'mt-3 w-full sm:mt-0 sm:w-auto' })}>
                    Annuleren
                  </button>
                </div>
              </Dialog.Panel>
            )}
          </div>
        </Dialog>
      )}
    </>
  )
} 