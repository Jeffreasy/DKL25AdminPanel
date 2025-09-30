import { useState, useEffect, useCallback } from 'react';
import type { Photo } from '../types'; // Assuming types are in ../types

interface GalleryState {
  currentIndex: number;
  isAnimating: boolean;
  isAutoPlaying: boolean;
  touchStart: number | null;
}

export const usePhotoGallery = (photos: Photo[]) => {
  // State management met een enkele state object voor betere performance
  const [state, setState] = useState<GalleryState>(() => ({
    currentIndex: 0,
    isAnimating: false,
    isAutoPlaying: false,
    touchStart: null
  }));

  // Effect to reset index if photos array changes (e.g., album switch)
  useEffect(() => {
    setState(prev => ({ ...prev, currentIndex: 0, isAnimating: false }));
  }, [photos]);

  // Memoized handlers
  const setCurrentIndex = useCallback((index: number) => {
    if (index >= 0 && index < photos.length) {
      setState(prev => ({ ...prev, currentIndex: index }));
    }
  }, [photos.length]);

  const setIsAutoPlaying = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setState(prev => ({
      ...prev,
      isAutoPlaying: typeof value === 'function' ? value(prev.isAutoPlaying) : value
    }));
  }, []);

  const handleTransition = useCallback((direction: 'next' | 'previous') => {
    if (photos.length === 0) return; // Prevent action if no photos

    setState(prev => {
        const newIndex = direction === 'next'
        ? (prev.currentIndex + 1) % photos.length
        : prev.currentIndex === 0
          ? photos.length - 1
          : prev.currentIndex - 1;

      return {
        ...prev,
        currentIndex: newIndex,
        isAnimating: true
      };
    });

    // Reset animation state after transition
    const timer = setTimeout(() => {
      setState(prev => ({ ...prev, isAnimating: false }));
    }, 500);

    return () => clearTimeout(timer); // Cleanup timer on unmount or re-run

  }, [photos.length]);

  const handleNext = useCallback(() => {
    handleTransition('next');
  }, [handleTransition]);

  const handlePrevious = useCallback(() => {
    handleTransition('previous');
  }, [handleTransition]);

  // Touch handlers
  const setTouchStart = useCallback((value: number | null) => {
    setState(prev => ({ ...prev, touchStart: value }));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (photos.length === 0) return; // Ignore if no photos

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case ' ':
          e.preventDefault();
          setIsAutoPlaying(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious, setIsAutoPlaying, photos.length]); // Add photos.length dependency

  // Auto-play
  useEffect(() => {
    if (!state.isAutoPlaying || photos.length === 0) return; // Stop if not playing or no photos

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [state.isAutoPlaying, handleNext, photos.length]); // Add photos.length dependency

  return {
    currentIndex: state.currentIndex,
    isAnimating: state.isAnimating,
    isAutoPlaying: state.isAutoPlaying,
    touchStart: state.touchStart,
    setCurrentIndex,
    setIsAutoPlaying,
    handlePrevious,
    handleNext,
    setTouchStart,
  };
}; 