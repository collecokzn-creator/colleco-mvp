import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useUser } from '../context/UserContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';

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
  
  // Smart automation refs
  const autoSaveTimerRef = useRef(null);
  const lastFormDataRef = useRef(formData);
  
  // Auto-save profile edits after 3 seconds of inactivity
  useEffect(() => {
    if (!editing) return;
    
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    // Set new timer to auto-save
    autoSaveTimerRef.current = setTimeout(() => {
      // Only save if data actually changed
      if (JSON.stringify(formData) !== JSON.stringify(lastFormDataRef.current)) {
        const updatedUser = { ...user, ...formData, profilePicture };
        localStorage.setItem('colleco.user', JSON.stringify(updatedUser));
        lastFormDataRef.current = formData;
        // Silent save - no alert
      }
    }, 3000);
    
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [formData, editing, user, profilePicture]);
  
  // Smart wallet recommendations based on balance and upcoming bookings
  const walletRecommendation = useMemo(() => {
    const upcomingTotal = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    
    if (walletBalance < upcomingTotal) {
      const needed = upcomingTotal - walletBalance;
      return {
        type: 'warning',
        message: `⚠️ Top up R${needed.toFixed(2)} for upcoming bookings`
      };
    }
    
    if (walletBalance > 10000) {
      return {
        type: 'info',
        message: '💰 High balance detected. Consider using rewards points!'
      };
    }
    
    if (walletBalance === 0 && bookings.length > 0) {
      return {
        type: 'alert',
        message: '💳 Add funds to wallet for quick checkout'
      };
    }
    
    return null;
  }, [walletBalance, bookings]);
  
  // Travel pattern analysis
  const travelInsights = useMemo(() => {
    if (travelHistory.length === 0) return null;
    
    const totalTrips = travelHistory.length;
    const destinations = new Set(travelHistory.map(t => t.destination));
    const avgTripCost = travelHistory.reduce((sum, t) => sum + (t.cost || 0), 0) / totalTrips;
    
    let insight = '';
    if (totalTrips >= 5) {
      insight = `🌍 You've traveled to ${destinations.size} destinations! `;
    }
    if (avgTripCost > 5000) {
      insight += '✨ Premium traveler status available.';
    }
    
    return insight || null;
  }, [travelHistory]);
  
  // Auto-complete nationality based on phone prefix
  useEffect(() => {
    if (formData.phone && !formData.nationality) {
      const phone = formData.phone.replace(/\D/g, '');
      
      if (phone.startsWith('27')) {
        setFormData(prev => ({ ...prev, nationality: 'South Africa' }));
      } else if (phone.startsWith('1')) {
        setFormData(prev => ({ ...prev, nationality: 'United States' }));
      } else if (phone.startsWith('44')) {
        setFormData(prev => ({ ...prev, nationality: 'United Kingdom' }));
      }
    }
  }, [formData.phone, formData.nationality]);

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

  const _startCamera = async () => { // startCamera invoked via future "Capture" button
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
        
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-brown flex items-center">
            Account
            {editing && (
              <span className="ml-3 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold" title="Auto-save enabled, changes saved automatically">
                Smart Mode
              </span>
            )}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-brand-russty max-w-prose">Manage your profile, wallet balance, bookings activity and personalization settings.</p>
        </div>
        
        {/* Smart Insights */}
        {(walletRecommendation || travelInsights) && (
          <div className="mb-6 space-y-2">
            {walletRecommendation && (
              <div className={`rounded-lg p-3 text-sm ${
                walletRecommendation.type === 'warning' ? 'bg-amber-50 border border-amber-200 text-amber-800' :
                walletRecommendation.type === 'alert' ? 'bg-red-50 border border-red-200 text-red-800' :
                'bg-blue-50 border border-blue-200 text-blue-800'
              }`}>
                {walletRecommendation.message}
              </div>
            )}
            {travelInsights && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800">
                {travelInsights}
              </div>
            )}
          </div>
        )}
        
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
                  <Button
                    size="xs"
                    variant={editing ? 'primary' : 'subtle'}
                    onClick={() => editing ? handleSaveProfile() : setEditing(true)}
                  >
                    {editing ? '💾 Save' : '✏️ Edit Profile'}
                  </Button>
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
                  <Button
                    className="flex-1"
                    onClick={capturePhoto}
                  >Capture</Button>
                  <Button
                    className="flex-1"
                    variant="subtle"
                    onClick={() => {
                      const stream = videoRef.current.srcObject;
                      const tracks = stream.getTracks();
                      tracks.forEach(track => track.stop());
                      setShowCamera(false);
                    }}
                  >Cancel</Button>
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
                className="w-full px-3 py-2 border border-cream-border rounded bg-white text-brand-brown"
                placeholder="+27 XX XXX XXXX"
              />
            ) : (
              <p className="text-brand-brown">{formData.phone || 'Not set'}</p>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-brand-russty mb-1">
              Nationality
              {editing && formData.nationality && formData.phone && (
                <span className="ml-1 text-xs text-green-600">✓ Auto-detected</span>
              )}
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                className="w-full px-3 py-2 border border-cream-border rounded bg-white text-brand-brown"
                placeholder="Country"
              />
            ) : (
              <p className="text-brand-brown">{formData.nationality || 'Not set'}</p>
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
        </div>

        {/* Wallet & Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand-brown">Wallet</h3>
            <Button variant="ghost" size="xs">View History</Button>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-brand-brown">R {walletBalance.toFixed(2)}</span>
            <span className="text-sm text-brand-russty">Available Balance</span>
          </div>
          <Button fullWidth size="md">Add Funds</Button>
        </div>

        {/* Bookings Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-8">
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
              <Button as="a" href="/plan-trip" variant="subtle" size="sm">Plan a Trip</Button>
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

        {/* Quick Settings */}
        <div className="mt-6 pt-6 border-t border-cream-border">
          <h3 className="text-sm font-semibold text-brand-brown mb-3">Settings</h3>
          <div className="space-y-2">
            <Link
              to="/settings/notifications"
              className="flex items-center justify-between p-3 bg-cream-sand rounded-lg hover:bg-cream-hover transition group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🔔</span>
                <div>
                  <p className="text-sm font-medium text-brand-brown">Notifications</p>
                  <p className="text-xs text-brand-russty">Push alerts & preferences</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-brand-russty group-hover:text-brand-brown transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            <Link
              to="/settings"
              className="flex items-center justify-between p-3 bg-cream-sand rounded-lg hover:bg-cream-hover transition group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">⚙️</span>
                <div>
                  <p className="text-sm font-medium text-brand-brown">Account Settings</p>
                  <p className="text-xs text-brand-russty">Privacy & preferences</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-brand-russty group-hover:text-brand-brown transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-8 pt-6 border-t border-cream-border flex justify-center">
          <Button onClick={handleLogout} variant="ghost" size="md">Log Out</Button>
        </div>

      </div>
    </div>
  );
}
