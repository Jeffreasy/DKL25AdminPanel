import React from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Photo } from './types';
import NavigationButton from './NavigationButton';
import { Z_INDEX } from '../../../../constants/zIndex';

interface ImageModalProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  totalPhotos: number;
  currentIndex: number;
}

const ImageModal: React.FC<ImageModalProps> = ({ 
  photo, 
  isOpen, 
  onClose, 
  onNext, 
  onPrevious,
  totalPhotos,
  currentIndex
}) => {
  if (!isOpen || !photo) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className={`relative z-[${Z_INDEX.PREVIEW_MODAL + 10}]`}> {/* Ensure higher z-index */}
      {/* Backdrop */}
      <div className={`fixed inset-0 bg-black/70 z-[${Z_INDEX.PREVIEW_MODAL + 10}]`} aria-hidden="true" />

      {/* Full-screen container */}
      <div className={`fixed inset-0 flex items-center justify-center p-4 z-[${Z_INDEX.PREVIEW_MODAL + 10}]`}>
        <Dialog.Panel className="relative flex items-center justify-center w-full h-full">
          {/* Image Display */}
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            <img 
              src={photo.url} 
              alt={photo.alt_text || photo.title || 'Volledige weergave'} 
              className="block max-w-full max-h-[90vh] object-contain"
            />
          </div>

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Sluiten"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          {/* Navigation Buttons */}
          {totalPhotos > 1 && (
            <>
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <NavigationButton direction="previous" onClick={onPrevious} />
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <NavigationButton direction="next" onClick={onNext} />
              </div>
            </>
          )}

           {/* Counter */}
            {totalPhotos > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {currentIndex + 1} / {totalPhotos}
              </div>
            )}

        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ImageModal; 