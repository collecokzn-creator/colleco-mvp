import { describe, it, expect } from 'vitest';
import { parseQuery, getSuggestion } from '../src/utils/searchIntent';

const PRODUCTS = [
  { id: '1', title: 'Beach Hotel Durban', category: 'Lodging', city: 'Durban', province: 'KwaZulu-Natal', country: 'South Africa', continent: 'Africa' },
  { id: '2', title: 'Margate Lodge', category: 'Lodging', city: 'Margate', province: 'KwaZulu-Natal', country: 'South Africa', continent: 'Africa' },
  { id: '3', title: 'Umhlanga Dining', category: 'Dining', city: 'Umhlanga', province: 'KwaZulu-Natal', country: 'South Africa', continent: 'Africa' },
  { id: '4', title: 'Cape Town Tour', category: 'Tour', city: 'Cape Town', province: 'Western Cape', country: 'South Africa', continent: 'Africa' },
];

describe('searchIntent', () => {
  it('parses "Hotels in Durban"', () => {
    const { category, location } = parseQuery('Hotels in Durban', { products: PRODUCTS });
    expect(category).toBe('Lodging');
    expect(location).toEqual({ city: 'Durban' });
  });

  it('parses no-preposition "Hotels Durban" via longest match', () => {
    const { category, location } = parseQuery('Hotels Durban', { products: PRODUCTS });
    expect(category).toBe('Lodging');
    expect(location).toEqual({ city: 'Durban' });
  });

  it('parses near me intent when myLocation is set', () => {
    const { category, location } = parseQuery('Accommodation near me', { products: PRODUCTS, myLocation: { city: 'Durban' } });
    expect(category).toBe('Lodging');
    expect(location).toEqual({ city: 'Durban' });
  });

  it('getSuggestion returns label and params with counts', () => {
    const s = getSuggestion('Dining in Umhlanga', { products: PRODUCTS });
    expect(s).toBeTruthy();
    expect(s.label).toContain('Dining');
    expect(s.label).toContain('Umhlanga');
    expect(s.params).toEqual({ category: 'Dining', city: 'Umhlanga' });
    expect(typeof s.count).toBe('number');
  });

  it('understands KZN alias for KwaZulu-Natal province', () => {
    const { category, location } = parseQuery('Hotels in KZN', { products: PRODUCTS });
    expect(category).toBe('Lodging');
    expect(location).toEqual({ province: 'KwaZulu-Natal' });
  });

  it('maps SA to South Africa country', () => {
    const { category, location } = parseQuery('Tours in SA', { products: PRODUCTS });
    expect(category).toBe('Tour');
    expect(location).toEqual({ country: 'South Africa' });
  });

  it('recognizes dining synonyms like breakfast', () => {
    const { category, location } = parseQuery('Breakfast in Durban', { products: PRODUCTS });
    expect(category).toBe('Dining');
    expect(location).toEqual({ city: 'Durban' });
  });

  it('maps ZA alias to South Africa with word boundaries only', () => {
    const { category, location } = parseQuery('Tours in ZA', { products: PRODUCTS });
    expect(category).toBe('Tour');
    expect(location).toEqual({ country: 'South Africa' });
  });

  it('recognizes CPT and JHB city codes', () => {
    const a = parseQuery('Hotels in CPT', { products: PRODUCTS });
    expect(a.category).toBe('Lodging');
    expect(a.location).toEqual({ city: 'Cape Town' });
    const b = parseQuery('Dining JHB', { products: PRODUCTS });
    expect(b.category).toBe('Dining');
    // JHB alias maps to Johannesburg; not in test dataset, so fallback may be empty
    // but alias-based location should still resolve
    expect(b.location).toEqual({ city: 'Johannesburg' });
  });

  it('maps NYC to New York City', () => {
    const r = parseQuery('Lodging in NYC', { products: PRODUCTS });
    expect(r.category).toBe('Lodging');
    expect(r.location).toEqual({ city: 'New York' });
  });

  it('maps DXB to Dubai city', () => {
    const r = parseQuery('Dining near DXB', { products: PRODUCTS });
    expect(r.category).toBe('Dining');
    expect(r.location).toEqual({ city: 'Dubai' });
  });

  it('maps DE country code to Germany', () => {
    const r = parseQuery('Tours in DE', { products: PRODUCTS });
    expect(r.category).toBe('Tour');
    expect(r.location).toEqual({ country: 'Germany' });
  });

  it('recognizes Kruger National Park by alias', () => {
    const r = parseQuery('Lodging Kruger', { products: PRODUCTS });
    expect(r.category).toBe('Lodging');
    expect(r.location).toEqual({ area: 'Kruger National Park' });
  });

  it('recognizes Garden Route region', () => {
    const r = parseQuery('Tours in Garden Route', { products: PRODUCTS });
    expect(r.category).toBe('Tour');
    expect(r.location).toEqual({ area: 'Garden Route' });
  });

  it('maps Plett to Plettenberg Bay', () => {
    const r = parseQuery('Dining Plett', { products: PRODUCTS });
    expect(r.category).toBe('Dining');
    expect(r.location).toEqual({ city: 'Plettenberg Bay' });
  });

  it('maps PE and Gqeberha to Port Elizabeth', () => {
    const a = parseQuery('Hotels in PE', { products: PRODUCTS });
    expect(a.category).toBe('Lodging');
    expect(a.location).toEqual({ city: 'Port Elizabeth' });
    const b = parseQuery('Hotels in Gqeberha', { products: PRODUCTS });
    expect(b.category).toBe('Lodging');
    expect(b.location).toEqual({ city: 'Port Elizabeth' });
  });

  it('maps PTA to Pretoria and recognizes Madikwe', () => {
    const a = parseQuery('PTA hotels', { products: PRODUCTS });
    expect(a.location).toEqual({ city: 'Pretoria' });
    const b = parseQuery('Safari in Madikwe', { products: PRODUCTS });
    // 'Safari' is listed under Tour synonyms in CATEGORY_SYNONYMS
    expect(b.category).toBe('Tour');
    expect(b.location).toEqual({ area: 'Madikwe Game Reserve' });
  });

  it('maps Camps Bay as an area in Cape Town', () => {
    const r = parseQuery('Hotels Camps Bay', { products: PRODUCTS });
    expect(r.category).toBe('Lodging');
    expect(r.location).toEqual({ area: 'Camps Bay' });
  });

  it('maps Hazyview to city', () => {
    const r = parseQuery('Dining in Hazyview', { products: PRODUCTS });
    expect(r.category).toBe('Dining');
    expect(r.location).toEqual({ city: 'Hazyview' });
  });

  it('maps Clarens to city', () => {
    const r = parseQuery('Activities near Clarens', { products: PRODUCTS });
    // 'Activities' should trigger Activity category
    expect(r.category).toBe('Activity');
    expect(r.location).toEqual({ city: 'Clarens' });
  });

  it('recognizes Bo-Kaap as an area', () => {
    const r = parseQuery('Dining Bo-Kaap', { products: PRODUCTS });
    expect(r.category).toBe('Dining');
    expect(r.location).toEqual({ area: 'Bo-Kaap' });
  });

  it('recognizes La Lucia as an area in Durban North', () => {
    const r = parseQuery('Hotels La Lucia', { products: PRODUCTS });
    expect(r.category).toBe('Lodging');
    expect(r.location).toEqual({ area: 'La Lucia' });
  });

  it('recognizes Summerstrand as an area in Port Elizabeth', () => {
    const r = parseQuery('Hotels Summerstrand', { products: PRODUCTS });
    expect(r.category).toBe('Lodging');
    expect(r.location).toEqual({ area: 'Summerstrand' });
  });
});
