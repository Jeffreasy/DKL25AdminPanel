import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import type { Photo } from '../../../photos/types';
import debounce from 'lodash/debounce';
import { cc } from '../../../../styles/shared';

interface ThumbnailSliderProps {
  photos: Photo[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

const THUMBNAIL_WIDTH = 96; // w-24 (96px)

const ThumbnailSlider: React.FC<ThumbnailSliderProps> = ({ 
  photos, 
  currentIndex, 
  onSelect 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  // State to detect touch device
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Check for touch support on mount
  useEffect(() => {
    // Using navigator.maxTouchPoints is a more modern check
    if (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
    }
    // Alternative check (less reliable but broader compatibility):
    // else if ('ontouchstart' in window) { 
    //   setIsTouchDevice(true);
    // }
  }, []);

  // Debounced version of updateArrowVisibility
  const debouncedUpdateArrows = useMemo(() =>
    debounce(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 5); // Small margin
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5); // Small margin
    }, 150), // Debounce with 150ms
  []); // Empty dependency array

  // Use the debounced function in the effects
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    // Call directly on mount
    debouncedUpdateArrows();

    scrollElement.addEventListener('scroll', debouncedUpdateArrows);
    window.addEventListener('resize', debouncedUpdateArrows);

    return () => {
      scrollElement.removeEventListener('scroll', debouncedUpdateArrows);
      window.removeEventListener('resize', debouncedUpdateArrows);
      debouncedUpdateArrows.cancel(); // Cancel debounce on unmount
    };
  }, [debouncedUpdateArrows]);

  const scrollToThumbnail = useCallback((index: number) => {
    if (!scrollRef.current) return;

    const scrollContainer = scrollRef.current;
    const thumbnail = scrollContainer.children[index] as HTMLElement;
    if (!thumbnail) return;

    const containerWidth = scrollContainer.clientWidth;
    const thumbnailLeft = thumbnail.offsetLeft;
    const thumbnailWidth = thumbnail.offsetWidth;

    // Calculate the center position
    const targetScroll = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2);

    scrollContainer.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }, []);

  // Scroll to current thumbnail
  useEffect(() => {
    scrollToThumbnail(currentIndex);
  }, [currentIndex, scrollToThumbnail]);

  // Drag to scroll functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isTouchDevice) return; // Prevent mouse drag on touch devices
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2; // Multiplier for faster scrolling
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    if (isDragging) {
        setIsDragging(false);
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === 'left' ? -THUMBNAIL_WIDTH * 3 : THUMBNAIL_WIDTH * 3;
    scrollRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  // --- Conditional rendering for arrows --- 
  const renderLeftArrow = !isTouchDevice && showLeftArrow;
  const renderRightArrow = !isTouchDevice && showRightArrow;

  return (
    <div className="relative px-12 select-none"> {/* Added padding for arrows */}
      {/* Scroll Buttons - Conditionally rendered */}
      {renderLeftArrow && (
        <button
          onClick={() => handleScroll('left')}
          className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 ${cc.transition.normal} z-10`}
          aria-label="Scroll thumbnails left"
        >
          {/* SVG Left Arrow */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-700">
             <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}

      <div
        ref={scrollRef}
        className={`
          flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-2
          ${isDragging ? 'cursor-grabbing' : (isTouchDevice ? '' : 'cursor-grab')} /* Adjust cursor based on device */
        `}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Also end drag on leave
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch' // For iOS momentum scrolling
        }}
      >
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => {
              onSelect(index);
              // scrollToThumbnail(index); // Scroll happens via useEffect [currentIndex]
            }}
            className={`
              flex-none w-24 h-16 rounded-lg overflow-hidden
              ${cc.transition.normal}
              ${index === currentIndex
                ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 scale-105 shadow-lg opacity-100'
                : 'ring-1 ring-gray-200 dark:ring-gray-700 opacity-60 hover:opacity-80'
              }
              snap-center focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 dark:focus:ring-offset-gray-800
            `}
            aria-label={`Selecteer foto ${index + 1}`}
            aria-current={index === currentIndex}
          >
            <img
              src={photo.thumbnail_url || photo.url}
              alt={photo.alt_text || `Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
              draggable={false} // Prevent default image drag
            />
          </button>
        ))}
      </div>

      {renderRightArrow && (
        <button
          onClick={() => handleScroll('right')}
          className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 ${cc.transition.normal} z-10`}
          aria-label="Scroll thumbnails right"
        >
           {/* SVG Right Arrow */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-700">
             <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default React.memo(ThumbnailSlider); 