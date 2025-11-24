import { useCallback } from 'react';
import { useLocalStorageState } from '../useLocalStorageState';

// Smart auto-day assignment based on category and existing items
function smartDayAssignment(item, currentBasket) {
  const category = (item.category || '').toLowerCase();
  
  // Find highest day currently used
  const maxDay = currentBasket.length > 0 
    ? Math.max(...currentBasket.map(i => i.day || 1))
    : 0;
  
  // Lodging/Accommodation: Start on next available day
  if (category === 'lodging' || category === 'accommodation' || category.includes('hotel')) {
    const lastLodging = currentBasket
      .filter(i => ['lodging', 'accommodation'].includes((i.category || '').toLowerCase()) || (i.category || '').includes('hotel'))
      .sort((a, b) => (b.day || 1) - (a.day || 1))[0];
    
    if (lastLodging) {
      // Get nights from title (e.g., "2 nights") or default to 1
      const nightsMatch = (lastLodging.title || '').match(/(\d+)\s*night/i);
      const nights = nightsMatch ? parseInt(nightsMatch[1]) : 1;
      return (lastLodging.day || 1) + nights;
    }
    return maxDay + 1 || 1;
  }
  
  // Activities: Assign based on time of day and description
  if (category === 'activity' || category === 'tour' || category === 'experience') {
    const title = (item.title || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const text = title + ' ' + desc;
    
    // Detect time hints
    let suggestedTime = 'Flexible';
    if (text.match(/morning|breakfast|sunrise|early/i)) suggestedTime = 'Morning';
    else if (text.match(/afternoon|lunch|midday/i)) suggestedTime = 'Afternoon';
    else if (text.match(/evening|dinner|sunset|night/i)) suggestedTime = 'Evening';
    
    // Assign time to item for smart sorting
    item.time = suggestedTime;
    
    // Multi-day tours get consecutive days
    const daysMatch = text.match(/(\d+)[-\s]*day/i);
    if (daysMatch) {
      const tourDays = parseInt(daysMatch[1]);
      if (tourDays > 1) {
        return maxDay + 1 || 1; // Start on next day
      }
    }
    
    // Single activities: add to current day or next if it's full
    const currentDayItems = currentBasket.filter(i => i.day === maxDay);
    return currentDayItems.length >= 4 ? maxDay + 1 : (maxDay || 1);
  }
  
  // Dining: Assign based on meal type
  if (category === 'dining' || category.includes('food') || category.includes('restaurant')) {
    const title = (item.title || '').toLowerCase();
    if (title.includes('breakfast')) { item.time = 'Morning'; }
    else if (title.includes('lunch')) { item.time = 'Afternoon'; }
    else if (title.includes('dinner')) { item.time = 'Evening'; }
    else { item.time = 'Flexible'; }
    
    return maxDay || 1;
  }
  
  // Transport/Flights: Typically day 1 or last day
  if (category === 'transport' || category === 'flight' || category.includes('transfer')) {
    const title = (item.title || '').toLowerCase();
    if (title.includes('return') || title.includes('departure')) {
      return maxDay + 1 || 1; // Return on last day
    }
    item.time = 'Morning'; // Flights usually morning
    return 1; // Arrival on day 1
  }
  
  // Default: Add to current day
  return maxDay || 1;
}

// Basket item shape: { id, title, description?, category?, price (number), quantity, day?, time? }
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
      
      // Smart auto-assignment: determine best day if not specified
      const assignedDay = item.day || smartDayAssignment(item, prev);
      
      return [...prev, { ...item, quantity: item.quantity || 1, price: Number(item.price||0), day: assignedDay, time: item.time || 'Flexible' }];
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
