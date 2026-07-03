import { createContext, useState, useEffect, useCallback } from 'react';
import libraryService from '../services/libraryService';
import { useAuth } from '../hooks/useAuth';

export const LibraryContext = createContext(null);

export const LibraryProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLibrary = useCallback(async () => {
    if (!isAuthenticated) {
      setMovies([]);
      setSeries([]);
      setGames([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Fetch enough items to populate context state for isInLibrary checks
      // In a real huge app, we might use a lighter endpoint or pagination
      const m = await libraryService.getLibrary('movies', '', 1);
      const s = await libraryService.getLibrary('series', '', 1);
      const g = await libraryService.getLibrary('games', '', 1);
      
      setMovies(m.items);
      setSeries(s.items);
      setGames(g.items);
    } catch (err) {
      console.error('Failed to load library:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const addToLibrary = async (mediaType, mediaId, status = 'planned') => {
    const numericId = Number(mediaId);
    const newItem = await libraryService.addToLibrary(mediaType, numericId, status);
    if (mediaType === 'movie') setMovies(prev => [newItem, ...prev]);
    else if (mediaType === 'series') setSeries(prev => [newItem, ...prev]);
    else if (mediaType === 'game') setGames(prev => [newItem, ...prev]);
    return newItem;
  };

  const removeFromLibrary = async (mediaType, mediaId) => {
    const numericId = Number(mediaId);
    await libraryService.removeFromLibrary(mediaType, numericId);
    if (mediaType === 'movie') setMovies(prev => prev.filter(m => m.tmdb_id !== numericId));
    else if (mediaType === 'series') setSeries(prev => prev.filter(s => s.tmdb_id !== numericId));
    else if (mediaType === 'game') setGames(prev => prev.filter(g => g.rawg_id !== numericId));
  };

  const updateItem = async (mediaType, mediaId, fields) => {
    const numericId = Number(mediaId);
    const updated = await libraryService.updateLibraryItem(mediaType, numericId, fields);
    const updateList = (list) => list.map(item => {
      const idField = mediaType === 'game' ? 'rawg_id' : 'tmdb_id';
      return item[idField] === numericId ? { ...item, ...updated } : item;
    });

    if (mediaType === 'movie') setMovies(prev => updateList(prev));
    else if (mediaType === 'series') setSeries(prev => updateList(prev));
    else if (mediaType === 'game') setGames(prev => updateList(prev));
  };

  const toggleFavorite = async (mediaType, mediaId) => {
    const numericId = Number(mediaId);
    const item = isInLibrary(mediaType, numericId);
    if (!item) return;
    await updateItem(mediaType, numericId, { favorite: !item.favorite });
  };

  const isInLibrary = (mediaType, mediaId) => {
    const idField = mediaType === 'game' ? 'rawg_id' : 'tmdb_id';
    const numericId = Number(mediaId);
    if (mediaType === 'movie') return movies.find(m => m[idField] === numericId) || null;
    if (mediaType === 'series') return series.find(s => s[idField] === numericId) || null;
    if (mediaType === 'game') return games.find(g => g[idField] === numericId) || null;
    return null;
  };

  const getStatus = (mediaType, mediaId) => {
    const item = isInLibrary(mediaType, mediaId);
    return item ? item.status : null;
  };

  return (
    <LibraryContext.Provider value={{
      movies, series, games, isLoading,
      addToLibrary, removeFromLibrary, updateItem, toggleFavorite,
      isInLibrary, getStatus, refreshLibrary: fetchLibrary
    }}>
      {children}
    </LibraryContext.Provider>
  );
};
