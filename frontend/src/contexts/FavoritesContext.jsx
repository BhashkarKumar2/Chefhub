import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const updateLocalStorage = useCallback((newFavorites) => {
    try {
      localStorage.setItem('chefFavorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  }, []);

  const loadFavoritesFromStorage = useCallback(() => {
    try {
      const savedFavorites = localStorage.getItem('chefFavorites');
      setFavorites(savedFavorites ? JSON.parse(savedFavorites) : []);
    } catch (error) {
      console.error('Error loading favorites from storage:', error);
    }
  }, []);

  const fetchFavoritesFromBackend = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/favorites');
      setFavorites(res.data.favorites || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      // Fallback to local storage if API fails
      loadFavoritesFromStorage();
    } finally {
      setLoading(false);
    }
  }, [loadFavoritesFromStorage]);

  // Sync with backend when authenticated, or load from localStorage when not
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavoritesFromBackend();
    } else {
      loadFavoritesFromStorage();
    }
  }, [isAuthenticated, fetchFavoritesFromBackend, loadFavoritesFromStorage]);

  // Add chef to favorites. Uses functional state updates so the callback
  // identity stays stable across favorite changes.
  const addToFavorites = useCallback(async (chef) => {
    const newFavorite = { ...chef, dateAdded: new Date().toISOString() };

    let alreadyPresent = false;
    setFavorites(prev => {
      if (prev.some(fav => fav._id === chef._id)) {
        alreadyPresent = true;
        return prev;
      }
      const next = [...prev, newFavorite];
      if (!isAuthenticated) updateLocalStorage(next);
      return next;
    });
    if (alreadyPresent) return;

    if (isAuthenticated) {
      try {
        await api.post(`/user/favorites/${chef._id}`);
      } catch (error) {
        console.error('Error adding favorite to backend:', error);
        toast.error('Failed to save favorite to account');
        // Revert optimistic update
        setFavorites(prev => prev.filter(f => f._id !== chef._id));
      }
    }
  }, [isAuthenticated, updateLocalStorage]);

  // Remove chef from favorites
  const removeFromFavorites = useCallback(async (chefId) => {
    let previousFavorites = [];
    setFavorites(prev => {
      previousFavorites = prev;
      const next = prev.filter(chef => chef._id !== chefId);
      if (!isAuthenticated) updateLocalStorage(next);
      return next;
    });

    if (isAuthenticated) {
      try {
        await api.delete(`/user/favorites/${chefId}`);
      } catch (error) {
        console.error('Error removing favorite from backend:', error);
        toast.error('Failed to remove favorite from account');
        // Revert optimistic update
        setFavorites(previousFavorites);
      }
    }
  }, [isAuthenticated, updateLocalStorage]);

  // Check if chef is in favorites
  const isFavorite = useCallback((chefId) => {
    return favorites.some(chef => chef._id === chefId);
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback((chef) => {
    if (favorites.some(f => f._id === chef._id)) {
      removeFromFavorites(chef._id);
      return false; // Removed
    }
    addToFavorites(chef);
    return true; // Added
  }, [favorites, addToFavorites, removeFromFavorites]);

  const getFavoriteCount = useCallback(() => favorites.length, [favorites]);

  const clearAllFavorites = useCallback(() => {
    setFavorites([]);
    if (!isAuthenticated) {
      localStorage.removeItem('chefFavorites');
    }
  }, [isAuthenticated]);

  const value = useMemo(() => ({
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    getFavoriteCount,
    clearAllFavorites,
    loading
  }), [favorites, addToFavorites, removeFromFavorites, isFavorite, toggleFavorite, getFavoriteCount, clearAllFavorites, loading]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
