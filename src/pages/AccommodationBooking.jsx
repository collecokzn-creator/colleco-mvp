import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchHotels, bookHotel as mockBookHotel, getHotels, getHotelReviews, addHotelReview } from '../api/mockTravelApi';
import PropertyCard from '../components/PropertyCard';
import MapView from '../components/MapView';
import { bookAccommodation } from '../api/client';
import { useBookingDates } from '../context/BookingDatesContext.jsx';

export default function AccommodationBooking(){
  const [location, setLocation] = useState('Durban');
  // use booking dates from context so dates persist across pages
  const { startDate, nights, setStartDate, setNights, computeEndDate } = useBookingDates();
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [guestName, setGuestName] = useState('Web User');
  const [status, setStatus] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmProperty, setConfirmProperty] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // seed results from mock if available
    setResults(getHotels());
  }, []);

  

  async function handleSearch(e){
    e?.preventDefault();
    const res = searchHotels({ location: location || '', startDate });
    setResults(res);
  }

  function viewProperty(p){
    setSelected(p);
    setReviews(getHotelReviews(p.id));
  }

  function openConfirm(p){
    setSelected(p);
    setConfirmProperty(p);
    setShowConfirm(true);
  }

  async function handleBook(p){
    setStatus('booking');
    // compute end date (checkout) from startDate + nights (from context)
    const endDate = computeEndDate(startDate, nights);
    const payload = { hotelName: p.name, nights, unitPrice: p.pricePerNight || 0, currency: 'ZAR', customer: { name: guestName }, startDate, endDate };
    try {
      // Prefer server booking endpoint; fall back to mock if server unavailable
      let res = null;
      try {
        res = await bookAccommodation(payload);
      } catch (e) {
        // server may be unreachable in static preview; fallback to mock
  res = mockBookHotel(p.id, { name: guestName, startDate, endDate, nights, pricePerNight: p.pricePerNight, currency: 'ZAR' });
      }
      // If server returned booking structure
      const booking = res && (res.booking || res);
      if (booking && booking.id) {
        try { window.__E2E_BOOKING = booking; } catch (e) {}
        // If server returned a checkout URL, navigate there
        if (res && res.checkout && res.checkout.checkoutUrl) {
          window.location.href = res.checkout.checkoutUrl;
          return;
        }
        navigate(`/payment-success?bookingId=${encodeURIComponent(booking.id)}`);
        return;
      }
      setStatus('error');
    } catch(e){ setStatus('error'); }
  }

  async function submitReview(hotelId, rating, comment){
    addHotelReview(hotelId, { rating, comment, author: guestName });
    setReviews(getHotelReviews(hotelId));
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Search Accommodation</h1>
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 items-end">
        <label className="block">
          <div className="text-sm mb-1">Location</div>
          <input className="w-full p-2 border" value={location} onChange={e=>setLocation(e.target.value)} />
        </label>
        <label className="block">
          <div className="text-sm mb-1">Start date</div>
          <input type="date" className="w-full p-2 border" value={startDate} onChange={e=>setStartDate(e.target.value)} />
        </label>
        <label className="block">
          <div className="text-sm mb-1">Nights</div>
          <input type="number" min={1} className="w-full p-2 border" value={nights} onChange={e=>setNights(Number(e.target.value))} />
        </label>
        <div>
          <button className="px-4 py-2 bg-brand-orange text-white rounded">Search</button>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {results.length === 0 && <div className="p-4 bg-white border">No results. Try a broader location.</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map(r => (
              <PropertyCard key={r.id} property={r} onBook={openConfirm} onView={viewProperty} startDate={startDate} endDate={computeEndDate(startDate, nights)} nights={nights} />
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white p-4 border">
            <h3 className="font-semibold mb-2">Map View</h3>
            <div>
              {/* interactive map using react-leaflet */}
              <MapView center={selected ? [selected.lat, selected.lng] : [-29.8587,31.0436]} zoom={selected ? 13 : 10} markers={results.map(r => ({ id: r.id, lat: r.lat, lng: r.lng, name: r.name, location: r.location }))} />
            </div>
          </div>

          <div className="bg-white p-4 border">
            <h3 className="font-semibold mb-2">Selected Property</h3>
            {selected ? (
              <div>
                <div className="font-semibold">{selected.name}</div>
                <div className="text-sm text-gray-600">{selected.location}</div>
                <div className="mt-2 text-sm">Amenities: {selected.amenities?.join(', ')}</div>
                <div className="mt-2 text-sm">
                  <div>Check-in: <span className="font-semibold">{new Date(startDate).toLocaleDateString()}</span></div>
                  <div>Check-out: <span className="font-semibold">{new Date(computeEndDate(startDate, nights)).toLocaleDateString()}</span></div>
                  <div>{nights} night{nights > 1 ? 's' : ''}</div>
                </div>
                <div className="mt-3">
                  <button onClick={() => openConfirm(selected)} className="px-3 py-2 bg-brand-orange text-white rounded">Book Now</button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">No property selected.</div>
            )}
          </div>

          <div className="bg-white p-4 border">
            <h3 className="font-semibold mb-2">Reviews</h3>
            {selected ? (
              <div>
                {reviews.length === 0 && <div className="text-sm text-gray-600">No reviews yet.</div>}
                <ul className="space-y-2">
                  {reviews.map(rv => (
                    <li key={rv.id} className="border p-2 rounded">
                      <div className="text-sm font-semibold">{rv.author} <span className="text-xs text-gray-500">{new Date(rv.createdAt).toLocaleDateString()}</span></div>
                      <div className="text-sm">{rv.comment}</div>
                    </li>
                  ))}
                </ul>
                <div className="mt-3">
                  <div className="text-sm mb-1">Leave a review</div>
                  <input className="w-full p-2 border mb-2" placeholder="Your name" value={guestName} onChange={e=>setGuestName(e.target.value)} />
                  <textarea className="w-full p-2 border mb-2" placeholder="Comment" id="rvcomment" />
                  <div className="flex gap-2">
                    <button onClick={() => {
                      const comment = document.getElementById('rvcomment')?.value || '';
                      submitReview(selected.id, 5, comment);
                      document.getElementById('rvcomment').value = '';
                    }} className="px-3 py-1 bg-brand-orange text-white rounded">Submit</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">Select a property to view reviews.</div>
            )}
          </div>
        </aside>
      </div>

      {status === 'error' && <div className="mt-3 text-red-600">Booking failed. Try again.</div>}

      {/* Confirmation modal */}
      {showConfirm && confirmProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Confirm booking</h3>
            <div className="mb-3">
              <div className="font-semibold">{confirmProperty.name}</div>
              <div className="text-sm text-gray-600">{confirmProperty.location}</div>
            </div>
            <div className="mb-3 text-sm">
              <div>Check-in: <span className="font-semibold">{new Date(startDate).toLocaleDateString()}</span></div>
              <div>Check-out: <span className="font-semibold">{new Date(computeEndDate(startDate, nights)).toLocaleDateString()}</span></div>
              <div className="mt-2">Nights: <span className="font-semibold">{nights}</span></div>
              <div className="mt-2">Price per night: <span className="font-semibold">ZAR {confirmProperty.pricePerNight}</span></div>
              <div className="mt-2">Total: <span className="font-semibold">ZAR {Number(confirmProperty.pricePerNight || 0) * Number(nights || 0)}</span></div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={()=>{ setShowConfirm(false); setConfirmProperty(null); }} className="px-3 py-1 border rounded">Cancel</button>
              <button onClick={async ()=>{ setShowConfirm(false); await handleBook(confirmProperty); setConfirmProperty(null); }} className="px-3 py-1 bg-brand-orange text-white rounded">Confirm & Pay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
