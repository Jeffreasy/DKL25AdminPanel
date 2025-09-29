import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { PencilIcon, EyeIcon, EyeSlashIcon, XMarkIcon as CloseIcon } from '@heroicons/react/24/outline'
import { Z_INDEX } from '../../../constants/zIndex'
import type { Photo } from '../types'
import type { AlbumWithDetails } from '../../albums/types'
import { supabase } from '../../../lib/supabase'
import { cc } from '../../../styles/shared'

export interface PhotoDetailsModalProps {
  photo: Photo
  onClose: () => void
  onUpdate: () => void
  albums?: AlbumWithDetails[]
}

export function PhotoDetailsModal({ photo, onClose, onUpdate, albums }: PhotoDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: photo.title,
    description: photo.description || '',
    alt_text: photo.alt_text || '',
    visible: photo.visible, // Ensure visible is part of the state if needed for editing, though handled separately by toggle
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
      onUpdate() // Trigger refresh in parent
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
      setIsEditing(false) // Exit edit mode
      onUpdate() // Trigger refresh in parent
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
                title={photo.visible ? 'Verberg foto' : 'Maak foto zichtbaar'}
              >
                {photo.visible ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                disabled={loading}
                className={cc.button.icon({ color: 'secondary' })}
                title={isEditing ? "Annuleer bewerken" : "Bewerk details"}
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className={cc.button.icon({ color: 'secondary' })}
                title="Sluiten"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-grow overflow-hidden">
            {/* Image Display Area */}
            <div className="w-2/3 bg-gray-100 dark:bg-black flex-shrink-0 relative">
              <img
                src={photo.url} 
                alt={photo.alt_text || photo.title}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>

            {/* Details/Form Area */}
            <div className="w-1/3 flex flex-col border-l border-gray-200 dark:border-gray-700">
              <div className="flex-1 overflow-y-auto p-4">
                {isEditing ? (
                  // Editing Form
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
                  // Displaying Details
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
                                title={currentAlbum?.title || 'Onbekend'}
                              >
                                {currentAlbum?.title || 'Onbekend'}
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

              {/* Footer for Save/Cancel Buttons */}
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