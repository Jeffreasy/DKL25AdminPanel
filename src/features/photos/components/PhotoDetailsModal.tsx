import { useState, useEffect, useCallback } from 'react'
import { Dialog } from '@headlessui/react'
import { PencilIcon, EyeIcon, EyeSlashIcon, XMarkIcon as CloseIcon, ChevronLeftIcon, ChevronRightIcon, FolderIcon, PhotoIcon, CalendarIcon } from '@heroicons/react/24/outline'
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
  allPhotos?: Photo[]
  onNavigate?: (photoId: string) => void
}

export function PhotoDetailsModal({ photo, onClose, onUpdate, albums, allPhotos, onNavigate }: PhotoDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: photo.title,
    description: photo.description || '',
    alt_text: photo.alt_text || '',
    visible: photo.visible,
    year: photo.year || ''
  })

  // Navigation logic
  const currentIndex = allPhotos?.findIndex(p => p.id === photo.id) ?? -1
  const hasPrevious = currentIndex > 0
  const hasNext = allPhotos && currentIndex < allPhotos.length - 1

  const handlePrevious = useCallback(() => {
    if (hasPrevious && allPhotos && onNavigate) {
      onNavigate(allPhotos[currentIndex - 1].id)
    }
  }, [hasPrevious, allPhotos, onNavigate, currentIndex])

  const handleNext = useCallback(() => {
    if (hasNext && allPhotos && onNavigate) {
      onNavigate(allPhotos[currentIndex + 1].id)
    }
  }, [hasNext, allPhotos, onNavigate, currentIndex])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrevious) {
        handlePrevious()
      } else if (e.key === 'ArrowRight' && hasNext) {
        handleNext()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [hasPrevious, hasNext, handlePrevious, handleNext, onClose])

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
      <div className={`fixed inset-0 bg-black/80 dark:bg-black/90 z-[${Z_INDEX.PHOTO_SELECTOR}]`} aria-hidden="true" />

      <div className={`fixed inset-0 flex items-center justify-center p-2 sm:p-4 z-[${Z_INDEX.PHOTO_SELECTOR}]`}>
        <Dialog.Panel className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]">

          {/* Enhanced Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-shrink-0">
                <PhotoIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <Dialog.Title as="h2" className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                  Foto details
                </Dialog.Title>
              </div>
              {allPhotos && (
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {currentIndex + 1} / {allPhotos.length}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Navigation Buttons - Hidden on mobile, shown on larger screens */}
              {allPhotos && (
                <>
                  <button
                    onClick={handlePrevious}
                    disabled={!hasPrevious}
                    className={`hidden sm:flex ${cc.button.icon({
                      color: 'secondary',
                      className: hasPrevious ? 'hover:bg-gray-200 dark:hover:bg-gray-700' : 'opacity-50 cursor-not-allowed'
                    })}`}
                    title="Vorige foto (←)"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!hasNext}
                    className={`hidden sm:flex ${cc.button.icon({
                      color: 'secondary',
                      className: hasNext ? 'hover:bg-gray-200 dark:hover:bg-gray-700' : 'opacity-50 cursor-not-allowed'
                    })}`}
                    title="Volgende foto (→)"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                  <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
                </>
              )}

              {/* Action Buttons */}
              <button
                onClick={handleVisibilityToggle}
                disabled={loading}
                className={cc.button.icon({
                  color: 'secondary',
                  className: `relative ${photo.visible ? 'text-green-600 dark:text-green-400' : ''}`
                })}
                title={photo.visible ? 'Verberg foto' : 'Maak foto zichtbaar'}
              >
                {photo.visible ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                disabled={loading}
                className={cc.button.icon({
                  color: isEditing ? 'primary' : 'secondary'
                })}
                title={isEditing ? "Annuleer bewerken" : "Bewerk details"}
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className={cc.button.icon({ color: 'secondary' })}
                title="Sluiten (Esc)"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row flex-grow overflow-hidden">
            {/* Image Display Area */}
            <div className="flex-1 bg-gray-100 dark:bg-gray-900 flex-shrink-0 relative min-h-[300px] lg:min-h-0">
              <img
                src={photo.url}
                alt={photo.alt_text || photo.title}
                className="absolute inset-0 w-full h-full object-contain"
                loading="lazy"
              />

              {/* Mobile Navigation Buttons - Bottom positioned for touch */}
              {allPhotos && (
                <div className="lg:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                  <button
                    onClick={handlePrevious}
                    disabled={!hasPrevious}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                      hasPrevious
                        ? 'bg-black/70 hover:bg-black/90 text-white shadow-lg'
                        : 'bg-black/30 text-white/50 cursor-not-allowed'
                    }`}
                    title="Vorige foto"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!hasNext}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                      hasNext
                        ? 'bg-black/70 hover:bg-black/90 text-white shadow-lg'
                        : 'bg-black/30 text-white/50 cursor-not-allowed'
                    }`}
                    title="Volgende foto"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </div>
              )}

              {/* Desktop Navigation overlays */}
              {allPhotos && (
                <>
                  {hasPrevious && (
                    <button
                      onClick={handlePrevious}
                      className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                      title="Vorige foto (←)"
                    >
                      <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                  )}
                  {hasNext && (
                    <button
                      onClick={handleNext}
                      className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                      title="Volgende foto (→)"
                    >
                      <ChevronRightIcon className="w-6 h-6" />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Details/Form Area */}
            <div className="w-full lg:w-96 flex flex-col border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex-1 overflow-y-auto p-6">
                {isEditing ? (
                  // Enhanced Editing Form
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <PencilIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bewerk details</h3>
                    </div>

                    <div>
                      <label htmlFor="title" className={cc.form.label()}>Titel *</label>
                      <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className={cc.form.input({ className: 'mt-1' })}
                        placeholder="Voer een titel in..."
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className={cc.form.label()}>Beschrijving</label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        className={cc.form.input({ className: 'mt-1' })}
                        placeholder="Voer een beschrijving in..."
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
                        placeholder="Alternatieve tekst voor toegankelijkheid..."
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
                        placeholder="2024"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                      />
                    </div>
                  </div>
                ) : (
                  // Enhanced Display Details
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                        {photo.title}
                      </h3>
                      {photo.year && (
                        <p className="text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                          {photo.year}
                        </p>
                      )}
                    </div>

                    {photo.description && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                          Beschrijving
                        </h4>
                        <p className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                          {photo.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                          Status
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${photo.visible ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {photo.visible ? 'Zichtbaar' : 'Verborgen'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                          Toegevoegd
                        </h4>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {new Date(photo.created_at).toLocaleDateString('nl-NL', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {photo.alt_text && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                          Alt tekst
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                          "{photo.alt_text}"
                        </p>
                      </div>
                    )}

                    {photo.album_photos && photo.album_photos.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                          Albums ({photo.album_photos.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {photo.album_photos.map(({ album_id }) => {
                            const currentAlbum = albums?.find(a => a.id === album_id);
                            return (
                              <div
                                key={album_id}
                                className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg"
                              >
                                <FolderIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                                  {currentAlbum?.title || 'Onbekend album'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Technical Info */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                        Technische informatie
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">ID:</span>
                          <p className="text-gray-900 dark:text-white font-mono text-xs mt-1 break-all">
                            {photo.id}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Type:</span>
                          <p className="text-gray-900 dark:text-white mt-1">
                            {photo.url.split('.').pop()?.toUpperCase() || 'Onbekend'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Footer */}
              {isEditing && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    * Verplichte velden
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className={cc.button.base({ color: 'secondary' })}
                      disabled={loading}
                    >
                      Annuleren
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading || !formData.title.trim()}
                      className={cc.button.base({
                        color: 'primary',
                        className: 'min-w-[100px]'
                      })}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Opslaan...
                        </div>
                      ) : (
                        'Opslaan'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 