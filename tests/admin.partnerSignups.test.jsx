import React from 'react';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import AdminPartnerSignups from '../src/pages/AdminPartnerSignups.jsx';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('AdminPartnerSignups page', () => {
  it('reads partner signups from localStorage and supports export and clear actions', async () => {
    const data = [
      { email: 'owner@example.com', companyName: 'Acme Ltd', ref: 'invite-123', ts: Date.now() },
    ];
    localStorage.setItem('mock:partnerSignups', JSON.stringify(data));

    render(
      <MemoryRouter initialEntries={["/admin/partner-signups"]}>
        <Routes>
          <Route path="/admin/partner-signups" element={<AdminPartnerSignups />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify the entry appears in the table
    expect(screen.getByText('Partner Signups')).toBeTruthy();
    expect(screen.getByText('owner@example.com')).toBeTruthy();
    expect(screen.getByText('Acme Ltd')).toBeTruthy();

    // Export should call URL.createObjectURL
  const createSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake');
  fireEvent.click(screen.getByRole('button', { name: /Export CSV/i }));
  expect(createSpy).toHaveBeenCalled();

    // Clear should remove the localStorage key and update the UI. confirm() must allow it.
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  fireEvent.click(screen.getByRole('button', { name: /Clear all/i }));

    expect(localStorage.getItem('mock:partnerSignups')).toBeNull();
    expect(screen.getByText(/No partner signups recorded/i)).toBeTruthy();
  });
});
