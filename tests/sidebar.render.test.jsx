import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// Mock useUser context BEFORE importing Sidebar
let mockUserCtx = { user: { role: 'none' }, isAdmin: false, isPartner: false, isClient: false, setUser: vi.fn() };
vi.mock('../src/context/UserContext.jsx', () => ({
  useUser: () => mockUserCtx,
}));

import Sidebar, { TOOL_CONFIG } from '../src/components/Sidebar.jsx';

describe('Sidebar role-based rendering', () => {
  // Ensure DOM is reset between tests
  afterEach(() => {
    cleanup();
  });

  it('renders admin tools for admin role', () => {
    mockUserCtx = { user: { role: 'admin' }, isAdmin: true, isPartner: false, isClient: false, setUser: vi.fn() };
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar />
      </MemoryRouter>
    );
    TOOL_CONFIG.admin.forEach(tool => {
      // Find all links with this label and ensure one matches the expected href
      const links = screen.getAllByRole('link', { name: tool.label });
      const hasExpectedHref = links.some(link => link.getAttribute('href') === tool.to);
      expect(hasExpectedHref).toBe(true);
    });
  });

  it('renders partner tools for partner role', () => {
    mockUserCtx = { user: { role: 'partner' }, isAdmin: false, isPartner: true, isClient: false, setUser: vi.fn() };
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar />
      </MemoryRouter>
    );
    TOOL_CONFIG.partner.forEach(tool => {
      const links = screen.getAllByRole('link', { name: tool.label });
      const hasExpectedHref = links.some(link => link.getAttribute('href') === tool.to);
      expect(hasExpectedHref).toBe(true);
    });
  });

  it('renders client tools for client role', () => {
    mockUserCtx = { user: { role: 'client' }, isAdmin: false, isPartner: false, isClient: true, setUser: vi.fn() };
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar />
      </MemoryRouter>
    );
    TOOL_CONFIG.client.forEach(tool => {
      const links = screen.getAllByRole('link', { name: tool.label });
      const hasExpectedHref = links.some(link => link.getAttribute('href') === tool.to);
      expect(hasExpectedHref).toBe(true);
    });
  });
});
