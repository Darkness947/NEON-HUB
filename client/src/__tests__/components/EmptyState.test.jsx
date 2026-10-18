import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';

describe('TC-UI-001: EmptyState Component', () => {
  it('should render icon, title, message, and action link correctly', () => {
    render(
      <MemoryRouter>
        <EmptyState
          icon="📚"
          title="Your Library is Empty"
          message="Start discovering movies and series to add."
          actionText="Start Exploring"
          actionLink="/discover"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('📚')).toBeInTheDocument();
    expect(screen.getByText('Your Library is Empty')).toBeInTheDocument();
    expect(screen.getByText('Start discovering movies and series to add.')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'Start Exploring' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/discover');
  });

  it('should use default icon when none is provided', () => {
    render(
      <MemoryRouter>
        <EmptyState title="No items" message="Nothing here." />
      </MemoryRouter>
    );

    expect(screen.getByText('📭')).toBeInTheDocument();
    expect(screen.getByText('No items')).toBeInTheDocument();
  });
});
