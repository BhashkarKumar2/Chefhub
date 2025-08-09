import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('chefFavorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
  }, []);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem('chefFavorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, [favorites]);

  // Add chef to favorites
  const addToFavorites = (chef) => {
    setFavorites(prev => {
      // Check if chef is already in favorites
      if (prev.some(fav => fav._id === chef._id)) {
        return prev; // Already in favorites
      }
      
      // Add chef with timestamp
      const favoriteChef = {
        ...chef,
        favoriteId: `fav_${Date.now()}_${chef._id}`,
        dateAdded: new Date().toISOString()
      };
      
      return [...prev, favoriteChef];
    });
  };

  // Remove chef from favorites
  const removeFromFavorites = (chefId) => {
    setFavorites(prev => prev.filter(chef => chef._id !== chefId));
  };

  // Check if chef is in favorites
  const isFavorite = (chefId) => {
    return favorites.some(chef => chef._id === chefId);
  };

  // Toggle favorite status
  const toggleFavorite = (chef) => {
    if (isFavorite(chef._id)) {
      removeFromFavorites(chef._id);
      return false; // Removed from favorites
    } else {
      addToFavorites(chef);
      return true; // Added to favorites
    }
  };

  // Get favorite count
  const getFavoriteCount = () => favorites.length;

  // Clear all favorites
  const clearAllFavorites = () => {
    setFavorites([]);
  };

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    getFavoriteCount,
    clearAllFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
