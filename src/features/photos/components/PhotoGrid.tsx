import { useState } from 'react'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton'
import { Dialog } from '@headlessui/react'
import { TrashIcon, PencilIcon, EyeIcon, EyeSlashIcon, FolderIcon } from '@heroicons/react/24/outline'
import { Z_INDEX } from '../../../constants/zIndex'
import type { Photo } from '../types'
import type { AlbumWithDetails } from '../../albums/types'
import clsx from 'clsx'
import { supabase } from '../../../lib/supabase'
import { cc } from '../../../styles/shared'

interface PhotoGridProps {
  photos: Photo[]
  loading: boolean
  error: Error | null
  onUpdate: () => Promise<void>
  setError: (error: Error | null) => void
  onPhotoRemove?: (photoId: string) => void
  albums?: AlbumWithDetails[]
}

interface PhotoDetailsModalProps {
  photo: Photo
  onClose: () => void
  onUpdate: () => void
  albums?: AlbumWithDetails[]
}

function PhotoDetailsModal({ photo, onClose, onUpdate, albums }: PhotoDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: photo.title,
    description: photo.description || '',
    alt_text: photo.alt_text || '',
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
          alt_text: formData.alt_text || null,
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
      <div className={`fixed inset-0 bg-black/30 dark:bg-black/70 z-[${Z_INDEX.PHOTO_SELECTOR}]`} aria-hidden="true" />
      
      <div className={`fixed inset-0 flex items-center justify-center p-4 z-[${Z_INDEX.PHOTO_SELECTOR}]`}>
        <Dialog.Panel className={cc.card({ className: 'w-full max-w-3xl overflow-hidden p-0 flex flex-col max-h-[90vh]' })}>
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
            <Dialog.Title as="h2" className="text-lg font-medium text-gray-900 dark:text-white">
              Foto details
            </Dialog.Title>
            <div className="flex gap-1">
              <button
                onClick={handleVisibilityToggle}
                disabled={loading}
                className={cc.button.icon({ color: 'secondary' })}
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
                className={cc.button.icon({ color: 'secondary' })}
                title="Bewerken"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className={cc.button.icon({ color: 'secondary' })}
                title="Sluiten"
              >
                <span className="sr-only">Sluiten</span>
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-grow overflow-hidden">
            <div className="w-2/3 bg-gray-100 dark:bg-black flex-shrink-0 relative">
              <img
                src={photo.url}
                alt={photo.alt_text || photo.title}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>

            <div className="w-1/3 flex flex-col border-l border-gray-200 dark:border-gray-700">
              <div className="flex-1 overflow-y-auto p-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className={cc.form.label()}>Titel</label>
                      <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className={cc.form.input({ className: 'mt-1' })}
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className={cc.form.label()}>Beschrijving</label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className={cc.form.input({ className: 'mt-1' })}
                      />
                    </div>
                    <div>
                      <label htmlFor="alt_text" className={cc.form.label()}>Alt tekst</label>
                      <input
                        type="text"
                        id="alt_text"
                        value={formData.alt_text}
                        onChange={e => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                        className={cc.form.input({ className: 'mt-1' })}
                      />
                    </div>
                    <div>
                      <label htmlFor="year" className={cc.form.label()}>Jaar</label>
                      <input
                        type="number"
                        id="year"
                        value={formData.year}
                        onChange={e => setFormData(prev => ({ ...prev, year: e.target.value }))}
                        className={cc.form.input({ className: 'mt-1' })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Titel</h3>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{photo.title}</p>
                    </div>
                    {photo.description && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Beschrijving</h3>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{photo.description}</p>
                      </div>
                    )}
                    {photo.alt_text && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Alt tekst</h3>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{photo.alt_text}</p>
                      </div>
                    )}
                    {photo.year && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Jaar</h3>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{photo.year}</p>
                      </div>
                    )}
                    {photo.album_photos && photo.album_photos.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Albums</h3>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {photo.album_photos.map(({ album_id }) => {
                            const currentAlbum = albums?.find(a => a.id === album_id);
                            return (
                              <span
                                key={album_id}
                                className={cc.badge({ color: 'gray' })}
                              >
                                {currentAlbum?.title || 'Onbekend Album'}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Toegevoegd op</h3>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {new Date(photo.created_at).toLocaleDateString('nl-NL')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-2 flex-shrink-0">
                  <button
                    onClick={() => setIsEditing(false)}
                    className={cc.button.base({ color: 'secondary' })}
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className={cc.button.base({ color: 'primary' })}
                  >
                    {loading ? 'Opslaan...' : 'Opslaan'}
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
  onPhotoRemove,
  albums
}: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleError = (message: string) => {
    setError(new Error(message))
  }

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
      handleError('Er ging iets mis bij het verwijderen van de foto')
    } finally {
      setIsDeleting(null)
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
      <div className={cc.grid()}>
        {photos.map(photo => (
          <div
            key={photo.id}
            className={clsx(
              "group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
              isDeleting === photo.id && "opacity-50"
            )}
          >
            <img
              src={photo.thumbnail_url || photo.url}
              alt={photo.alt_text || photo.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
              <div className="flex justify-end gap-1">
                <button
                  onClick={() => setSelectedPhoto(photo)}
                  className={cc.button.icon({ className: 'bg-black/40 text-white hover:bg-black/60' })}
                  title="Details bekijken"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(photo)}
                  disabled={isDeleting === photo.id}
                  className={cc.button.iconDanger({ className: 'bg-black/40 text-white hover:bg-black/60' })}
                  title="Foto verwijderen"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col items-start gap-1">
                {!photo.visible && (
                  <span className={cc.badge({ color: 'orange' })}>
                    Verborgen
                  </span>
                )}
                {photo.album_photos && photo.album_photos.length > 0 && (
                  <div className="flex flex-wrap gap-1 max-w-full">
                    {photo.album_photos.map(({ album_id }) => {
                       const currentAlbum = albums?.find(a => a.id === album_id);
                       return (
                          <span
                            key={album_id} 
                            className={cc.badge({ color: 'gray', className: 'bg-white/90 dark:bg-gray-900/80 truncate max-w-[150px]' })}
                            title={currentAlbum?.title || 'Onbekend Album'}
                          >
                            <FolderIcon className="w-3 h-3 mr-1 text-gray-500 dark:text-gray-400 inline-block" />
                            {currentAlbum?.title || 'Onbekend'}
                          </span>
                       );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPhoto ? (
        <PhotoDetailsModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onUpdate={() => {
            onUpdate()
            setSelectedPhoto(null)
          }}
          albums={albums}
        />
      ) : null}
    </>
  )
} 