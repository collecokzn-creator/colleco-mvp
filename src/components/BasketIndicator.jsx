import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useBasketState } from '../utils/useBasketState';

export default function BasketIndicator() {
  const navigate = useNavigate();
  const { basket } = useBasketState();
  
  const itemCount = basket.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const total = basket.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  if (basket.length === 0) return null;

  return (
    <button
      onClick={() => navigate('/trip-basket')}
      className="relative flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-full hover:bg-brand-highlight transition-all shadow-lg hover:shadow-xl"
      title="View your trip basket"
    >
      <ShoppingCart className="w-5 h-5" />
      <span className="font-semibold">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </span>
      {total > 0 && (
        <span className="hidden sm:inline text-sm opacity-90">
          • R{total.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </span>
      )}
      
      {/* Pulse animation for new items */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
          {basket.length}
        </span>
      )}
    </button>
  );
}
