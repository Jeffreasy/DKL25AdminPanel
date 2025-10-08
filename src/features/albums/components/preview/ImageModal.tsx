import React from 'react';
import type { Photo } from '../../../photos/types';
import { PhotoViewer } from '../../../photos/components/PhotoViewer';
import { Z_INDEX } from '../../../../config/zIndex';

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
    <PhotoViewer
      photo={photo}
      isOpen={isOpen}
      onClose={onClose}
      onNext={onNext}
      onPrevious={onPrevious}
      currentIndex={currentIndex}
      totalPhotos={totalPhotos}
      showNavigation={true}
      zIndex={Z_INDEX.PREVIEW_MODAL + 10}
    />
  );
};

export default ImageModal;