import React from 'react';

export default function PropertyCard({ property, onBook, onView, startDate, endDate, nights }) {
  if (!property) return null;
  return (
    <div className="border rounded overflow-hidden bg-white shadow-sm">
      <div className="h-44 bg-gray-100 overflow-hidden">
        <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{property.name}</h3>
          <div className="text-sm text-brand-brown">{property.location}</div>
        </div>
        <p className="text-sm text-gray-600 mt-2">{property.description || 'Comfortable stay with modern amenities.'}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-700">{property.amenities?.slice(0,3).join(' · ')}</div>
          <div className="text-right">
            <div className="text-sm text-gray-500">From</div>
            <div className="font-semibold text-brand-orange">ZAR {property.pricePerNight}</div>
          </div>
        </div>
        {startDate && endDate && (
          <div className="mt-2 text-sm text-gray-600">{new Date(startDate).toLocaleDateString()} → {new Date(endDate).toLocaleDateString()} • {nights} night{nights > 1 ? 's' : ''}</div>
        )}

        <div className="mt-3 flex gap-2">
          <button onClick={() => onView && onView(property)} className="px-3 py-1 bg-white border rounded text-sm">View</button>
          <button onClick={() => onBook && onBook(property)} className="px-3 py-1 bg-brand-orange text-white rounded text-sm">Book</button>
        </div>
      </div>
    </div>
  );
}
