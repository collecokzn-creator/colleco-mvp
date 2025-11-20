import React, { useState, useEffect } from "react";
import { useUser } from '../context/UserContext.jsx';

export default function Analytics() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalSpent: 0,
    favoriteDestination: 'None',
    upcomingTrips: 0,
    completedTrips: 0
  });

  useEffect(() => {
    // Load analytics data from localStorage
    const bookings = JSON.parse(localStorage.getItem('colleco.bookings') || '[]');
    const travelHistory = JSON.parse(localStorage.getItem('colleco.travel.history') || '[]');
    
    const completed = travelHistory.length;
    const upcoming = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
    const totalSpent = travelHistory.reduce((sum, trip) => sum + (trip.amount || 0), 0);
    
    // Find most visited destination
    const destinations = {};
    travelHistory.forEach(trip => {
      const dest = trip.destination || 'Unknown';
      destinations[dest] = (destinations[dest] || 0) + 1;
    });
    const favoriteDestination = Object.keys(destinations).length > 0
      ? Object.keys(destinations).reduce((a, b) => destinations[a] > destinations[b] ? a : b)
      : 'None';

    setStats({
      totalTrips: completed + upcoming,
      totalSpent,
      favoriteDestination,
      upcomingTrips: upcoming,
      completedTrips: completed
    });
  }, []);

  return (
    <div className="overflow-x-hidden bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-brand-brown">Travel Analytics</h1>
          <p className="text-gray-600 mt-2">Track your travel statistics and insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Trips */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Trips</p>
                <p className="text-3xl font-bold text-brand-orange">{stats.totalTrips}</p>
              </div>
              <div className="text-4xl">✈️</div>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-3xl font-bold text-brand-orange">R {stats.totalSpent.toFixed(2)}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          {/* Upcoming Trips */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Trips</p>
                <p className="text-3xl font-bold text-green-600">{stats.upcomingTrips}</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>

          {/* Completed Trips */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-blue-600">{stats.completedTrips}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>

        {/* Favorite Destination */}
        <div className="bg-gradient-to-r from-brand-orange to-brand-gold rounded-lg shadow-md p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Favorite Destination</p>
              <p className="text-4xl font-bold mt-2">{stats.favoriteDestination}</p>
            </div>
            <div className="text-6xl">🏖️</div>
          </div>
        </div>

        {/* Charts/Graphs Placeholder */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-brand-brown mb-4">Travel Insights</h2>
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">📊 Advanced analytics coming soon!</p>
            <p className="text-sm">Charts, trends, and detailed insights will be available here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
