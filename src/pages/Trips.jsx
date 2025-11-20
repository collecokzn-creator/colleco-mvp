import React, { useState, useEffect } from "react";
import { useUser } from '../context/UserContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Trips() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Load trips from localStorage
    const bookings = JSON.parse(localStorage.getItem('colleco.bookings') || '[]');
    const travelHistory = JSON.parse(localStorage.getItem('colleco.travel.history') || '[]');
    
    // Filter upcoming trips (confirmed or pending)
    const upcoming = bookings.filter(b => 
      b.status === 'confirmed' || b.status === 'pending'
    );
    
    setUpcomingTrips(upcoming);
    setPastTrips(travelHistory);
  }, []);

  const handleViewDetails = (tripId) => {
    navigate(`/bookings`);
  };

  return (
    <div className="overflow-x-hidden bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-brand-brown">My Trips</h1>
          <p className="text-gray-600 mt-2">Manage your upcoming and past travel experiences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'upcoming'
                ? 'text-brand-orange border-b-2 border-brand-orange'
                : 'text-gray-600 hover:text-brand-brown'
            }`}
          >
            Upcoming ({upcomingTrips.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'past'
                ? 'text-brand-orange border-b-2 border-brand-orange'
                : 'text-gray-600 hover:text-brand-brown'
            }`}
          >
            Past Trips ({pastTrips.length})
          </button>
        </div>

        {/* Upcoming Trips */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingTrips.length > 0 ? (
              upcomingTrips.map((trip, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-brand-brown">
                          {trip.destination || trip.title || 'Trip'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          trip.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {trip.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-gray-600">
                        <p className="flex items-center gap-2">
                          <span>📅</span>
                          <span>{trip.date || 'Date TBD'}</span>
                        </p>
                        {trip.guests && (
                          <p className="flex items-center gap-2">
                            <span>👥</span>
                            <span>{trip.guests} guest(s)</span>
                          </p>
                        )}
                        {trip.amount && (
                          <p className="flex items-center gap-2">
                            <span>💰</span>
                            <span className="font-semibold text-brand-orange">R {trip.amount}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(trip.id)}
                      className="px-4 py-2 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-gold transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">✈️</div>
                <h3 className="text-xl font-bold text-brand-brown mb-2">No upcoming trips</h3>
                <p className="text-gray-600 mb-6">Start planning your next adventure!</p>
                <button
                  onClick={() => navigate('/plan-trip')}
                  className="px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-gold transition"
                >
                  Plan a Trip
                </button>
              </div>
            )}
          </div>
        )}

        {/* Past Trips */}
        {activeTab === 'past' && (
          <div className="space-y-4">
            {pastTrips.length > 0 ? (
              pastTrips.map((trip, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-brand-brown mb-2">
                        {trip.destination || 'Trip'}
                      </h3>
                      <div className="space-y-1 text-gray-600">
                        <p className="flex items-center gap-2">
                          <span>📅</span>
                          <span>{trip.date}</span>
                          {trip.duration && <span>• {trip.duration}</span>}
                        </p>
                        {trip.amount && (
                          <p className="flex items-center gap-2">
                            <span>💰</span>
                            <span className="font-semibold">R {trip.amount}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                      Completed
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-bold text-brand-brown mb-2">No travel history yet</h3>
                <p className="text-gray-600">Your completed trips will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
