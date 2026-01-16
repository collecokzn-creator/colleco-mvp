import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { CreditCard, Loader, AlertCircle } from 'lucide-react';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');
  const service = searchParams.get('service'); // 'transfer', 'accommodation', 'flight', etc.
  const amount = searchParams.get('amount'); // fallback amount if booking API fails
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processor, setProcessor] = useState(''); // client must choose: 'yoco' or 'paystack'
  const [redirecting, setRedirecting] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    console.log('[Checkout] URL params:', { bookingId, service, amount });
    
    if (!bookingId) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    async function loadBooking() {
      try {
        // First check if this is a temporary booking from basket (stored in localStorage)
        if (bookingId.startsWith('temp_')) {
          const pendingCheckout = localStorage.getItem('pendingCheckout');
          if (pendingCheckout) {
            const checkoutData = JSON.parse(pendingCheckout);
            console.log('[Checkout] Loading from localStorage:', checkoutData);
            
            // Convert basket items to booking format
            setBooking({
              id: checkoutData.bookingId,
              pricing: {
                total: checkoutData.total,
                subtotal: checkoutData.subtotal,
                vat: checkoutData.tax,
                serviceFee: checkoutData.serviceFee
              },
              metadata: {
                source: 'trip_basket',
                timestamp: checkoutData.timestamp
              },
              serviceType: 'PACKAGE',
              lineItems: checkoutData.items.map(item => ({
                description: item.title,
                totalRetail: (item.price || 0) * (item.quantity || 1),
                quantity: item.quantity || 1,
                day: item.day,
                time: item.time
              }))
            });
            setLoading(false);
            return;
          } else {
            throw new Error('Pending checkout data not found in localStorage');
          }
        }
        
        // Determine API endpoint based on service type
        let endpoint = `/api/bookings/${bookingId}`;
        if (service === 'transfer') {
          endpoint = `/api/transfers/request/${bookingId}`;
        }
        
        const response = await fetch(endpoint);
        if (!response.ok) {
          // If specific endpoint fails, create a minimal booking object with provided amount
          if (amount) {
            const total = parseFloat(amount);
            const subtotal = total / 1.15; // Remove VAT to get subtotal
            const vat = total - subtotal;  // VAT is the difference
            console.log('[Checkout] Creating fallback booking with amount:', amount, 'parsed:', total, 'subtotal:', subtotal, 'vat:', vat);
            setBooking({
              id: bookingId,
              pricing: { 
                total: total,
                subtotal: subtotal,
                vat: vat
              },
              metadata: {},
              serviceType: service || 'transfer',
              lineItems: [{
                description: service === 'transfer' ? 'Transfer Service' : 'Service',
                totalRetail: total
              }]
            });
            setLoading(false);
            return;
          }
          throw new Error(`Failed to load booking: ${response.statusText}`);
        }
        const data = await response.json();
        
        // Handle transfer response format
        if (service === 'transfer' && data.request) {
          const total = data.request.price || parseFloat(amount);
          const subtotal = total / 1.15; // Remove VAT to get subtotal
          const vat = total - subtotal;  // VAT is the difference
          setBooking({
            id: data.request.id,
            pricing: { 
              total: total,
              subtotal: subtotal,
              vat: vat
            },
            metadata: data.request.metadata || {},
            serviceType: 'transfer',
            lineItems: [{
              description: `Transfer Service: ${data.request.pickup || 'Pickup'} to ${data.request.dropoff || 'Dropoff'}`,
              totalRetail: total
            }]
          });
        } else {
          setBooking(data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load booking:', err);
        // If amount is provided, allow proceeding with minimal data
        if (amount) {
          const total = parseFloat(amount);
          const subtotal = total / 1.15;
          const vat = total - subtotal;
          setBooking({
            id: bookingId,
            pricing: { 
              total: total,
              subtotal: subtotal,
              vat: vat
            },
            metadata: {},
            serviceType: service || 'transfer',
            lineItems: [{
              description: service === 'transfer' ? 'Transfer Service' : 'Service',
              totalRetail: total
            }]
          });
          setLoading(false);
        } else {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    loadBooking();
  }, [bookingId, service, amount]);

  async function handlePayment() {
    if (!booking) return;

    if (!processor) {
      setError('Please select a payment provider before continuing');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail.trim()) {
      setEmailError('Email is required for booking confirmation');
      return;
    }
    if (!emailRegex.test(customerEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setRedirecting(true);
    try {
      // Update booking with customer email
      const updateResponse = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: {
            ...booking.metadata,
            customerEmail
          }
        })
      });

      if (!updateResponse.ok) {
        console.warn('Failed to update booking with email, continuing anyway');
      }

      // Generate payment URL from backend
      const response = await fetch('/api/payments/generate-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          processor,
          amount: booking.pricing.total,
          returnUrl: `${window.location.origin}/pay/success?bookingId=${booking.id}&amount=${booking.pricing.total}&service=${booking.bookingType === 'PACKAGE' ? 'package' : (service || 'transfer')}&demo=1`,
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

  const nights = (booking.lineItems && booking.lineItems.length > 0) 
    ? booking.lineItems.reduce((sum, item) => Math.max(sum, item.nights || 0), 0)
    : 0;
  
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
  const _getIncludedServices = () => {
    if (!booking.lineItems || booking.lineItems.length === 0) return 'Transfer service';
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
            {booking.serviceType !== 'transfer' && booking.bookingType && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className="font-semibold text-brand-brown">
                  {booking.bookingType === 'FIT' ? 'Individual Booking' : 'Group Booking'}
                </span>
              </div>
            )}
            {booking.serviceType !== 'transfer' && booking.checkInDate && (
              <>
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
              </>
            )}
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
                    {(booking.lineItems || []).map((item, index) => (
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
                  {(booking.lineItems || []).map((item, index) => {
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
                <span className="font-semibold text-brand-brown">ZAR {(booking.pricing?.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VAT (included):</span>
                <span className="font-semibold text-brand-brown">ZAR {(booking.pricing?.vat || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span className="text-brand-brown">Total:</span>
                <span className="text-brand-orange">ZAR {(booking.pricing?.total || 0).toFixed(2)}</span>
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
                Full payment of ZAR {(booking.pricing?.total || 0).toFixed(2)} due now
              </p>
            ) : (
              <div className="text-xs text-gray-600">
                <p>Deposit (25%): ZAR {(booking.paymentTerms?.depositAmount || 0).toFixed(2)} due now</p>
                <p>Balance: ZAR {(booking.paymentTerms?.balanceAmount || 0).toFixed(2)} due by {booking.paymentTerms?.balanceDueDate || 'TBD'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6">
          <h2 className="text-lg font-bold text-brand-brown mb-4">Contact Information</h2>
          
          <div className="mb-6">
            <label htmlFor="customerEmail" className="block text-sm font-semibold text-brand-brown mb-2">
              Email Address
            </label>
            <input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => {
                setCustomerEmail(e.target.value);
                setEmailError('');
              }}
              placeholder="your.email@example.com"
              className={`w-full px-4 py-2 rounded-lg border-2 transition-colors ${
                emailError
                  ? 'border-red-500 bg-red-50'
                  : 'border-cream-border bg-white hover:border-brand-orange focus:border-brand-orange'
              } focus:outline-none`}
            />
            {emailError && (
              <p className="text-sm text-red-600 mt-2">{emailError}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Your booking confirmation and payment receipt will be sent to this email address.
            </p>
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

            <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:border-brand-orange transition-colors">
              <input
                type="radio"
                name="processor"
                value="paystack"
                checked={processor === 'paystack'}
                onChange={e => setProcessor(e.target.value)}
                className="w-4 h-4 text-brand-orange"
              />
              <div className="flex-1">
                <p className="font-semibold text-brand-brown">Paystack</p>
                <p className="text-xs text-gray-600">Credit card, local payment methods</p>
              </div>
              <CreditCard className="h-5 w-5 text-gray-400" />
            </label>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          fullWidth
          onClick={handlePayment}
          disabled={redirecting || !processor}
          className="py-4 text-lg"
        >
          {redirecting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader className="h-5 w-5 animate-spin" />
              Redirecting to {processor ? processor.charAt(0).toUpperCase() + processor.slice(1) : 'payment provider'}...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <CreditCard className="h-5 w-5" />
              Proceed to Payment
            </span>
          )}
        </Button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Secure payment powered by {processor ? processor.charAt(0).toUpperCase() + processor.slice(1) : 'our payment processors'}.
          Your payment information is encrypted and secure.
        </p>
      </div>
    </div>
  );
}
