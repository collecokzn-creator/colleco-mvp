import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

// Mock the useUser hook to avoid needing the full UserProvider in this unit test
vi.mock('../src/context/UserContext.jsx', () => ({
  useUser: () => ({ user: null, setUser: () => {} })
}));

import Login from '../src/pages/Login.jsx';

describe('Login prefill and invite banner', () => {
  it('prefills companyName and shows invite banner when query params present', () => {
    const url = '/login?tab=register&role=partner&companyName=Acme%20Tours&ref=partner-invite';
    render(
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

  // Company name input should be prefilled (query by displayed value)
  const companyInput = screen.getByDisplayValue('Acme Tours');
  expect(companyInput).toBeTruthy();

    // Invite banner text should be visible
    const banner = screen.getByText(/You were invited from/i);
    expect(banner).toBeTruthy();
    expect(banner.textContent).toContain('partner-invite');
  });
});
