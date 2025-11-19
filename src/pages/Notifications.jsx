import React, { useState, useEffect } from 'react';
import { TripAlertCard } from '../components/mvp/EnhancementStubs';

export default function Notifications() {
  const [alerts, setAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load alerts from localStorage or API
    const savedAlerts = localStorage.getItem('colleco.alerts');
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    } else {
      // Sample alerts
      setAlerts([
        {
          id: 1,
          type: 'success',
          title: 'Booking Confirmed',
          message: 'Your flight to Johannesburg has been confirmed!',
          timestamp: Date.now() - 7200000,
          read: false
        },
        {
          id: 2,
          type: 'warning',
          title: 'Price Drop Alert',
          message: 'The package you viewed dropped by 15%!',
          timestamp: Date.now() - 3600000,
          read: false
        },
        {
          id: 3,
          type: 'info',
          title: 'Booking Reminder',
          message: 'Your trip to Cape Town is in 3 days.',
          timestamp: Date.now() - 1800000,
          read: true
        }
      ]);
    }
  }, []);

  function markAsRead(id) {
    setAlerts(prev => {
      const updated = prev.map(alert => 
        alert.id === id ? { ...alert, read: true } : alert
      );
      localStorage.setItem('colleco.alerts', JSON.stringify(updated));
      return updated;
    });
  }

  function clearAll() {
    setAlerts([]);
    localStorage.removeItem('colleco.alerts');
  }

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <div className="flex gap-3 items-center">
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
          {alerts.length > 0 && (
            <button 
              onClick={clearAll}
              className="text-sm text-red-600 hover:underline"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-xl border shadow-sm p-8 text-center">
          <p className="text-gray-500">No notifications yet. We'll notify you about important updates!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => (
            <div 
              key={alert.id}
              className={`bg-white rounded-xl border shadow-sm p-4 transition ${alert.read ? 'opacity-60' : ''}`}
              onClick={() => !alert.read && markAsRead(alert.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${
                      alert.type === 'success' ? 'bg-green-500' :
                      alert.type === 'warning' ? 'bg-yellow-500' :
                      alert.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></span>
                    <h3 className="font-semibold">{alert.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{alert.message}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                {!alert.read && (
                  <button 
                    onClick={() => markAsRead(alert.id)}
                    className="text-xs text-blue-600 hover:underline ml-4"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
