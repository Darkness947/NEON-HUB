import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Library from '../../pages/library/Library';
import historyService from '../../services/historyService';
import libraryService from '../../services/libraryService';

vi.mock('../../hooks/useLibrary', () => ({
  useLibrary: () => ({
    movies: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // 10 movies
    series: [11, 12, 13], // 3 series
    games: [21, 22], // 2 games
    isInLibrary: () => false,
    hasIdsError: false,
  })
}));

vi.mock('../../components/library/RecentlyViewed', () => ({
  default: () => <div data-testid="recently-viewed-component">Recently Viewed Component</div>
}));

describe('TC-LIB-001 & TC-LIB-002: Library Tab Counts & Navigation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should display counts for Recently Viewed and all media tabs on mount', async () => {
    vi.spyOn(historyService, 'getHistoryCount').mockResolvedValue(5);
    vi.spyOn(libraryService, 'getLibrary').mockResolvedValue({
      items: [],
      total: 10,
      hasMore: false
    });

    render(
      <MemoryRouter>
        <Library />
      </MemoryRouter>
    );

    // Initial mount fetches getHistoryCount
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Recently Viewed \(5\)/i })).toBeInTheDocument();
    });

    // Verify other tabs display context counts
    expect(screen.getByRole('button', { name: /Movies \(10\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /TV Series \(3\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Games \(2\)/i })).toBeInTheDocument();
  });

  it('should not call libraryService.getLibrary with type "recent" when navigating to Recently Viewed tab', async () => {
    vi.spyOn(historyService, 'getHistoryCount').mockResolvedValue(3);
    const getLibrarySpy = vi.spyOn(libraryService, 'getLibrary').mockResolvedValue({
      items: [],
      total: 0,
      hasMore: false
    });

    render(
      <MemoryRouter>
        <Library />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Recently Viewed/i })).toBeInTheDocument();
    });

    // Click Recently Viewed Tab
    const recentTabBtn = screen.getByRole('button', { name: /Recently Viewed/i });
    fireEvent.click(recentTabBtn);

    // Verify RecentlyViewed component rendered
    await waitFor(() => {
      expect(screen.getByTestId('recently-viewed-component')).toBeInTheDocument();
    });

    // Verify libraryService.getLibrary was never called with 'recent'
    const recentCalls = getLibrarySpy.mock.calls.filter((call) => call[0] === 'recent');
    expect(recentCalls.length).toBe(0);
  });
});
