import React from 'react';
import { cc } from '../../../../styles/shared';

interface NavigationButtonProps {
  direction: 'previous' | 'next';
  onClick: () => void;
  disabled?: boolean;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({ direction, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 text-black dark:text-white rounded-full shadow-md p-2 ${cc.transition.normal}`}
      aria-label={direction === 'previous' ? 'Vorige foto' : 'Volgende foto'}
    >
      {/* Simple SVG arrows for now */}
      {direction === 'previous' ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
           <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
           <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      )}
    </button>
  );
};

export default React.memo(NavigationButton); 