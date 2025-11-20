import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('colleco.wishlist');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {}
    }
  }, []);

  function removeItem(id) {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    localStorage.setItem('colleco.wishlist', JSON.stringify(updated));
  }

  return (
    <div className="overflow-x-hidden">
      <div className="max-w-7xl mx-auto max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-600 mb-4">Your wishlist is empty</p>
          <Link to="/packages" className="text-brand-orange hover:underline">Browse packages</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="border rounded-xl p-4 bg-white shadow-sm">
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              <div className="flex gap-2">
                <Link to={item.link || '/packages'} className="flex-1 px-3 py-2 bg-brand-orange text-white rounded text-sm text-center">
                  View Details
                </Link>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="px-3 py-2 bg-red-500 text-white rounded text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
