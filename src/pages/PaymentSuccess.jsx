import React, { useState, useEffect } from 'react';
import PdfShareButtons from '../components/PdfShareButtons';
import { shareBookingConfirmationPdf, shareInvoicePdf } from '../utils/pdfShare';

export default function PaymentSuccess() {
  // Support both normal query string and hash-based query
  let params = new URLSearchParams(window.location.search);
  if ((!params.get('bookingId') && !params.get('sessionId')) && window.location.hash && window.location.hash.includes('?')) {
    try {
      const hashQuery = window.location.hash.split('?')[1] || '';
      params = new URLSearchParams(hashQuery);
    } catch (e) {}
  }
  
  const bookingId = params.get('bookingId') || 'PAY-' + Date.now().toString().slice(-8);
  const amount = parseFloat(params.get('amount')) || 0;
  const service = params.get('service') || 'transfer';
  const serviceType = service.charAt(0).toUpperCase() + service.slice(1).replace('-', ' ');
  const paymentDate = new Date().toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const paymentTime = new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  
  // Fetch booking details from localStorage or API
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadBookingDetails() {
      try {
        // First, try to get from localStorage (set by booking page before checkout)
        const storedBooking = localStorage.getItem(`booking_${bookingId}`);
        if (storedBooking) {
          const parsed = JSON.parse(storedBooking);
          setBookingDetails(parsed);
          setLoading(false);
          return;
        }
        
        // If not in localStorage, try API based on service type
        let apiEndpoint = '';
        switch (service) {
          case 'transfer':
            apiEndpoint = `/api/transfers/request/${bookingId}`;
            break;
          case 'accommodation':
            apiEndpoint = `/api/accommodation/booking/${bookingId}`;
            break;
          case 'flight':
            apiEndpoint = `/api/flights/booking/${bookingId}`;
            break;
          case 'car-hire':
            apiEndpoint = `/api/car-hire/booking/${bookingId}`;
            break;
          default:
            apiEndpoint = `/api/bookings/${bookingId}`;
        }
        
        if (apiEndpoint) {
          const response = await fetch(apiEndpoint);
          if (response.ok) {
            const data = await response.json();
            setBookingDetails(data.request || data.booking || data);
          }
        }
      } catch (error) {
        console.warn('Could not load booking details:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadBookingDetails();
  }, [bookingId, service]);

  // Get service-specific invoice item details
  const getInvoiceItemDetails = () => {
    switch (service) {
      case 'transfer':
        return {
          name: `Transfer Service - ${bookingDetails?.vehicleType?.charAt(0).toUpperCase() + bookingDetails?.vehicleType?.slice(1) || 'Standard'}`,
          description: `${bookingDetails?.pickup || 'Pickup'} → ${bookingDetails?.dropoff || 'Dropoff'}${bookingDetails?.date ? ` | ${bookingDetails.date}` : ''}${bookingDetails?.time ? ` @ ${bookingDetails.time}` : ''}`,
          notes: `Payment Status: Confirmed & Paid\nPayment Date: ${paymentDate} ${paymentTime}\nService Provider: ${bookingDetails?.brandName || 'Transfer Provider'}${bookingDetails?.driverName ? `\nDriver: ${bookingDetails.driverName}` : ''}${bookingDetails?.vehicleModel ? `\nVehicle: ${bookingDetails.vehicleModel} (${bookingDetails.vehiclePlate || 'TBC'})` : ''}`
        };
      
      case 'accommodation':
        return {
          name: `Accommodation - ${bookingDetails?.propertyName || 'Hotel Booking'}`,
          description: `${bookingDetails?.roomType || 'Room'} | ${bookingDetails?.checkIn || 'Check-in'} to ${bookingDetails?.checkOut || 'Check-out'} | ${bookingDetails?.guests || 1} guest(s)${bookingDetails?.nights ? ` | ${bookingDetails.nights} night(s)` : ''}`,
          notes: `Payment Status: Confirmed & Paid\nPayment Date: ${paymentDate} ${paymentTime}\nProperty: ${bookingDetails?.propertyName || 'Hotel'}${bookingDetails?.address ? `\nAddress: ${bookingDetails.address}` : ''}${bookingDetails?.mealPlan ? `\nMeal Plan: ${bookingDetails.mealPlan}` : ''}`
        };
      
      case 'flight':
        return {
          name: `Flight Booking - ${bookingDetails?.airline || 'Airline'}`,
          description: `${bookingDetails?.from || 'Departure'} → ${bookingDetails?.to || 'Arrival'} | ${bookingDetails?.departureDate || 'Date'} ${bookingDetails?.departureTime ? `@ ${bookingDetails.departureTime}` : ''} | ${bookingDetails?.passengers || 1} passenger(s)`,
          notes: `Payment Status: Confirmed & Paid\nPayment Date: ${paymentDate} ${paymentTime}\nFlight: ${bookingDetails?.flightNumber || 'TBC'}\nAirline: ${bookingDetails?.airline || 'Airline'}${bookingDetails?.class ? `\nClass: ${bookingDetails.class}` : ''}${bookingDetails?.baggage ? `\nBaggage: ${bookingDetails.baggage}` : ''}`
        };
      
      case 'car-hire':
        return {
          name: `Car Hire - ${bookingDetails?.vehicleMake || 'Vehicle'} ${bookingDetails?.vehicleModel || ''}`,
          description: `${bookingDetails?.pickupLocation || 'Pickup'} | ${bookingDetails?.pickupDate || 'Start'} to ${bookingDetails?.returnDate || 'End'} | ${bookingDetails?.days || 1} day(s)`,
          notes: `Payment Status: Confirmed & Paid\nPayment Date: ${paymentDate} ${paymentTime}\nVehicle: ${bookingDetails?.vehicleMake || ''} ${bookingDetails?.vehicleModel || ''}${bookingDetails?.vehicleCategory ? `\nCategory: ${bookingDetails.vehicleCategory}` : ''}${bookingDetails?.insurance ? `\nInsurance: ${bookingDetails.insurance}` : ''}${bookingDetails?.deposit ? `\nDeposit: R${bookingDetails.deposit}` : ''}`
        };
      
      case 'package': {
        const itemCount = bookingDetails?.lineItems?.length || 0;
        const itemList = bookingDetails?.lineItems?.map(item => item.description).join(', ') || 'Multiple services';
        return {
          name: `Travel Package - ${itemCount} Service${itemCount !== 1 ? 's' : ''}`,
          description: itemList.length > 80 ? itemList.substring(0, 77) + '...' : itemList,
          notes: `Payment Status: Confirmed & Paid\nPayment Date: ${paymentDate} ${paymentTime}\nPackage includes: ${itemCount} service(s)${bookingDetails?.metadata?.source ? `\nBooked via: ${bookingDetails.metadata.source}` : ''}`
        };
      }
      
      default:
        return {
          name: `${service.charAt(0).toUpperCase() + service.slice(1)} Service`,
          description: `Booking confirmed`,
          notes: `Payment Status: Confirmed & Paid\nPayment Date: ${paymentDate} ${paymentTime}`
        };
    }
  };

  // Professional invoice download function
  const downloadInvoice = async () => {
    try {
      const itemDetails = getInvoiceItemDetails();
      const invoiceData = {
        invoiceNumber: bookingId,
        clientName: bookingDetails?.customerName || bookingDetails?.guestName || 'Valued Customer',
        reference: bookingId,
        currency: 'R',
        taxRate: 15,
        dueDate: new Date(),
        items: [
          {
            name: itemDetails.name,
            description: itemDetails.description,
            quantity: 1,
            unitPrice: amount / 1.15  // Subtotal (excl. VAT)
          }
        ],
        notes: itemDetails.notes
      };
      
      await shareInvoicePdf(invoiceData, 'download');
    } catch (error) {
      console.error('Failed to download invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  // Get service-specific booking confirmation details
  const getBookingConfirmationDetails = () => {
    const basePdfDetails = {
      'Booking Reference': bookingId,
      'Service Type': service.charAt(0).toUpperCase() + service.slice(1).replace('-', ' '),
      'Payment Date': paymentDate,
      'Payment Time': paymentTime,
      'Status': 'Confirmed & Paid'
    };

    if (!bookingDetails) return basePdfDetails;

    switch (service) {
      case 'transfer':
        return {
          ...basePdfDetails,
          'Service Provider': bookingDetails.brandName || 'Transfer Provider',
          'Driver': bookingDetails.driverName || 'To be confirmed',
          'Vehicle': `${bookingDetails.vehicleModel || 'Vehicle'} (${bookingDetails.vehiclePlate || 'Plate TBC'})`,
          'Pickup Location': bookingDetails.pickup || 'Not specified',
          'Dropoff Location': bookingDetails.dropoff || 'Not specified',
          'Passengers': `${bookingDetails.pax || 1} passenger(s)`,
          'Service Date': bookingDetails.date || 'Not specified',
          'Service Time': bookingDetails.time || 'Not specified',
          'Vehicle Type': bookingDetails.vehicleType?.charAt(0).toUpperCase() + bookingDetails.vehicleType?.slice(1) || 'Standard',
          'Luggage': `${bookingDetails.luggage || 0} bag(s)`,
          ...(bookingDetails.isRoundTrip && {
            'Round Trip': 'Yes',
            'Return Date': bookingDetails.returnDate || 'TBC',
            'Return Time': bookingDetails.returnTime || 'TBC'
          }),
          'Subtotal': `R${(amount / 1.15).toFixed(2)}`,
          'VAT (15%)': `R${(amount - (amount / 1.15)).toFixed(2)}`,
          'Total Amount': `R${amount.toFixed(2)}`
        };

      case 'accommodation':
        return {
          ...basePdfDetails,
          'Property': bookingDetails.propertyName || 'Hotel',
          'Address': bookingDetails.address || 'Not specified',
          'Room Type': bookingDetails.roomType || 'Standard Room',
          'Check-in Date': bookingDetails.checkIn || 'Not specified',
          'Check-out Date': bookingDetails.checkOut || 'Not specified',
          'Nights': `${bookingDetails.nights || 1} night(s)`,
          'Guests': `${bookingDetails.guests || 1} guest(s)`,
          'Meal Plan': bookingDetails.mealPlan || 'Room Only',
          ...(bookingDetails.specialRequests && {
            'Special Requests': bookingDetails.specialRequests
          }),
          'Subtotal': `R${(amount / 1.15).toFixed(2)}`,
          'VAT (15%)': `R${(amount - (amount / 1.15)).toFixed(2)}`,
          'Total Amount': `R${amount.toFixed(2)}`
        };

      case 'flight':
        return {
          ...basePdfDetails,
          'Airline': bookingDetails.airline || 'Airline',
          'Flight Number': bookingDetails.flightNumber || 'TBC',
          'From': bookingDetails.from || 'Departure',
          'To': bookingDetails.to || 'Arrival',
          'Departure Date': bookingDetails.departureDate || 'Not specified',
          'Departure Time': bookingDetails.departureTime || 'TBC',
          ...(bookingDetails.returnDate && {
            'Return Date': bookingDetails.returnDate,
            'Return Time': bookingDetails.returnTime || 'TBC'
          }),
          'Passengers': `${bookingDetails.passengers || 1} passenger(s)`,
          'Class': bookingDetails.class || 'Economy',
          'Baggage': bookingDetails.baggage || 'Not specified',
          'Subtotal': `R${(amount / 1.15).toFixed(2)}`,
          'VAT (15%)': `R${(amount - (amount / 1.15)).toFixed(2)}`,
          'Total Amount': `R${amount.toFixed(2)}`
        };

      case 'car-hire':
        return {
          ...basePdfDetails,
          'Vehicle': `${bookingDetails.vehicleMake || ''} ${bookingDetails.vehicleModel || 'Vehicle'}`.trim(),
          'Category': bookingDetails.vehicleCategory || 'Standard',
          'Pickup Location': bookingDetails.pickupLocation || 'Not specified',
          'Pickup Date': bookingDetails.pickupDate || 'Not specified',
          'Pickup Time': bookingDetails.pickupTime || 'TBC',
          'Return Location': bookingDetails.returnLocation || bookingDetails.pickupLocation || 'Same as pickup',
          'Return Date': bookingDetails.returnDate || 'Not specified',
          'Return Time': bookingDetails.returnTime || 'TBC',
          'Days': `${bookingDetails.days || 1} day(s)`,
          'Insurance': bookingDetails.insurance || 'Basic',
          ...(bookingDetails.deposit && {
            'Deposit': `R${bookingDetails.deposit.toFixed(2)}`
          }),
          'Subtotal': `R${(amount / 1.15).toFixed(2)}`,
          'VAT (15%)': `R${(amount - (amount / 1.15)).toFixed(2)}`,
          'Total Amount': `R${amount.toFixed(2)}`
        };

      case 'package': {
        const packageDetails = {
          ...basePdfDetails,
          'Package Type': 'Multi-Service Travel Package',
          'Total Services': `${bookingDetails?.lineItems?.length || 0} service(s)`,
          'Booked Via': bookingDetails?.metadata?.source === 'trip_basket' ? 'Trip Basket' : 'Direct Booking'
        };
        
        // Add line items summary
        if (bookingDetails?.lineItems) {
          bookingDetails.lineItems.forEach((item, index) => {
            packageDetails[`Service ${index + 1}`] = `${item.description} - R${(item.retailPrice * (item.quantity || 1)).toFixed(2)}`;
          });
        }
        
        packageDetails['Subtotal'] = `R${(amount / 1.15).toFixed(2)}`;
        packageDetails['VAT (15%)'] = `R${(amount - (amount / 1.15)).toFixed(2)}`;
        packageDetails['Total Amount'] = `R${amount.toFixed(2)}`;
        
        return packageDetails;
      }

      default:
        return {
          ...basePdfDetails,
          'Subtotal': `R${(amount / 1.15).toFixed(2)}`,
          'VAT (15%)': `R${(amount - (amount / 1.15)).toFixed(2)}`,
          'Total Amount': `R${amount.toFixed(2)}`
        };
    }
  };

  return (
    <div className="px-6 py-8 text-brand-brown space-y-6">
      {/* Payment Success Section */}
      <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-brand-brown mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your payment has been confirmed</p>
          <p className="text-sm text-gray-500 mt-2">Booking Reference: <span className="font-semibold text-brand-brown">{bookingId}</span></p>
        </div>

        <div className="bg-cream-sand border border-cream-border rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
          <p className="text-3xl font-bold text-brand-brown">R {amount.toFixed(2)}</p>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600">Payment Date</p>
              <p className="font-semibold text-brand-brown">{paymentDate}</p>
            </div>
            <div>
              <p className="text-gray-600">Payment Time</p>
              <p className="font-semibold text-brand-brown">{paymentTime}</p>
            </div>
          </div>

          <button
            onClick={downloadInvoice}
            className="w-full bg-brand-orange text-white font-semibold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Invoice
          </button>
        </div>
      </div>

      {/* Booking Confirmation Section */}
      <div className="bg-white rounded-xl shadow-sm border border-cream-border" id="booking-confirmation">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
          {/* Mobile: Centered layout */}
          <div className="flex flex-col items-center gap-3 sm:hidden">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-brand-brown mb-1">Booking Confirmation</h2>
              <p className="text-sm text-gray-600">Review your booking details</p>
            </div>
            <div className="w-full flex justify-center">
            <PdfShareButtons
              onShare={async () => {
                const pdfDetails = getBookingConfirmationDetails();
                  return await shareBookingConfirmationPdf({
                  confirmationId: bookingId,
                  bookingId: bookingId,
                  serviceType: serviceType,
                  details: pdfDetails
                }, 'share');
              }}
              onDownload={async () => {
                const pdfDetails = getBookingConfirmationDetails();
                  return await shareBookingConfirmationPdf({
                  confirmationId: bookingId,
                  bookingId: bookingId,
                  serviceType: serviceType,
                  details: pdfDetails
                }, 'download');
              }}
              onPrint={async () => {
                const pdfDetails = getBookingConfirmationDetails();
                  return await shareBookingConfirmationPdf({
                  confirmationId: bookingId,
                  bookingId: bookingId,
                  serviceType: serviceType,
                  details: pdfDetails
                }, 'print');
              }}
            />
            </div>
          </div>
          
          {/* Desktop: Left-right layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-brand-brown mb-1">Booking Confirmation</h2>
              <p className="text-sm text-gray-600">Review your booking details</p>
            </div>
            <PdfShareButtons
              onShare={async () => {
                const pdfDetails = getBookingConfirmationDetails();
                return await shareBookingConfirmationPdf({
                  confirmationId: bookingId,
                  bookingId: bookingId,
                  serviceType: serviceType,
                  details: pdfDetails
                }, 'share');
              }}
              onDownload={async () => {
                const pdfDetails = getBookingConfirmationDetails();
                return await shareBookingConfirmationPdf({
                  confirmationId: bookingId,
                  bookingId: bookingId,
                  serviceType: serviceType,
                  details: pdfDetails
                }, 'download');
              }}
              onPrint={async () => {
                const pdfDetails = getBookingConfirmationDetails();
                return await shareBookingConfirmationPdf({
                  confirmationId: bookingId,
                  bookingId: bookingId,
                  serviceType: serviceType,
                  details: pdfDetails
                }, 'print');
              }}
            />
          </div>
        </div>

        {/* Booking Details */}
        <div className="p-6 space-y-6">
          {/* Transfer/Service Information */}
          <div>
            <h3 className="text-lg font-bold text-brand-brown mb-3">Booking Details</h3>
            {loading ? (
              <p className="text-gray-500">Loading booking details...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Booking Reference</p>
                  <p className="font-semibold text-brand-brown">{bookingId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Service Type</p>
                  <p className="font-semibold text-brand-brown">Transfer</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Service Provider</p>
                  <p className="font-semibold text-brand-brown">{bookingDetails?.brandName || 'Transfer Provider'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Booking Date</p>
                  <p className="font-semibold text-brand-brown">{paymentDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Booking Time</p>
                  <p className="font-semibold text-brand-brown">{paymentTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-green-600">Confirmed & Paid</p>
                </div>
              </div>
            )}
          </div>

          {/* Service Specific Details - For Transfer Services */}
          {bookingDetails && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-brand-brown mb-3">Transfer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Driver</p>
                  <p className="font-semibold text-brand-brown">{bookingDetails.driverName || 'To be confirmed'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vehicle</p>
                  <p className="font-semibold text-brand-brown">
                    {bookingDetails.vehicleModel || 'Vehicle'} ({bookingDetails.vehiclePlate || 'Plate TBC'})
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Pickup Location</p>
                  <p className="font-semibold text-brand-brown">{bookingDetails.pickup || 'Not specified'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Dropoff Location</p>
                  <p className="font-semibold text-brand-brown">{bookingDetails.dropoff || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Passengers</p>
                  <p className="font-semibold text-brand-brown">{bookingDetails.pax || 1} passenger(s)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Service Date</p>
                  <p className="font-semibold text-brand-brown">{bookingDetails.date || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Service Time</p>
                  <p className="font-semibold text-brand-brown">{bookingDetails.time || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vehicle Type</p>
                  <p className="font-semibold text-brand-brown">
                    {bookingDetails.vehicleType?.charAt(0).toUpperCase() + bookingDetails.vehicleType?.slice(1) || 'Standard'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Luggage</p>
                  <p className="font-semibold text-brand-brown">{bookingDetails.luggage || 0} bag(s)</p>
                </div>
                {bookingDetails.isRoundTrip && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Round Trip</p>
                      <p className="font-semibold text-brand-brown">Yes</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Return Date</p>
                      <p className="font-semibold text-brand-brown">{bookingDetails.returnDate || 'TBC'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Return Time</p>
                      <p className="font-semibold text-brand-brown">{bookingDetails.returnTime || 'TBC'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-brand-brown mb-3">Pricing Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">R{(amount / 1.15).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VAT (15%)</span>
                <span className="font-semibold">R{(amount - (amount / 1.15)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="font-bold text-brand-brown">Total Amount</span>
                <span className="text-2xl font-bold text-brand-orange">R{amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-brand-brown mb-3">Terms & Conditions</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm text-gray-700">
              <div>
                <p className="font-semibold text-brand-brown mb-1">Cancellation Policy</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Free cancellation up to 48 hours before service date</li>
                  <li>50% refund for cancellations 24-48 hours before service</li>
                  <li>No refund for cancellations within 24 hours of service</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-brand-brown mb-1">Payment Terms</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Full payment required at time of booking</li>
                  <li>Credit card details may be required for incidentals</li>
                  <li>Prices include VAT where applicable</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-brand-brown mb-1">Service Policies</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Valid photo ID required for service verification</li>
                  <li>Please arrive at designated location on time</li>
                  <li>Contact support for any changes or special requests</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-brand-brown mb-1">Important Information</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Keep this confirmation for your records</li>
                  <li>Present booking reference when using service</li>
                  <li>Special requests are subject to availability</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Information - Separated by Purpose */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-brand-brown mb-3">Need Assistance?</h3>
            
            {/* Service Provider Contact - For Service-Related Questions */}
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <h4 className="font-semibold text-green-900">Questions About Your Service?</h4>
              </div>
              <p className="text-sm text-green-800 mb-3">
                For service-specific queries, schedule changes, special requests, or assistance during your service:
              </p>
              <button 
                onClick={() => {
                  const messagesButton = document.querySelector('[aria-label="Open Messenger"]');
                  if (messagesButton) {
                    messagesButton.click();
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }
                }}
                className="w-full bg-green-600 text-white font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-sm"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="truncate">Message Service Provider</span>
              </button>
              <p className="text-xs text-green-700 mt-2 text-center">
                Direct messaging • Real-time responses • Issues escalated automatically if needed
              </p>
            </div>

            {/* Zola - Primary Support */}
            <div className="bg-orange-50 border-2 border-brand-orange rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="h-6 w-6 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h4 className="font-semibold text-brand-brown text-lg">Zola - 24/7 Instant Help</h4>
              </div>
              <p className="text-sm text-brand-brown mb-3">
                Get instant answers about your booking, changes, cancellations, refunds, payment issues, and recommendations. 
                Zola handles most requests immediately and routes complex issues to the right specialist.
              </p>
              <button 
                onClick={() => {
                  // Trigger AIAgent to open via custom event
                  window.dispatchEvent(new CustomEvent('openAIAgent'));
                  // Smooth scroll to bottom-right where AIAgent is positioned
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }}
                className="w-full bg-brand-orange text-white font-semibold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat with Zola Now
              </button>
              <p className="text-xs text-gray-600 mt-2 text-center">
                Available 24/7 • Instant responses • Handles booking changes, queries & recommendations
              </p>
            </div>

            {/* Human Support - Backup */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <h4 className="font-medium text-gray-700 text-sm">Need to Speak to a Specialist?</h4>
              </div>
              <p className="text-xs text-gray-600 mb-3">If Zola can&apos;t resolve your issue, you&apos;ll be connected to our team:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Email Support</p>
                  <p className="font-semibold text-gray-700">plantrip@travelcolleco.com</p>
                  <p className="text-xs text-gray-400">Zola routes to specialist</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone (Escalations)</p>
                  <p className="font-semibold text-gray-700">+27 31 123 4567</p>
                  <p className="text-xs text-gray-400">Mon-Fri: 9AM-5PM</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
