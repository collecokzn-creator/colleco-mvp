import React, { useState } from 'react';

export default function DriverRating({ requestId, driver, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/transfers/request/${requestId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, review, driverName: driver?.name })
      });

      const data = await res.json();
      
      if (data.ok) {
        setSubmitted(true);
        if (onSubmit) onSubmit(data);
      }
    } catch (e) {
      console.error('[rating] submit failed', e);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="p-6 bg-cream-sand border border-cream-border rounded-lg text-center">
        <div className="text-4xl mb-2">✅</div>
        <p className="font-semibold text-brand-brown">Thank you for your feedback!</p>
        <p className="text-sm text-brand-russty mt-1">Your rating helps us improve our service.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border-2 border-brand-orange rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-brand-brown">Rate Your Driver</h3>
      
      {driver && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Driver</p>
          <p className="font-semibold">{driver.name}</p>
          <p className="text-sm text-gray-500">{driver.vehicle} • {driver.plate}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold">How was your experience?</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-4xl transition-transform hover:scale-110"
              >
                {(hoverRating || rating) >= star ? '⭐' : '☆'}
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2 font-semibold">Leave a review (optional)</label>
          <textarea
            value={review}
            onChange={e => setReview(e.target.value)}
            placeholder="Share your experience..."
            rows={4}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange"
          />
        </div>

        <button
          type="submit"
          disabled={loading || rating === 0}
          className="w-full px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-gold transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Rating'}
        </button>
      </form>
    </div>
  );
}
