import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MediaCard from '../../components/media/MediaCard';

vi.mock('../../hooks/useLibrary', () => ({
  useLibrary: () => ({
    isInLibrary: () => null,
    addToLibrary: vi.fn(),
    removeFromLibrary: vi.fn(),
    toggleFavorite: vi.fn(),
  })
}));

describe('TC-UI-002 & TC-UI-003: MediaCard Component', () => {
  it('should render rating badge formatted to 1 decimal place', () => {
    render(
      <MemoryRouter>
        <MediaCard
          id={550}
          title="Fight Club"
          vote_average={8.432}
          release_date="1999-10-15"
          media_type="movie"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('★ 8.4')).toBeInTheDocument();
    expect(screen.getByText('1999')).toBeInTheDocument();
  });

  it('should truncate titles longer than 35 characters', () => {
    const longTitle = 'The Lord of the Rings: The Fellowship of the Ring Special Extended Edition';
    render(
      <MemoryRouter>
        <MediaCard
          id={120}
          title={longTitle}
          vote_average={8.8}
          release_date="2001-12-19"
          media_type="movie"
        />
      </MemoryRouter>
    );

    // truncateText(title, 35) takes first 35 chars, trims, and appends '...'
    const expectedTitle = longTitle.substring(0, 35).trim() + '...';
    expect(screen.getByText(expectedTitle)).toBeInTheDocument();
  });

  it('should render NR when vote_average is missing', () => {
    render(
      <MemoryRouter>
        <MediaCard
          id={999}
          title="Unreleased Movie"
          vote_average={null}
          media_type="movie"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('★ NR')).toBeInTheDocument();
  });
});
