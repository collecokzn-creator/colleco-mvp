import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '../context/UserContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [profilePicture, setProfilePicture] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    nationality: ''
  });
  const [walletBalance, setWalletBalance] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [travelHistory, setTravelHistory] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || '',
        nationality: user.nationality || ''
      });
      setProfilePicture(user.profilePicture || null);
      
      // Load wallet balance
      const savedBalance = localStorage.getItem('colleco.wallet.balance');
      if (savedBalance) setWalletBalance(parseFloat(savedBalance));
      
      // Load bookings
      const savedBookings = localStorage.getItem('colleco.bookings');
      if (savedBookings) {
        const allBookings = JSON.parse(savedBookings);
        const userBookings = allBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
        setBookings(userBookings);
      }
      
      // Load travel history
      const savedHistory = localStorage.getItem('colleco.travel.history');
      if (savedHistory) {
        setTravelHistory(JSON.parse(savedHistory));
      }
    }

    // E2E marker
    try {
      if (typeof window !== 'undefined') {
        window.__E2E_PROFILE_LOADED__ = true;
        if (document && document.body) {
          document.body.setAttribute('data-e2e-login-success', (user && user.email) || '');
        }
      }
    } catch (e) {}
  }, [user]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicture(event.target.result);
        localStorage.setItem('colleco.profile.picture', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/png');
      setProfilePicture(imageData);
      localStorage.setItem('colleco.profile.picture', imageData);
      
      // Stop camera
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      setShowCamera(false);
    }
  };

  const handleSaveProfile = () => {
    // Save updated profile
    const updatedUser = { ...user, ...formData, profilePicture };
    localStorage.setItem('colleco.user', JSON.stringify(updatedUser));
    setEditing(false);
    alert('Profile updated successfully!');
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  if (!user) {
    return (
      <div className="overflow-x-hidden">
        <div className="max-w-3xl mx-auto p-6">
          <p className="text-brand-brown">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden bg-cream min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8" data-e2e="profile-ready" data-e2e-user-email={user?.email || ''}>
        
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-brand-orange">Account</h1>
        </div>
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-border p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-cream-sand overflow-hidden border-2 border-brand-orange">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-brand-orange">
                      👤
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-orange text-white rounded-full hover:bg-brand-gold transition flex items-center justify-center text-sm"
                >
                  📷
                </button>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-brand-brown mb-1">{formData.name}</h2>
                <p className="text-brand-russty text-sm">{formData.email}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => editing ? handleSaveProfile() : setEditing(true)}
                    className="px-3 py-1.5 bg-cream-sand text-brand-brown rounded text-xs font-medium hover:bg-cream-hover transition"
                  >
                    {editing ? '💾 Save' : '✏️ Edit Profile'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {/* Camera Modal */}
          {showCamera && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                <h3 className="text-lg font-semibold mb-4 text-brand-brown">Capture Photo</h3>
                <video ref={videoRef} autoPlay className="w-full rounded-lg mb-4 bg-black"></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
                <div className="flex gap-3">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 px-4 py-2.5 bg-brand-orange text-white rounded-lg font-medium hover:bg-brand-gold transition"
                  >
                    Capture
                  </button>
                  <button
                    onClick={() => {
                      const stream = videoRef.current.srcObject;
                      const tracks = stream.getTracks();
                      tracks.forEach(track => track.stop());
                      setShowCamera(false);
                    }}
                    className="flex-1 px-4 py-2.5 bg-cream-sand text-brand-brown rounded-lg font-medium hover:bg-cream-hover transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-brand-russty mb-1">Phone</label>
            {editing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full border border-cream-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent"
              />
            ) : (
              <p className="text-brand-brown text-sm">{formData.phone || '—'}</p>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-brand-russty mb-1">Date of Birth</label>
            {editing ? (
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                className="w-full border border-cream-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent"
              />
            ) : (
              <p className="text-brand-brown text-sm">{formData.dateOfBirth || '—'}</p>
            )}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-brand-russty mb-1">Address</label>
            {editing ? (
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full border border-cream-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent"
              />
            ) : (
              <p className="text-brand-brown text-sm">{formData.address || '—'}</p>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-brand-russty mb-1">Nationality</label>
            {editing ? (
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                className="w-full border border-cream-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent"
              />
            ) : (
              <p className="text-brand-brown text-sm">{formData.nationality || '—'}</p>
            )}
          </div>
        </div>

        {/* Wallet & Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand-brown">Wallet</h3>
            <button className="text-xs text-brand-orange hover:text-brand-gold transition">View History</button>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-brand-brown">R {walletBalance.toFixed(2)}</span>
            <span className="text-sm text-brand-russty">Available Balance</span>
          </div>
          <button className="w-full py-2.5 bg-brand-orange text-white rounded-lg text-sm font-medium hover:bg-brand-gold transition">
            Add Funds
          </button>
        </div>

        {/* Bookings Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand-brown">Recent Activity</h3>
            <a href="/bookings" className="text-xs text-brand-orange hover:text-brand-gold transition">View All</a>
          </div>
          
          {bookings.length > 0 ? (
            <div className="space-y-3 mb-6">
              {bookings.slice(0, 3).map((booking, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-cream-border last:border-0">
                  <div>
                    <p className="font-medium text-brand-brown text-sm">{booking.destination || booking.title}</p>
                    <p className="text-xs text-brand-russty">{booking.date}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed' ? 'bg-cream-sand text-brand-brown' :
                    booking.status === 'pending' ? 'bg-amber-100 text-brand-russty' :
                    'bg-cream-hover text-brand-brown'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-brand-russty mb-3">No active bookings</p>
              <a href="/plan-trip" className="inline-block px-4 py-2 bg-cream-sand text-brand-brown rounded-lg text-sm font-medium hover:bg-cream-hover transition">
                Plan a Trip
              </a>
            </div>
          )}
          
          {travelHistory.length > 0 && (
            <>
              <div className="border-t border-cream-border pt-4 mt-4">
                <p className="text-xs font-medium text-brand-russty mb-3">Travel History</p>
                <div className="space-y-2">
                  {travelHistory.slice(0, 2).map((trip, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm text-brand-brown">{trip.destination}</p>
                        <p className="text-xs text-brand-russty">{trip.date}</p>
                      </div>
                      <p className="text-sm font-medium text-brand-orange">R {trip.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Logout Button */}
        <div className="mt-8 pt-6 border-t border-cream-border flex justify-center">
          <button
            onClick={handleLogout}
            className="px-6 py-3 text-brand-russty text-sm font-medium hover:text-brand-brown transition rounded-lg hover:bg-cream-sand"
          >
            Log Out
          </button>
        </div>

      </div>
    </div>
  );
}
