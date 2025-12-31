import React, { useState } from 'react';
import { useFavorites } from '../../contexts/FavoritesContext';

const FavoriteButton = ({ 
  chef, 
  className = '', 
  size = 'medium',
  showText = false,
  variant = 'icon' // 'icon' | 'button' | 'card'
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Guard against undefined chef object
  if (!chef || !chef._id) {
    console.warn('FavoriteButton: chef prop is missing or invalid', chef);
    return null;
  }
  
  const isChefFavorited = isFavorite(chef._id);

  const handleToggleFavorite = () => {
    const wasAdded = toggleFavorite(chef);
    
    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Show user feedback
    if (wasAdded) {
      // You could replace this with a toast notification
    } else {
    }
  };

  // Size configurations
  const sizeConfig = {
    small: {
      icon: 'w-4 h-4',
      button: 'px-3 py-1.5 text-sm',
      text: 'text-sm'
    },
    medium: {
      icon: 'w-5 h-5',
      button: 'px-4 py-2 text-base',
      text: 'text-base'
    },
    large: {
      icon: 'w-6 h-6',
      button: 'px-6 py-3 text-lg',
      text: 'text-lg'
    }
  };

  const config = sizeConfig[size];

  // Icon variant (minimal)
  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggleFavorite}
        className={`
          relative transition-all duration-300 hover:scale-110 focus:outline-none
          min-h-[44px] min-w-[44px] flex items-center justify-center
          ${isAnimating ? 'animate-pulse' : ''}
          ${className}
        `}
        title={isChefFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg 
          className={`
            ${config.icon} transition-all duration-300
            ${isChefFavorited 
              ? 'text-red-500 fill-current' 
              : 'text-gray-400 hover:text-red-400'
            }
          `} 
          fill={isChefFavorited ? 'currentColor' : 'none'}
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
        {isAnimating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-red-200 animate-ping opacity-75"></div>
          </div>
        )}
      </button>
    );
  }

  // Button variant (with background)
  if (variant === 'button') {
    return (
      <button
        onClick={handleToggleFavorite}
        className={`
          ${config.button} rounded-xl font-semibold transition-all duration-300 
          flex items-center justify-center space-x-2
          ${isChefFavorited 
            ? 'bg-red-100 text-red-600 border border-red-200 hover:bg-red-200' 
            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
          }
          ${isAnimating ? 'scale-95' : 'hover:scale-105'}
          ${className}
        `}
      >
        <svg 
          className={`${config.icon} transition-all duration-300`} 
          fill={isChefFavorited ? 'currentColor' : 'none'}
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
        {showText && (
          <span className={config.text}>
            {isChefFavorited ? 'Favorited' : 'Add to Favorites'}
          </span>
        )}
      </button>
    );
  }

  // Card variant (for chef cards)
  if (variant === 'card') {
    return (
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
        <button
          onClick={handleToggleFavorite}
          className={`
            p-2.5 sm:p-2 rounded-full backdrop-blur-sm transition-all duration-300
            min-h-[44px] min-w-[44px] flex items-center justify-center
            ${isChefFavorited 
              ? 'bg-red-500 text-white shadow-lg' 
              : 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-500'
            }
            ${isAnimating ? 'scale-90' : 'hover:scale-110'}
            ${className}
          `}
          title={isChefFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg 
            className={`${config.icon} transition-all duration-300`} 
            fill={isChefFavorited ? 'currentColor' : 'none'}
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
        </button>
      </div>
    );
  }

  return null;
};

export default FavoriteButton;

