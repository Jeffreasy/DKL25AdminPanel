import { useState, useCallback } from 'react';

interface SwipeConfig {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number; // Minimum distance in pixels to trigger a swipe
}

export const useSwipe = ({ onSwipeLeft, onSwipeRight, threshold = 50 }: SwipeConfig) => {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null); // Reset end X on new touch
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartX) return;
    setTouchEndX(e.targetTouches[0].clientX);
  }, [touchStartX]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartX || !touchEndX) {
      // If there was no movement or start/end points are missing, do nothing.
      setTouchStartX(null);
      setTouchEndX(null);
      return;
    }

    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe) {
      onSwipeLeft();
    } else if (isRightSwipe) {
      onSwipeRight();
    }

    // Reset touch points
    setTouchStartX(null);
    setTouchEndX(null);
  }, [touchStartX, touchEndX, threshold, onSwipeLeft, onSwipeRight]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}; 