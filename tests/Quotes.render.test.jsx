import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockPdf = vi.fn();
vi.mock('../src/utils/pdfGenerators', () => ({ generateQuotePdf: (q) => mockPdf(q) }));
vi.mock('../src/api/quotes', () => ({
  getQuotes: async () => ([ { id: 'q1', clientName: 'A', items: [], currency: 'USD', status: 'Draft', updatedAt: new Date().toISOString() } ]),
  createQuote: async () => ({}),
  deleteQuote: async () => true
}));

import Quotes from '../src/pages/Quotes';

describe('Quotes render', () => {
  it('renders a quote item and buttons', async () => {
    render(<MemoryRouter><Quotes /></MemoryRouter>);
  // wait for async getQuotes to resolve
  // match the client name exactly to avoid accidental matches elsewhere in the DOM
  const item = await screen.findByText(/^A$/);
    expect(item).toBeTruthy();
    const pdfBtn = await screen.findByRole('button', { name: /PDF/i });
    fireEvent.click(pdfBtn);
    expect(mockPdf).toHaveBeenCalled();
  });
});
