import { useState, useEffect, useCallback } from 'react';

// Local itinerary overlay: custom items + completion flags persisted in localStorage.
// Shape: { custom: { [day:number]: Item[] }, done: { [itemId]: boolean } }
const KEY = 'itineraryLocalOverlay:v1';
const initialValue = { custom: {}, done: {} };

export function useLocalItinerary() {
  const [overlay, setOverlay] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(overlay)); } catch {}
  }, [overlay]);

  const addCustomItem = useCallback((day, item) => {
    setOverlay(prev => {
      const d = String(day);
      const current = prev.custom[d] || [];
      const withId = item.id ? item : { ...item, id: `local-${Date.now()}-${Math.random().toString(36).slice(2,7)}` };
      return { ...prev, custom: { ...prev.custom, [d]: [...current, withId] } };
    });
  }, []);

  const removeCustomItem = useCallback((day, id) => {
    setOverlay(prev => {
      const d = String(day);
      const current = prev.custom[d] || [];
      return { ...prev, custom: { ...prev.custom, [d]: current.filter(i => i.id !== id) } };
    });
  }, []);

  const toggleDone = useCallback((id) => {
    setOverlay(prev => ({ ...prev, done: { ...prev.done, [id]: !prev.done[id] } }));
  }, []);

  const clearAll = useCallback(() => setOverlay(initialValue), []);

  return { overlay, addCustomItem, removeCustomItem, toggleDone, clearAll };
}
