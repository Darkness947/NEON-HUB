import { createContext, useState, useEffect, useCallback } from 'react';
import libraryService from '../services/libraryService';
import { useAuth } from '../hooks/useAuth';

export const LibraryContext = createContext(null);

export const LibraryProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // Full ID lists for isInLibrary / getStatus checks (covers entire library)
  const [movieIds, setMovieIds] = useState([]);
  const [seriesIds, setSeriesIds] = useState([]);
  const [gameIds, setGameIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasIdsError, setHasIdsError] = useState(false);

  const fetchLibraryIds = useCallback(async () => {
    if (!isAuthenticated) {
      setMovieIds([]);
      setSeriesIds([]);
      setGameIds([]);
      setIsLoading(false);
      setHasIdsError(false);
      return;
    }

    try {
      setIsLoading(true);
      setHasIdsError(false);
      const ids = await libraryService.getLibraryIds();
      setMovieIds(ids.movies || []);
      setSeriesIds(ids.series || []);
      setGameIds(ids.games || []);
    } catch (err) {
      console.error('Failed to load library IDs:', err);
      setHasIdsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchLibraryIds();
  }, [fetchLibraryIds]);

  const addToLibrary = async (mediaType, mediaId, status = 'planned') => {
    const numericId = Number(mediaId);
    const newItem = await libraryService.addToLibrary(mediaType, numericId, status);
    // Update the local ID lists so isInLibrary works immediately
    if (mediaType === 'movie') setMovieIds(prev => [{ tmdb_id: numericId, status, rating: null, favorite: false }, ...prev]);
    else if (mediaType === 'series') setSeriesIds(prev => [{ tmdb_id: numericId, status, rating: null, favorite: false }, ...prev]);
    else if (mediaType === 'game') setGameIds(prev => [{ rawg_id: numericId, status, rating: null, favorite: false }, ...prev]);
    return newItem;
  };

  const removeFromLibrary = async (mediaType, mediaId) => {
    const numericId = Number(mediaId);
    await libraryService.removeFromLibrary(mediaType, numericId);
    if (mediaType === 'movie') setMovieIds(prev => prev.filter(m => m.tmdb_id !== numericId));
    else if (mediaType === 'series') setSeriesIds(prev => prev.filter(s => s.tmdb_id !== numericId));
    else if (mediaType === 'game') setGameIds(prev => prev.filter(g => g.rawg_id !== numericId));
  };

  const updateItem = async (mediaType, mediaId, fields) => {
    const numericId = Number(mediaId);
    const updated = await libraryService.updateLibraryItem(mediaType, numericId, fields);
    const updateList = (list, idField) => list.map(item =>
      item[idField] === numericId ? { ...item, ...fields } : item
    );

    if (mediaType === 'movie') setMovieIds(prev => updateList(prev, 'tmdb_id'));
    else if (mediaType === 'series') setSeriesIds(prev => updateList(prev, 'tmdb_id'));
    else if (mediaType === 'game') setGameIds(prev => updateList(prev, 'rawg_id'));
    return updated;
  };

  const toggleFavorite = async (mediaType, mediaId) => {
    const numericId = Number(mediaId);
    const item = isInLibrary(mediaType, numericId);
    if (!item) return;
    await updateItem(mediaType, numericId, { favorite: !item.favorite });
  };

  const isInLibrary = (mediaType, mediaId) => {
    const numericId = Number(mediaId);
    if (mediaType === 'movie') return movieIds.find(m => m.tmdb_id === numericId) || null;
    if (mediaType === 'series') return seriesIds.find(s => s.tmdb_id === numericId) || null;
    if (mediaType === 'game') return gameIds.find(g => g.rawg_id === numericId) || null;
    return null;
  };

  const getStatus = (mediaType, mediaId) => {
    const item = isInLibrary(mediaType, mediaId);
    return item ? item.status : null;
  };

  return (
    <LibraryContext.Provider value={{
      movies: movieIds, series: seriesIds, games: gameIds, isLoading, hasIdsError,
      addToLibrary, removeFromLibrary, updateItem, toggleFavorite,
      isInLibrary, getStatus, refreshLibrary: fetchLibraryIds
    }}>
      {children}
    </LibraryContext.Provider>
  );
};
