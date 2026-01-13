import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, Calendar, Zap } from 'lucide-react';
import { useBasketState } from '../utils/useBasketState';

export default function AddToTripButton({ 
  item,  // { id, title, description, category, price, image, ...other }
  onAdded, // Optional callback after adding
  onDirectBook, // Optional callback for direct booking
  size = 'default', // 'small' | 'default' | 'large'
  variant = 'primary', // 'primary' | 'secondary' | 'outline'
  className = '',
  mode = 'smart', // 'smart' (both options) | 'trip-only' | 'direct-only'
  showDirectBook = true // Show "Book Now" option for quick booking
}) {
  const navigate = useNavigate();
  const { addToBasket, basket } = useBasketState();
  const [isAdded, setIsAdded] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const isInBasket = basket.some(b => b.id === item?.id);
  const hasItemsInBasket = basket.length > 0;

  const handleAddToTrip = () => {
    if (!item || !item.id) {
      console.warn('AddToTripButton: Invalid item', item);
      return;
    }

    // Add to basket
    addToBasket({
      id: item.id,
      title: item.title || 'Untitled Item',
      description: item.description || '',
      category: item.category || 'other',
      price: Number(item.price) || 0,
      image: item.image || item.imageUrl || null,
      quantity: 1,
      day: item.day || null, // Auto-assigned by useBasketState
      time: item.time || 'Flexible',
      ...item // Include any additional metadata
    });

    // Show success feedback
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);

    // Optional callback
    if (onAdded) onAdded(item);

    // Analytics (if available)
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'add_to_trip',
        item_id: item.id,
        item_name: item.title,
        item_category: item.category,
        item_price: item.price
      });
    }
  };

  const handleDirectBook = async () => {
    if (!item || !item.id) return;
    
    setIsBooking(true);
    
    try {
      // Create immediate single-item booking
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: item.supplier || 'colleco',
          userId: localStorage.getItem('user_id') || 'guest_' + Date.now(),
          bookingType: 'FIT',
          lineItems: [{
            serviceType: item.category || 'other',
            description: item.title,
            basePrice: item.price || 0,
            retailPrice: item.price || 0,
            quantity: 1,
            metadata: item
          }],
          metadata: {
            source: 'direct_booking',
            customerEmail: localStorage.getItem('user_email') || ''
          }
        })
      });

      if (!response.ok) throw new Error('Booking failed');
      
      const booking = await response.json();
      
      // Optional callback
      if (onDirectBook) onDirectBook(booking);
      
      // Go directly to checkout
      navigate(`/checkout?bookingId=${booking.id}`);
      
      // Analytics
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'direct_booking',
          item_id: item.id,
          booking_id: booking.id,
          item_price: item.price
        });
      }
    } catch (error) {
      console.error('Direct booking failed:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleViewBasket = () => {
    navigate('/trip-basket');
  };

  // Size classes
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-brand-orange text-white hover:bg-brand-highlight shadow-md hover:shadow-lg',
    secondary: 'bg-brand-brown text-white hover:bg-opacity-90',
    outline: 'border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white'
  };

  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  if (isAdded) {
    return (
      <div className={`${baseClasses} ${sizeClasses[size]} bg-green-500 text-white ${className}`}>
        <Check className="w-5 h-5" />
        <span>Added to Trip!</span>
      </div>
    );
  }

  // Smart mode: Show both options based on context
  if (mode === 'smart' && showDirectBook && !isInBasket && !isAdded) {
    return (
      <div className={`flex gap-2 ${className}`}>
        {/* Quick Book - Prominent when basket is empty */}
        <button
          onClick={handleDirectBook}
          disabled={isBooking}
          className={`${baseClasses} ${sizeClasses[size]} ${
            hasItemsInBasket 
              ? variantClasses.outline 
              : variantClasses.primary
          } ${hasItemsInBasket ? 'flex-1' : 'flex-[2]'}`}
          title="Quick checkout for this item only"
        >
          <Zap className="w-5 h-5" />
          <span>{isBooking ? 'Booking...' : 'Book Now'}</span>
        </button>
        
        {/* Add to Trip - Suggested when basket has items */}
        <button
          onClick={handleAddToTrip}
          className={`${baseClasses} ${sizeClasses[size]} ${
            hasItemsInBasket 
              ? variantClasses.primary 
              : variantClasses.outline
          } ${hasItemsInBasket ? 'flex-[2]' : 'flex-1'}`}
          title="Add to your trip basket for multi-item booking"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Add to Trip</span>
        </button>
      </div>
    );
  }

  // Direct booking only mode
  if (mode === 'direct-only' || (mode === 'smart' && !showDirectBook)) {
    return (
      <button
        onClick={handleDirectBook}
        disabled={isBooking}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      >
        <Zap className="w-5 h-5" />
        <span>{isBooking ? 'Booking...' : 'Book Now'}</span>
      </button>
    );
  }

  // Item already in basket
  if (isInBasket) {
    return (
      <button
        onClick={handleViewBasket}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses.outline} ${className}`}
      >
        <Calendar className="w-5 h-5" />
        <span>View in Trip</span>
      </button>
    );
  }

  // Trip planning only mode (or default fallback)
  return (
    <button
      onClick={handleAddToTrip}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      <ShoppingCart className="w-5 h-5" />
      <span>Add to Trip</span>
    </button>
  );
}
