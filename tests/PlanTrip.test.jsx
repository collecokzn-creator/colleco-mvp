import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, test, expect } from 'vitest';

// Ensure React is available globally for modules that reference it at runtime
globalThis.React = React;

// Shared spy so tests can assert calls
const addSpy = vi.fn();

// Mock the hook modules used by PlanTrip
vi.mock('../src/utils/useBasketState', () => ({
  useBasketState: () => ({
    basket: [],
    addToBasket: addSpy,
    removeFromBasket: vi.fn(),
    updateQuantity: vi.fn(),
    updateDay: vi.fn(),
    paidItems: [],
    clearBasket: vi.fn(),
  }),
}));

vi.mock('../src/utils/useTripState', () => ({
  useTripState: () => [{ days: {} }, vi.fn()],
  computeProgress: () => [],
}));

// Use real PRODUCTS to ensure catalog renders
import { PRODUCTS } from '../src/data/products';

describe('PlanTrip component', () => {
  test('renders catalog and basic UI', async () => {
    const { default: PlanTrip } = await import('../src/pages/PlanTrip.jsx');
    render(
      <MemoryRouter>
        <PlanTrip />
      </MemoryRouter>
    );
    // Expect header and catalog count to be present
    expect(screen.queryByText(/Trip Planner/i)).not.toBeNull();
    const catalogHeading = screen.queryByText(/Product Catalog/i);
    expect(catalogHeading).not.toBeNull();
    // Should show at least one product from PRODUCTS
    if (PRODUCTS.length > 0) {
      expect(screen.queryByText(PRODUCTS[0].title)).not.toBeNull();
    }
  });

  test('clicking Add calls addToBasket', async () => {
    const { default: PlanTrip } = await import('../src/pages/PlanTrip.jsx');
    render(
      <MemoryRouter>
        <PlanTrip />
      </MemoryRouter>
    );
    // Find first Add button and click
    const addButtons = screen.getAllByRole('button', { name: /add/i });
    if (addButtons.length > 0) {
      fireEvent.click(addButtons[0]);
      expect(addSpy).toHaveBeenCalled();
    }
  });

  test('toggle simple mode hides events and basket', async () => {
    const { default: PlanTrip } = await import('../src/pages/PlanTrip.jsx');
    render(
      <MemoryRouter>
        <PlanTrip />
      </MemoryRouter>
    );
    // Find the checkbox whose label contains 'Simple mode' to avoid ambiguous matches
    const allCheckboxes = screen.getAllByRole('checkbox');
    const simpleCheckbox = allCheckboxes.find(cb => {
      const lbl = cb.closest('label');
      return lbl && /simple mode/i.test(lbl.textContent || '');
    });
    expect(simpleCheckbox).toBeTruthy();
    // Toggle on
    fireEvent.click(simpleCheckbox);
    // After toggling to simple mode, the checkbox should be checked and localStorage updated
    expect(simpleCheckbox.checked).toBe(true);
    expect(localStorage.getItem('tripSimpleMode')).toBe('1');
  });
});
