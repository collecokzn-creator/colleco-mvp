import { useCallback } from 'react';
import { useLocalStorageState } from '../useLocalStorageState';

// Basket item shape: { id, title, description?, category?, price (number), quantity, day? }
// All items in basket feed itinerary; paid (price>0) items feed quote creation shortcut.
export function useBasketState() {
  const [basket, setBasket] = useLocalStorageState('basket:v1', []);

  const addToBasket = useCallback((item) => {
    setBasket((prev) => {
      if (!item?.id) return prev;
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: (i.quantity||1) + 1 } : i);
      }
      return [...prev, { ...item, quantity: item.quantity || 1, price: Number(item.price||0), day: item.day || 1 }];
    });
  }, [setBasket]);

  const removeFromBasket = useCallback((id) => {
    setBasket(prev => prev.filter(i => i.id !== id));
  }, [setBasket]);

  const updateQuantity = useCallback((id, qty) => {
    setBasket(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, qty) } : i));
  }, [setBasket]);

  const updateItem = useCallback((id, patch) => {
    setBasket(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  }, [setBasket]);

  const updateDay = useCallback((id, day) => {
    setBasket(prev => prev.map(i => i.id === id ? { ...i, day: Math.max(1, Number(day)||1) } : i));
  }, [setBasket]);

  const reorderWithin = useCallback((idsInNewOrder) => {
    // idsInNewOrder: array of existing basket item ids representing desired order; others keep relative order appended
    setBasket(prev => {
      const map = new Map(prev.map(i=>[i.id,i]));
      const used = new Set();
      const next = [];
      idsInNewOrder.forEach(id=>{ if(map.has(id)){ next.push(map.get(id)); used.add(id);} });
      prev.forEach(i=>{ if(!used.has(i.id)) next.push(i); });
      return next;
    });
  }, [setBasket]);

  const clearBasket = useCallback(() => setBasket([]), [setBasket]);

  const paidItems = basket.filter(i => Number(i.price) > 0);

  return { basket, addToBasket, removeFromBasket, updateQuantity, updateItem, updateDay, reorderWithin, clearBasket, paidItems };
}
