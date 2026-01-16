import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBasketState } from '../utils/useBasketState';
import { ShoppingCart, Trash2, Plus, Minus, Calendar, MapPin, Clock, CreditCard, ArrowRight, Home } from 'lucide-react';
import Button from '../components/ui/Button';

export default function TripBasket() {
  const navigate = useNavigate();
  const { basket, removeFromBasket, updateQuantity, clearBasket } = useBasketState();
  const [isProcessing, setIsProcessing] = useState(false);

  // Basket Item Component with image error handling
  const BasketItem = ({ item, onRemove, onUpdateQuantity }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <div className="flex gap-4 p-4 border border-cream-border rounded-lg hover:bg-cream-hover transition-colors">
        {/* Item Image/Icon */}
        {item.image && !imageError ? (
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-24 h-24 object-cover rounded"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        {/* Item Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-semibold text-brand-brown">{item.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Clock className="w-4 h-4" />
                <span>{item.time || 'Flexible'}</span>
                {item.category && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="capitalize">{item.category}</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="text-red-500 hover:text-red-700 p-2"
              title="Remove item"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          
          {item.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
          )}
          
          {/* Quantity and Price */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                disabled={(item.quantity || 1) <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-medium">{item.quantity || 1}</span>
              <button
                onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="text-right">
              <div className="font-semibold text-brand-brown">
                R{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </div>
              {(item.quantity || 1) > 1 && (
                <div className="text-xs text-gray-500">
                  R{(item.price || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })} each
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Group items by day for better visualization
  const itemsByDay = basket.reduce((acc, item) => {
    const day = item.day || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});

  const sortedDays = Object.keys(itemsByDay).sort((a, b) => Number(a) - Number(b));

  // Calculate totals
  const subtotal = basket.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const tax = subtotal * 0.15; // 15% VAT
  const serviceFee = subtotal > 0 ? 50 : 0; // R50 service fee
  const total = subtotal + tax + serviceFee;

  const handleProceedToCheckout = async () => {
    if (basket.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Create booking with all basket items
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: 'colleco-multi-service',
          userId: localStorage.getItem('user_id') || 'guest_' + Date.now(),
          bookingType: 'PACKAGE',
          lineItems: basket.map(item => ({
            serviceType: item.category || 'other',
            description: item.title,
            basePrice: item.price || 0,
            retailPrice: item.price || 0,
            quantity: item.quantity || 1,
            day: item.day,
            time: item.time,
            metadata: item
          })),
          metadata: {
            source: 'trip_basket',
            totalItems: basket.length,
            customerEmail: localStorage.getItem('user_email') || ''
          }
        })
      });

      if (!response.ok) throw new Error('Failed to create booking');
      
      const booking = await response.json();
      
      // Navigate to checkout with booking ID
      navigate(`/checkout?bookingId=${booking.id}`);
      
    } catch (error) {
      console.error('Failed to create booking:', error);
      
      // Fallback: Create temporary booking ID and proceed to checkout anyway
      // This allows checkout to work even when backend is unavailable
      const tempBookingId = 'temp_' + Date.now();
      console.log('Using temporary booking ID for checkout:', tempBookingId);
      
      // Store basket in localStorage for checkout page to retrieve
      localStorage.setItem('pendingCheckout', JSON.stringify({
        bookingId: tempBookingId,
        items: basket,
        subtotal,
        tax,
        serviceFee,
        total,
        timestamp: Date.now()
      }));
      
      navigate(`/checkout?bookingId=${tempBookingId}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinueShopping = () => {
    navigate('/plan-trip');
  };

  if (basket.length === 0) {
    return (
      <div className="min-h-screen bg-cream pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingCart className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h1 className="text-3xl font-bold text-brand-brown mb-4">Your Trip Basket is Empty</h1>
            <p className="text-gray-600 mb-8">
              Start planning your perfect trip by adding accommodations, flights, activities, and more!
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/plan-trip')} className="bg-brand-orange hover:bg-brand-highlight">
                <Calendar className="w-5 h-5 mr-2" />
                Plan a Trip
              </Button>
              <Button onClick={() => navigate('/')} variant="outline">
                <Home className="w-5 h-5 mr-2" />
                Return Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-brown mb-2">Review Your Trip</h1>
          <p className="text-gray-600">
            {basket.length} item{basket.length !== 1 ? 's' : ''} • {sortedDays.length} day{sortedDays.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Trip Items */}
          <div className="lg:col-span-2 space-y-6">
            {sortedDays.map(day => (
              <div key={day} className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-brand-brown mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Day {day}
                </h2>
                
                <div className="space-y-4">
                  {itemsByDay[day]
                    .sort((a, b) => {
                      const timeOrder = { 'Morning': 1, 'Afternoon': 2, 'Evening': 3, 'Flexible': 4 };
                      return (timeOrder[a.time] || 4) - (timeOrder[b.time] || 4);
                    })
                    .map(item => (
                      <BasketItem 
                        key={item.id} 
                        item={item} 
                        onRemove={removeFromBasket}
                        onUpdateQuantity={updateQuantity}
                      />
                    ))}
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <button
              onClick={handleContinueShopping}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-brand-orange hover:text-brand-orange transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add More to Your Trip
            </button>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-brand-brown mb-4">Trip Summary</h2>
              
              {/* Pricing Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({basket.length} items)</span>
                  <span>R{subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>VAT (15%)</span>
                  <span>R{tax.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
                {serviceFee > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Service Fee</span>
                    <span>R{serviceFee.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-bold text-lg text-brand-brown">
                  <span>Total</span>
                  <span>R{total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Trip Details */}
              <div className="mb-6 p-4 bg-cream-hover rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">{sortedDays.length} Day Trip</span>
                </div>
                <div className="text-xs text-gray-600">
                  Day {sortedDays[0]} to Day {sortedDays[sortedDays.length - 1]}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleProceedToCheckout}
                  disabled={isProcessing}
                  className="w-full bg-brand-orange hover:bg-brand-highlight"
                >
                  {isProcessing ? (
                    'Processing...'
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Proceed to Checkout
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleContinueShopping}
                  variant="outline"
                  className="w-full"
                >
                  Continue Shopping
                </Button>
                
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear your entire basket?')) {
                      clearBasket();
                    }
                  }}
                  className="w-full text-sm text-red-600 hover:text-red-700 py-2"
                >
                  Clear Basket
                </button>
              </div>

              {/* Security Badge */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Secure checkout with Yoco</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
