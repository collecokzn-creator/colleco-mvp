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
    <div className="overflow-x-hidden bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto p-6" data-e2e="profile-ready" data-e2e-user-email={user?.email || ''}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-brand-brown">My Profile</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-brand-russty text-white rounded-lg font-semibold hover:bg-brand-brown transition"
          >
            🚪 Log Out
          </button>
        </div>

        {/* Profile Picture Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden border-4 border-brand-orange shadow-lg">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl text-gray-400">
                    👤
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 w-10 h-10 bg-brand-orange text-white rounded-full shadow-lg hover:bg-brand-gold transition flex items-center justify-center"
              >
                📷
              </button>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-brand-brown">{formData.name}</h2>
              <p className="text-gray-600">{formData.email}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="px-4 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-brand-gold transition"
                >
                  📁 Upload Photo
                </button>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-brand-gold transition"
                >
                  📸 Take Photo
                </button>
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
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                <h3 className="text-xl font-bold mb-4 text-brand-brown">Capture Photo</h3>
                <video ref={videoRef} autoPlay className="w-full rounded-lg mb-4"></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
                <div className="flex gap-3">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 px-4 py-2 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-gold transition"
                  >
                    📸 Capture
                  </button>
                  <button
                    onClick={() => {
                      const stream = videoRef.current.srcObject;
                      const tracks = stream.getTracks();
                      tracks.forEach(track => track.stop());
                      setShowCamera(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wallet Section */}
        <div className="bg-gradient-to-r from-brand-orange to-brand-gold rounded-lg shadow-md p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Wallet Balance</p>
              <p className="text-4xl font-bold">R {walletBalance.toFixed(2)}</p>
            </div>
            <div className="text-5xl">💳</div>
          </div>
          <div className="mt-4 flex gap-3">
            <button className="px-4 py-2 bg-white text-brand-orange rounded-lg font-semibold hover:bg-gray-100 transition text-sm">
              💰 Add Funds
            </button>
            <button className="px-4 py-2 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition text-sm">
              📊 Transaction History
            </button>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-brand-brown">Personal Information</h3>
            <button
              onClick={() => editing ? handleSaveProfile() : setEditing(true)}
              className="px-4 py-2 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-gold transition text-sm"
            >
              {editing ? '💾 Save' : '✏️ Edit'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              ) : (
                <p className="text-gray-800">{formData.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <p className="text-gray-800">{formData.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              ) : (
                <p className="text-gray-800">{formData.phone || 'Not provided'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth</label>
              {editing ? (
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              ) : (
                <p className="text-gray-800">{formData.dateOfBirth || 'Not provided'}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              ) : (
                <p className="text-gray-800">{formData.address || 'Not provided'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nationality</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              ) : (
                <p className="text-gray-800">{formData.nationality || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Current Bookings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-brand-brown mb-4">🎫 Active Bookings</h3>
          {bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((booking, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-brand-brown">{booking.destination || booking.title}</p>
                      <p className="text-sm text-gray-600">{booking.date} • {booking.guests || 1} guest(s)</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.status === 'confirmed' ? 'bg-cream-sand text-brand-brown' :
                      booking.status === 'pending' ? 'bg-amber-100 text-brand-russty' :
                      'bg-cream-hover text-brand-brown'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No active bookings. <a href="/plan-trip" className="text-brand-orange hover:underline">Plan a trip</a></p>
          )}
        </div>

        {/* Travel History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-brand-brown mb-4">🗺️ Travel History</h3>
          {travelHistory.length > 0 ? (
            <div className="space-y-3">
              {travelHistory.map((trip, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-brand-brown">{trip.destination}</p>
                      <p className="text-sm text-gray-600">{trip.date} • {trip.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-brand-orange">R {trip.amount}</p>
                      <p className="text-xs text-gray-500">Completed</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No travel history yet. Start your journey!</p>
          )}
        </div>

      </div>
    </div>
  );
}
