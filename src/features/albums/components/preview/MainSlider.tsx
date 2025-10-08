import React, { useEffect, useRef, useState } from 'react';
import type { Photo } from '../../../photos/types';
import NavigationButton from './NavigationButton';
import ImageModal from './ImageModal';
import { useSwipe } from './hooks/useSwipe';
import { cc } from '../../../../styles/shared';

interface MainSliderProps {
  photos: Photo[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  isAnimating: boolean;
  onModalChange?: (isOpen: boolean) => void;
}

const MainSlider: React.FC<MainSliderProps> = ({
  photos,
  currentIndex,
  onPrevious,
  onNext,
  isAnimating,
  onModalChange
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const [isGrabbing, setIsGrabbing] = useState(false);

  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious,
    threshold: 50
  });

  useEffect(() => {
    onModalChange?.(isModalOpen);
  }, [isModalOpen, onModalChange]);

  const handleMouseDown = () => setIsGrabbing(true);
  const handleMouseUp = () => setIsGrabbing(false);
  const handleMouseLeave = () => setIsGrabbing(false);

  const handleImageLoad = (url: string) => {
    setImageLoaded(prev => ({ ...prev, [url]: true }));
  };

  const currentPhoto = photos[currentIndex];
  if (!currentPhoto) return null;

  return (
    <>
      <div
        ref={containerRef}
        className={`
          relative aspect-[16/9] mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800
          group shadow-lg ${isGrabbing ? 'cursor-grabbing' : 'cursor-grab'}
          hover:shadow-xl ${cc.transition.shadow} touch-pan-y
        `}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsModalOpen(true)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        role="button"
        aria-label="Open foto in volledig scherm of swipe om te navigeren"
        tabIndex={0}
      >
        {photos.map((photo, index) => {
          const isVisible = index === currentIndex;
          const isPrevious = index === (currentIndex === 0 ? photos.length - 1 : currentIndex - 1);
          const isNext = index === (currentIndex + 1) % photos.length;
          const shouldRender = isVisible || (photos.length > 1 && (isPrevious || isNext));

          if (!shouldRender || !photo?.url || !photo?.id) return null;

          return (
            <div
              key={photo.id}
              className={`
                absolute inset-0
                transition-all ease-out
                ${index === currentIndex
                  ? 'opacity-100 visible transform-none'
                  : index < currentIndex || (currentIndex === 0 && index === photos.length - 1)
                    ? 'opacity-0 invisible -translate-x-full'
                    : 'opacity-0 invisible translate-x-full'
                }
              `}
              style={{
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden'
              }}
            >
              {!imageLoaded[photo.url] && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
              )}
              <img
                src={photo.url}
                alt={photo.alt_text || ''}
                className={`
                  w-full h-full object-cover
                  ${cc.transition.opacity}
                  ${!imageLoaded[photo.url] ? 'opacity-0' : 'opacity-100'}
                `}
                loading="lazy"
                onLoad={() => handleImageLoad(photo.url)}
                style={{
                  transform: `translate3d(0, 0, 0)`
                }}
                draggable="false"
              />
            </div>
          );
        })}

        <div
          className={`absolute inset-0 ${cc.overlay.gradient.full} ${cc.hover.fadeIn} pointer-events-none`}
          style={{ willChange: 'opacity' }}
        />

        {photos.length > 1 && (
            <div
                className={`absolute inset-x-4 top-1/2 -translate-y-1/2 flex items-center justify-between ${cc.hover.fadeIn}`}
                onClick={(e) => e.stopPropagation()}
            >
                <NavigationButton
                    direction="previous"
                    onClick={onPrevious}
                    disabled={isAnimating}
                />
                <NavigationButton
                    direction="next"
                    onClick={onNext}
                    disabled={isAnimating}
                />
            </div>
        )}

        {photos.length > 1 && (
          <div
            className="absolute bottom-3 left-3 bg-black/60 text-white px-2.5 py-1 rounded-full text-xs font-medium pointer-events-none"
          >
            {currentIndex + 1} / {photos.length}
          </div>
        )}

        <div className={`absolute top-3 right-3 bg-black/60 dark:bg-black/70 text-white p-1.5 rounded-full ${cc.hover.fadeIn} pointer-events-none`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </div>
      </div>

      <ImageModal
        photo={currentPhoto}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNext={onNext}
        onPrevious={onPrevious}
        totalPhotos={photos.length}
        currentIndex={currentIndex}
      />
    </>
  );
};

export default React.memo(MainSlider); 