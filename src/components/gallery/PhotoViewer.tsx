import React, { useEffect, useCallback } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { Z_INDEX } from '../../constants/zIndex'
import type { Photo } from '../../features/photos/types'
import { cc } from '../../styles/shared'

export interface PhotoViewerProps {
  photo: Photo
  isOpen: boolean
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
  currentIndex?: number
  totalPhotos?: number
  showNavigation?: boolean
  zIndex?: number
}

/**
 * Shared PhotoViewer component for displaying photos in fullscreen
 * Can be used with or without navigation controls
 */
export function PhotoViewer({
  photo,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  currentIndex,
  totalPhotos,
  showNavigation = true,
  zIndex = Z_INDEX.PREVIEW_MODAL + 10
}: PhotoViewerProps) {
  const hasNavigation = showNavigation && totalPhotos && totalPhotos > 1
  const hasPrevious = hasNavigation && currentIndex !== undefined && currentIndex > 0
  const hasNext = hasNavigation && currentIndex !== undefined && totalPhotos !== undefined && currentIndex < totalPhotos - 1

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          if (hasPrevious && onPrevious) {
            e.preventDefault()
            onPrevious()
          }
          break
        case 'ArrowRight':
          if (hasNext && onNext) {
            e.preventDefault()
            onNext()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, hasPrevious, hasNext, onPrevious, onNext, onClose])

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onClose={onClose} className={`relative z-[${zIndex}]`}>
      {/* Backdrop */}
      <div className={`fixed inset-0 bg-black/80 z-[${zIndex}]`} aria-hidden="true" />

      {/* Full-screen container */}
      <div className={`fixed inset-0 flex items-center justify-center p-4 z-[${zIndex}]`}>
        <Dialog.Panel className="relative flex items-center justify-center w-full h-full">
          {/* Image Display */}
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            <img
              src={photo.url}
              alt={photo.alt_text || photo.title}
              className="block max-w-full max-h-[90vh] object-contain"
              loading="lazy"
            />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white ${cc.transition.normal}`}
            aria-label="Sluiten (Esc)"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          {/* Navigation Buttons */}
          {hasNavigation && (
            <>
              {/* Previous Button */}
              {hasPrevious && onPrevious && (
                <button
                  onClick={onPrevious}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white ${cc.transition.normal} disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label="Vorige foto (←)"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
              )}

              {/* Next Button */}
              {hasNext && onNext && (
                <button
                  onClick={onNext}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white ${cc.transition.normal} disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label="Volgende foto (→)"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              )}
            </>
          )}

          {/* Counter */}
          {hasNavigation && currentIndex !== undefined && totalPhotos !== undefined && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full font-medium">
              {currentIndex + 1} / {totalPhotos}
            </div>
          )}

          {/* Photo Info Overlay (optional) */}
          {photo.title && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white p-4 rounded-lg backdrop-blur-sm max-w-md">
              <h3 className="font-semibold text-lg mb-1">{photo.title}</h3>
              {photo.description && (
                <p className="text-sm text-gray-200 line-clamp-2">{photo.description}</p>
              )}
              {photo.year && (
                <p className="text-xs text-gray-300 mt-1">{photo.year}</p>
              )}
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default PhotoViewer