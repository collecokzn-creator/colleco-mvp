import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';

// Mock api client to control returned quotes
vi.mock('../src/api/quotes', () => ({
  getQuotes: async () => [],
  createQuote: async () => ({}),
  deleteQuote: async () => true,
  updateQuote: async () => null,
  patchQuote: async () => null,
}));

// Mock useNavigate from react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import Quotes from '../src/pages/Quotes';

describe('Quotes page', () => {
  it('renders empty state and New Quote navigates', async () => {
    render(<MemoryRouter><Quotes /></MemoryRouter>);
    const nod = await screen.findByText(/No quotes yet/i);
    expect(nod).not.toBeNull();
    const btn = screen.getByRole('button', { name: /New Quote/i });
    fireEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalledWith('/quote/new');
  });
});
