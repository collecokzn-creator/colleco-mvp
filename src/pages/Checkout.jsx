import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { CreditCard, Loader, AlertCircle } from 'lucide-react';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processor, setProcessor] = useState('payfast'); // payfast or yoco
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    async function loadBooking() {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (!response.ok) {
          throw new Error(`Failed to load booking: ${response.statusText}`);
        }
        const data = await response.json();
        setBooking(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load booking:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    loadBooking();
  }, [bookingId]);

  async function handlePayment() {
    if (!booking) return;

    setRedirecting(true);
    try {
      // Generate payment URL from backend
      const response = await fetch('/api/payments/generate-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          processor,
          amount: booking.pricing.total,
          returnUrl: `${window.location.origin}/pay/success`,
          cancelUrl: `${window.location.origin}/pay/cancel`,
          notifyUrl: `${window.location.origin}/api/webhooks/${processor}`
        })
      });

      if (!response.ok) {
        throw new Error(`Payment generation failed: ${response.statusText}`);
      }

      const { paymentUrl } = await response.json();
      
      // Redirect to payment processor
      window.location.href = paymentUrl;
    } catch (err) {
      console.error('Payment failed:', err);
      setError(`Payment failed: ${err.message}`);
      setRedirecting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-brand-orange mx-auto mb-4" />
          <p className="text-brand-brown">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-cream-border p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-brand-brown mb-1">Checkout Error</h2>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          </div>
          <Button fullWidth onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-brand-brown">Booking not found</p>
      </div>
    );
  }

  const nights = booking.lineItems.reduce((sum, item) => Math.max(sum, item.nights || 0), 0);
  
  // Detect if this is a package booking (accommodation + multiple services bundled together)
  const isPackageBooking = () => {
    if (!booking.lineItems || booking.lineItems.length < 2) return false;
    
    // Check if accommodation is included
    const hasAccommodation = booking.lineItems.some(item => 
      item.description.toLowerCase().includes('accommodation') || 
      item.description.toLowerCase().includes('room') ||
      item.description.toLowerCase().includes('hotel')
    );
    
    // Count other services (parking, meals, breakfast, dinner, lunch, conference, etc.)
    const otherServices = booking.lineItems.filter(item => 
      !item.description.toLowerCase().includes('accommodation') && 
      !item.description.toLowerCase().includes('room') &&
      !item.description.toLowerCase().includes('hotel')
    );
    
    // It's a package if accommodation + 2+ other services
    return hasAccommodation && otherServices.length >= 2;
  };
  
  const isPackage = isPackageBooking();
  
  // Get list of included services for package display
  const getIncludedServices = () => {
    return booking.lineItems
      .map(item => item.description)
      .join(', ');
  };

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-brand-brown mb-6">Checkout</h1>

        {/* Booking Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6">
          <h2 className="text-lg font-bold text-brand-brown mb-4">Booking Summary</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-semibold text-brand-brown">{booking.id}</span>
            </div>
            {booking.metadata?.propertyName && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Property:</span>
                <span className="font-semibold text-brand-brown">{booking.metadata.propertyName}</span>
              </div>
            )}
            {booking.metadata?.location && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Location:</span>
                <span className="font-semibold text-brand-brown">{booking.metadata.location}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Type:</span>
              <span className="font-semibold text-brand-brown">
                {booking.bookingType === 'FIT' ? 'Individual Booking' : 'Group Booking'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Check-in:</span>
              <span className="font-semibold text-brand-brown">{booking.checkInDate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Check-out:</span>
              <span className="font-semibold text-brand-brown">{booking.checkOutDate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Nights:</span>
              <span className="font-semibold text-brand-brown">{nights}</span>
            </div>
          </div>

          {/* Line Items - Show as Package or Itemized Breakdown */}
          <div className="border-t pt-4 mb-4">
            {isPackage ? (
              // Package Display: Show total with included items
              <div>
                <h3 className="text-sm font-semibold text-brand-brown mb-3">All-Inclusive Package</h3>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-brand-brown mb-2">This package includes:</p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    {booking.lineItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-brand-orange mt-1">✓</span>
                        <span>{item.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              // Itemized Display: Show breakdown per service
              <div>
                <h3 className="text-sm font-semibold text-brand-brown mb-3">Price Breakdown</h3>
                <div className="space-y-3">
                  {booking.lineItems.map((item, index) => {
                    const unitPrice = item.retailPrice || item.basePrice || 0;
                    const itemTotal = item.totalRetail || item.finalPrice || 0;
                    
                    return (
                      <div key={index} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium text-brand-brown">{item.description}</p>
                          <p className="text-xs text-gray-500">
                            {item.quantity > 1 && `${item.quantity} × `}
                            {item.nights > 1 
                              ? `${item.nights} night${item.nights > 1 ? 's' : ''} × ZAR ${unitPrice.toFixed(2)}` 
                              : `ZAR ${unitPrice.toFixed(2)}`}
                          </p>
                        </div>
                        <span className="font-semibold text-brand-brown whitespace-nowrap ml-4">
                          ZAR {itemTotal.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal (excl. VAT):</span>
                <span className="font-semibold text-brand-brown">ZAR {booking.pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VAT (included):</span>
                <span className="font-semibold text-brand-brown">ZAR {booking.pricing.vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span className="text-brand-brown">Total:</span>
                <span className="text-brand-orange">ZAR {booking.pricing.total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Price shown is the full amount, inclusive of taxes and any service fees. No extra booking fees at checkout.
              </p>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="mt-4 p-3 bg-cream rounded-lg">
            <p className="text-xs font-semibold text-brand-brown mb-1">Payment Terms:</p>
            {booking.bookingType === 'FIT' ? (
              <p className="text-xs text-gray-600">
                Full payment of ZAR {booking.pricing.total.toFixed(2)} due now
              </p>
            ) : (
              <div className="text-xs text-gray-600">
                <p>Deposit (25%): ZAR {booking.paymentTerms.depositAmount.toFixed(2)} due now</p>
                <p>Balance: ZAR {booking.paymentTerms.balanceAmount.toFixed(2)} due by {booking.paymentTerms.balanceDueDate}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6">
          <h2 className="text-lg font-bold text-brand-brown mb-4">Payment Method</h2>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:border-brand-orange transition-colors">
              <input
                type="radio"
                name="processor"
                value="payfast"
                checked={processor === 'payfast'}
                onChange={e => setProcessor(e.target.value)}
                className="w-4 h-4 text-brand-orange"
              />
              <div className="flex-1">
                <p className="font-semibold text-brand-brown">PayFast</p>
                <p className="text-xs text-gray-600">Credit card, EFT, instant EFT</p>
              </div>
              <CreditCard className="h-5 w-5 text-gray-400" />
            </label>

            <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:border-brand-orange transition-colors">
              <input
                type="radio"
                name="processor"
                value="yoco"
                checked={processor === 'yoco'}
                onChange={e => setProcessor(e.target.value)}
                className="w-4 h-4 text-brand-orange"
              />
              <div className="flex-1">
                <p className="font-semibold text-brand-brown">Yoco</p>
                <p className="text-xs text-gray-600">Credit/debit card payments</p>
              </div>
              <CreditCard className="h-5 w-5 text-gray-400" />
            </label>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          fullWidth
          onClick={handlePayment}
          disabled={redirecting}
          className="py-4 text-lg"
        >
          {redirecting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader className="h-5 w-5 animate-spin" />
              Redirecting to {processor === 'payfast' ? 'PayFast' : 'Yoco'}...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <CreditCard className="h-5 w-5" />
              Proceed to Payment
            </span>
          )}
        </Button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Secure payment powered by {processor === 'payfast' ? 'PayFast' : 'Yoco'}.
          Your payment information is encrypted and secure.
        </p>
      </div>
    </div>
  );
}
