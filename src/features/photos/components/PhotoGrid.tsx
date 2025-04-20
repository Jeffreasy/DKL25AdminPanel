import { useState } from 'react'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton'
import { Dialog } from '@headlessui/react'
import { TrashIcon, PencilIcon, EyeIcon, EyeSlashIcon, FolderIcon, XMarkIcon as CloseIcon } from '@heroicons/react/24/outline'
import { Z_INDEX } from '../../../constants/zIndex'
import type { Photo } from '../types'
import type { AlbumWithDetails } from '../../albums/types'
import clsx from 'clsx'
import { supabase } from '../../../lib/supabase'
import { cc } from '../../../styles/shared'
import { deletePhoto, updatePhotoVisibility } from '../services/photoService'
import { PhotoDetailsModal } from './PhotoDetailsModal'

interface PhotoGridProps {
  photos: Photo[]
  loading: boolean
  error: Error | null
  onUpdate: () => Promise<void>
  setError: (error: Error | null) => void
  onPhotoRemove?: (photoId: string) => void
  albums?: AlbumWithDetails[]
  selectedPhotoIds: Set<string>
  onSelectionChange: (photoId: string, isSelected: boolean) => void
}

export function PhotoGrid({
  photos,
  loading,
  error,
  onUpdate,
  setError,
  onPhotoRemove,
  albums,
  selectedPhotoIds,
  onSelectionChange
}: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null)

  const handleError = (message: string) => {
    setError(new Error(message))
  }

  const handleDelete = async (photo: Photo | null) => {
    if (!photo) return
    try {
      await deletePhoto(photo.id);
      setPhotoToDelete(null)
      await onUpdate()
    } catch (err) {
      console.error("Error deleting photo:", err)
      handleError('Er ging iets mis bij het verwijderen van de foto')
      setPhotoToDelete(null)
    }
  }

  const handleVisibilityToggle = async (photo: Photo | null) => {
    if (!photo) return
    try {
      await updatePhotoVisibility(photo.id, !photo.visible);
      await onUpdate();
    } catch (err) {
      handleError('Kon zichtbaarheid niet wijzigen');
    }
  }

  if (loading) {
    return (
      <div className={cc.grid()}>
        {[...Array(12)].map((_, i) => (
          <LoadingSkeleton key={i} className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-700" />
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {photos.map(photo => {
          const isSelected = selectedPhotoIds.has(photo.id);
          return (
            <div 
              key={photo.id} 
              className={`group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${isSelected ? 'ring-2 ring-offset-2 dark:ring-offset-gray-900 ring-indigo-500' : ''}`}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('.photo-grid-actions')) return;
                onSelectionChange(photo.id, !isSelected);
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelectionChange(photo.id, e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-2 left-2 z-10 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:checked:bg-indigo-600"
              />
              <img
                src={photo.thumbnail_url || photo.url}
                alt={photo.alt_text || photo.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="photo-grid-actions absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 p-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhoto(photo);
                  }}
                  className={`${cc.button.icon({})} bg-black/30 text-white hover:bg-black/50`}
                  title="Bekijk / Bewerk details" 
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVisibilityToggle(photo);
                  }}
                  className={`${cc.button.icon({})} bg-black/30 text-white hover:bg-black/50`}
                  title={photo.visible ? 'Verberg foto' : 'Maak foto zichtbaar'} 
                >
                  {photo.visible ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoToDelete(photo);
                  }}
                  className={`${cc.button.icon({})} bg-red-600/70 text-white hover:bg-red-700/80`}
                  title="Verwijder foto" 
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
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
                  <button onClick={() => handleDelete(photoToDelete)} className={cc.button.base({ color: 'danger', className: 'w-full sm:ml-3 sm:w-auto' })}>
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