import { useState, useEffect } from 'react'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton'
import { ErrorText } from '../../../components/typography'
import { PhotoCard } from './PhotoCard'
import { supabase } from '../../../lib/supabase'
import type { Photo } from '../types'
import type { Album } from '../../albums/types'
import { deletePhoto } from '../../../features/services/photoService'
import { Dialog } from '@headlessui/react'
import { TrashIcon, PencilIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { Z_INDEX } from '../../../constants/zIndex'
import clsx from 'clsx'

interface PhotoGridProps {
  photos: Photo[]
  loading: boolean
  error: string | null
  onUpdate: () => void
  setError: (error: string | null) => void
  view?: 'grid' | 'list'
  onPhotoRemove?: (photoId: string) => Promise<void>
  className?: string
}

interface PhotoDetailsModalProps {
  photo: Photo
  onClose: () => void
  onUpdate: () => void
}

function PhotoDetailsModal({ photo, onClose, onUpdate }: PhotoDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: photo.title,
    description: photo.description || '',
    alt: photo.alt || '',
    visible: photo.visible,
    year: photo.year || ''
  })

  const handleVisibilityToggle = async () => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('photos')
        .update({ visible: !photo.visible })
        .eq('id', photo.id)

      if (error) throw error
      onUpdate()
    } catch (err) {
      console.error('Error toggling visibility:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('photos')
        .update({
          title: formData.title,
          description: formData.description || null,
          alt: formData.alt || null,
          year: formData.year || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', photo.id)

      if (error) throw error
      setIsEditing(false)
      onUpdate()
    } catch (err) {
      console.error('Error updating photo:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onClose={onClose} className={`relative z-[${Z_INDEX.PHOTO_SELECTOR}]`}>
      <div className={`fixed inset-0 bg-black/30 z-[${Z_INDEX.PHOTO_SELECTOR}]`} aria-hidden="true" />
      
      <div className={`fixed inset-0 flex items-center justify-center p-4 z-[${Z_INDEX.PHOTO_SELECTOR}]`}>
        <Dialog.Panel className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden">
          <div className="flex h-[32rem]">
            {/* Foto preview */}
            <div className="w-2/3 bg-gray-900 relative">
              <img
                src={photo.url}
                alt={photo.alt || photo.title}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>

            {/* Details/edit form */}
            <div className="w-1/3 flex flex-col border-l border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  Foto details
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleVisibilityToggle}
                    disabled={loading}
                    className="p-1.5 text-gray-500 hover:text-gray-700 rounded-md"
                    title={photo.visible ? 'Verbergen' : 'Zichtbaar maken'}
                  >
                    {photo.visible ? (
                      <EyeIcon className="w-5 h-5" />
                    ) : (
                      <EyeSlashIcon className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={loading}
                    className="p-1.5 text-gray-500 hover:text-gray-700 rounded-md"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1.5 text-gray-500 hover:text-gray-700 rounded-md"
                  >
                    <span className="sr-only">Sluiten</span>
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Titel
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Beschrijving
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="alt" className="block text-sm font-medium text-gray-700">
                        Alt tekst
                      </label>
                      <input
                        type="text"
                        id="alt"
                        value={formData.alt}
                        onChange={e => setFormData(prev => ({ ...prev, alt: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                        Jaar
                      </label>
                      <input
                        type="text"
                        id="year"
                        value={formData.year}
                        onChange={e => setFormData(prev => ({ ...prev, year: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Titel</h3>
                      <p className="mt-1 text-sm text-gray-900">{photo.title}</p>
                    </div>
                    {photo.description && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Beschrijving</h3>
                        <p className="mt-1 text-sm text-gray-900">{photo.description}</p>
                      </div>
                    )}
                    {photo.alt && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Alt tekst</h3>
                        <p className="mt-1 text-sm text-gray-900">{photo.alt}</p>
                      </div>
                    )}
                    {photo.year && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Jaar</h3>
                        <p className="mt-1 text-sm text-gray-900">{photo.year}</p>
                      </div>
                    )}
                    {photo.album_photos && photo.album_photos.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Albums</h3>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {photo.album_photos.map(({ album }) => (
                            <span
                              key={album.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              {album.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Toegevoegd op</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(photo.created_at).toLocaleDateString('nl-NL')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-800"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Opslaan
                  </button>
                </div>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export function PhotoGrid({ 
  photos, 
  loading, 
  error, 
  onUpdate,
  setError,
  view = 'grid',
  onPhotoRemove,
  className 
}: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (photo: Photo) => {
    if (!confirm(`Weet je zeker dat je deze foto wilt verwijderen?`)) {
      return
    }

    try {
      setIsDeleting(photo.id)
      
      if (onPhotoRemove) {
        await onPhotoRemove(photo.id)
      } else {
        const { error } = await supabase
          .from('photos')
          .delete()
          .eq('id', photo.id)

      if (error) throw error
      }

      onUpdate()
    } catch (err) {
      console.error('Error deleting photo:', err)
      setError('Er ging iets mis bij het verwijderen van de foto')
    } finally {
      setIsDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className={className}>
        {[...Array(12)].map((_, i) => (
          <LoadingSkeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="mt-2 text-sm text-gray-500">
          Nog geen foto's geüpload
        </p>
      </div>
    )
  }

  return (
    <>
      <div className={className}>
        {photos.map(photo => (
          <div
            key={photo.id}
            className={clsx(
              "group relative aspect-square rounded-lg overflow-hidden bg-gray-100",
              isDeleting === photo.id && "opacity-50"
            )}
          >
            <img
              src={photo.thumbnail_url || photo.url}
              alt={photo.alt || photo.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            
            {/* Overlay met acties */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors">
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
                  onClick={() => setSelectedPhoto(photo)}
                  className="p-1.5 text-white hover:text-gray-200 rounded-md"
                  title="Details bekijken"
            >
                  <PencilIcon className="w-5 h-5" />
            </button>
            <button
                  onClick={() => handleDelete(photo)}
                  disabled={isDeleting === photo.id}
                  className="p-1.5 text-white hover:text-gray-200 rounded-md disabled:opacity-50"
                  title="Foto verwijderen"
                >
                  <TrashIcon className="w-5 h-5" />
            </button>
          </div>

              {/* Album badges */}
              {photo.album_photos && photo.album_photos.length > 0 && (
                <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 max-w-[calc(100%-1rem)] opacity-0 group-hover:opacity-100 transition-opacity">
                  {photo.album_photos.map(({ album }) => (
                    <span
                      key={album.id}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-900 truncate max-w-[150px]"
                      title={album.title}
                    >
                      <svg className="w-3 h-3 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {album.title}
                    </span>
                  ))}
                </div>
              )}

              {!photo.visible && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                  Verborgen
            </div>
              )}
            </div>
          </div>
        ))}
        </div>

      {selectedPhoto && (
        <PhotoDetailsModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onUpdate={() => {
            onUpdate()
            setSelectedPhoto(null)
          }}
        />
      )}
    </>
  )
} 