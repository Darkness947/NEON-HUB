import { useContext } from 'react';
import { LibraryContext } from '../context/LibraryContext';

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used inside LibraryProvider');
  return ctx;
};
