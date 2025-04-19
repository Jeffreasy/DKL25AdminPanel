import React, { useState, useEffect, useCallback } from 'react';
import MainSlider from './MainSlider';
import ThumbnailSlider from './ThumbnailSlider';
import { usePhotoGallery } from './hooks/usePhotoGallery';
import type { Photo, Album } from './types';

// Interface for the combined public gallery data structure passed from the modal
export interface PublicAlbumPreview extends Omit<Album, 'cover_photo_id' | 'visible' | 'order_number' | 'created_at' | 'updated_at'> {
  photos: Photo[]; // Only visible photos, already ordered
}

interface PhotoGalleryPreviewProps {
  galleryData: PublicAlbumPreview[]; // Receive pre-fetched data
  onModalChange?: (isOpen: boolean) => void;
}

const PhotoGalleryPreview: React.FC<PhotoGalleryPreviewProps> = ({ 
  galleryData, 
  onModalChange 
}) => {
  // State to manage which album is currently selected
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Set the first album as selected by default when data is available
  useEffect(() => {
    if (galleryData.length > 0 && !selectedAlbumId) {
      setSelectedAlbumId(galleryData[0].id);
    }
  }, [galleryData, selectedAlbumId]);

  // Get the photos for the currently selected album
  const currentAlbumPhotos: Photo[] = React.useMemo(() => {
    if (!selectedAlbumId) return [];
    const selectedAlbum = galleryData.find(album => album.id === selectedAlbumId);
    return selectedAlbum?.photos || [];
  }, [selectedAlbumId, galleryData]);

  // Use the custom hook for gallery logic, passing the photos of the selected album
  const {
    currentIndex,
    isAnimating,
    handlePrevious,
    handleNext,
    setCurrentIndex
  } = usePhotoGallery(currentAlbumPhotos); // Pass the photos for the current album

  // Handler for album selection
  const handleAlbumSelect = (albumId: string) => {
    if (albumId !== selectedAlbumId) {
      setSelectedAlbumId(albumId);
      // setCurrentIndex(0); // This is handled inside the usePhotoGallery hook's useEffect
    }
  };

  // Notify parent component of modal state changes
  useEffect(() => {
    onModalChange?.(isModalOpen);
  }, [isModalOpen, onModalChange]);

   // Preload images function (simplified, can be expanded)
  const preloadImages = useCallback((urls: string[]) => {
    urls.forEach(url => {
      if (!url) return; // Skip if URL is null/undefined
      const img = new Image();
      img.src = url;
    });
  }, []);

  // Preload next image when current index changes
  useEffect(() => {
    if (!currentAlbumPhotos.length) return;
    const nextIndex = (currentIndex + 1) % currentAlbumPhotos.length;
    if (currentAlbumPhotos[nextIndex]?.url) {
       preloadImages([currentAlbumPhotos[nextIndex].url]);
    }
  }, [currentIndex, currentAlbumPhotos, preloadImages]);


  const renderContent = () => {
    if (!selectedAlbumId && galleryData.length > 0) {
      // If no album is selected yet, but data exists, prompt to select
      return <p className="text-gray-600 dark:text-gray-400 text-center py-8">Selecteer een album hierboven.</p>;
    }

    if (currentAlbumPhotos.length === 0 && selectedAlbumId) {
      return <p className="text-gray-600 dark:text-gray-400 text-center py-8">Geen foto's gevonden voor dit album.</p>;
    }
    
    if (currentAlbumPhotos.length === 0 && galleryData.length === 0) {
       return <p className="text-gray-600 dark:text-gray-400 text-center py-8">Geen albums of foto's beschikbaar voor preview.</p>;
    }

    return (
      <>
        <MainSlider
          photos={currentAlbumPhotos}
          currentIndex={currentIndex}
          onPrevious={handlePrevious}
          onNext={handleNext}
          isAnimating={isAnimating}
          onModalChange={setIsModalOpen} // Pass modal state handler
        />
        <ThumbnailSlider
          photos={currentAlbumPhotos}
          currentIndex={currentIndex}
          onSelect={setCurrentIndex} // Pass the function to set the index
        />
      </>
    );
  };

  return (
    <div className="font-sans"> {/* Use a generic font stack */}
      <div className="max-w-[1200px] mx-auto">
        {/* Album Selection Buttons */}
        {galleryData.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {galleryData.map((album) => (
              <button
                key={album.id}
                onClick={() => handleAlbumSelect(album.id)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 dark:focus:ring-offset-gray-800
                  ${selectedAlbumId === album.id
                    ? 'bg-indigo-600 text-white shadow-md' // Use project's primary color
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
                aria-current={selectedAlbumId === album.id ? 'page' : undefined}
              >
                {album.title}
              </button>
            ))}
          </div>
        )}

        {renderContent()}

      </div>
    </div>
  );
};

export default PhotoGalleryPreview; // Ensure there is an export statement 