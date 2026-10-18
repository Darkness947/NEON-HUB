import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyRatings from '../../pages/profile/MyRatings';
import libraryService from '../../services/libraryService';
import i18n from '../../i18n';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'testuser' },
    isAuthenticated: true,
  })
}));

vi.mock('../../components/media/ReviewCard', () => ({
  default: ({ review }) => <div data-testid="review-card">{review.title}</div>
}));

describe('TC-RATE-001 & TC-RATE-003: MyRatings Page Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    i18n.changeLanguage('en');
  });

  it('should render "Load More (1 of 25)" with proper wording and progress', async () => {
    vi.spyOn(libraryService, 'getRatings').mockResolvedValue({
      items: [{ id: 101, title: 'Inception', rating: 9, media_type: 'movie' }],
      total: 25,
      hasMore: true
    });

    render(
      <MemoryRouter>
        <MyRatings />
      </MemoryRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('review-card')).toBeInTheDocument();
    });

    // Check pagination button wording
    const loadMoreBtn = screen.getByRole('button', { name: /Load More/i });
    expect(loadMoreBtn).toBeInTheDocument();
    expect(loadMoreBtn.textContent).toBe('Load More (1 of 25)');
    expect(loadMoreBtn.textContent).not.toContain('common.loadMore');
  });

  it('should render Arabic localized wording when language is ar', async () => {
    await i18n.changeLanguage('ar');

    vi.spyOn(libraryService, 'getRatings').mockResolvedValue({
      items: [{ id: 101, title: 'Inception', rating: 9, media_type: 'movie' }],
      total: 25,
      hasMore: true
    });

    render(
      <MemoryRouter>
        <MyRatings />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('review-card')).toBeInTheDocument();
    });

    const loadMoreBtn = screen.getByRole('button', { name: /تحميل المزيد/i });
    expect(loadMoreBtn).toBeInTheDocument();
    expect(loadMoreBtn.textContent).toBe('تحميل المزيد (1 من 25)');
  });
});
