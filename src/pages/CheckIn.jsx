import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function CheckIn() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeBookings, setActiveBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [checkInStep, setCheckInStep] = useState("select"); // select, scanning, success
  const [scanMode, setScanMode] = useState(null); // checkin, door
  const [_cameraActive, setCameraActive] = useState(false); // cameraActive used internally for UI toggle soon
  const [_scanResult, setScanResult] = useState(null); // scanResult tracked after live QR integration
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Mock active bookings - in production, fetch from API
  useEffect(() => {
    const mockBookings = [
      {
        id: "BK001",
        propertyName: "Sea View Hotel",
        roomNumber: "305",
        checkInDate: "2024-12-01",
        checkOutDate: "2024-12-03",
        status: "confirmed",
        qrCode: "SEAVIEW-305-BK001",
        accessCode: "8742"
      },
      {
        id: "BK002",
        propertyName: "Safari Lodge",
        roomNumber: "12",
        checkInDate: "2024-12-05",
        checkOutDate: "2024-12-08",
        status: "confirmed",
        qrCode: "SAFARI-12-BK002",
        accessCode: "5931"
      }
    ];
    setActiveBookings(mockBookings);
  }, []);

  // Initialize camera for QR scanning
  const startCamera = async (mode) => {
    setError("");
    setScanMode(mode);
    setCameraActive(true);
    setCheckInStep("scanning");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        // Start scanning for QR codes
        scanQRCode();
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
      setCameraActive(false);
      setCheckInStep("select");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setScanMode(null);
  };

  // Simulate QR code scanning
  const scanQRCode = () => {
    // In production, use a QR scanning library like jsQR or html5-qrcode
    // For now, simulate successful scan after 2 seconds
    setTimeout(() => {
      if (selectedBooking) {
        handleSuccessfulScan(selectedBooking.qrCode);
      }
    }, 2000);
  };

  const handleSuccessfulScan = (qrData) => {
    stopCamera();
    setScanResult(qrData);
    
    if (scanMode === "checkin") {
      // Process check-in
      const booking = activeBookings.find(b => b.qrCode === qrData);
      if (booking) {
        setCheckInStep("success");
        // Update booking status
        setTimeout(() => {
          setCheckInStep("select");
          setScanResult(null);
        }, 3000);
      }
    } else if (scanMode === "door") {
      // Unlock door
      setCheckInStep("success");
      setTimeout(() => {
        setCheckInStep("select");
        setScanResult(null);
      }, 3000);
    }
  };

  const handleManualCheckIn = (booking) => {
    setSelectedBooking(booking);
    setCheckInStep("success");
    setTimeout(() => {
      setCheckInStep("select");
      setSelectedBooking(null);
    }, 3000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-brand-brown mb-4">Please login to access check-in</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-highlight transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-cream-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-orange to-brand-gold rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏨</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-brown">Self Check-In</h1>
              <p className="text-sm text-brand-russty">Scan QR code or check in manually</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Success Message */}
        {checkInStep === "success" && (
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <div>
                <h3 className="font-bold text-green-800 text-lg">
                  {scanMode === "checkin" ? "Check-In Successful!" : "Door Unlocked!"}
                </h3>
                <p className="text-green-700 text-sm">
                  {scanMode === "checkin" 
                    ? `Welcome to ${selectedBooking?.propertyName}! Room ${selectedBooking?.roomNumber}`
                    : "Door will remain unlocked for 30 seconds"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-semibold">⚠️ {error}</p>
          </div>
        )}

        {/* Camera Scanning View */}
        {checkInStep === "scanning" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-brand-brown text-white p-4 flex items-center justify-between">
              <h3 className="font-semibold">
                {scanMode === "checkin" ? "Scan Check-In QR Code" : "Scan Door QR Code"}
              </h3>
              <button
                onClick={() => {
                  stopCamera();
                  setCheckInStep("select");
                }}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
            <div className="relative bg-black aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-4 border-brand-orange rounded-lg relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
                  
                  {/* Scanning line animation */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-brand-orange animate-pulse"></div>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white font-semibold bg-black/50 inline-block px-4 py-2 rounded-lg">
                  Position QR code within the frame
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Booking Selection */}
        {checkInStep === "select" && (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => selectedBooking && startCamera("checkin")}
                disabled={!selectedBooking}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedBooking
                    ? "bg-white border-brand-orange hover:bg-brand-orange hover:text-white cursor-pointer"
                    : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl">📷</span>
                  <span className="font-bold text-lg">Scan to Check-In</span>
                  <span className="text-sm opacity-75">Scan QR code at reception</span>
                </div>
              </button>

              <button
                onClick={() => selectedBooking && startCamera("door")}
                disabled={!selectedBooking}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedBooking
                    ? "bg-white border-brand-gold hover:bg-brand-gold hover:text-white cursor-pointer"
                    : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl">🚪</span>
                  <span className="font-bold text-lg">Scan to Open Door</span>
                  <span className="text-sm opacity-75">Scan QR at your room</span>
                </div>
              </button>
            </div>

            {/* Active Bookings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-brand-brown mb-4">Your Active Bookings</h2>
              
              {activeBookings.length === 0 ? (
                <div className="text-center py-8 text-brand-russty">
                  <p className="mb-4">No active bookings found</p>
                  <button
                    onClick={() => navigate("/packages")}
                    className="px-6 py-2 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-highlight transition"
                  >
                    Browse Packages
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                        selectedBooking?.id === booking.id
                          ? "border-brand-orange bg-brand-orange/5"
                          : "border-cream-border hover:border-brand-orange/50"
                      }`}
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-brand-brown text-lg">
                              {booking.propertyName}
                            </h3>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                              {booking.status}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-brand-russty">
                            <p>🏠 Room: {booking.roomNumber}</p>
                            <p>📅 Check-in: {booking.checkInDate}</p>
                            <p>📅 Check-out: {booking.checkOutDate}</p>
                            <p>🔑 Access Code: <span className="font-mono font-bold text-brand-orange">{booking.accessCode}</span></p>
                          </div>
                        </div>
                        
                        {selectedBooking?.id === booking.id && (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleManualCheckIn(booking);
                              }}
                              className="px-4 py-2 bg-brand-orange text-white text-sm rounded-lg font-semibold hover:bg-brand-highlight transition whitespace-nowrap"
                            >
                              Manual Check-In
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="mt-6 bg-gradient-to-r from-brand-orange/10 to-brand-gold/10 rounded-lg p-6 border border-brand-orange/20">
              <h3 className="font-bold text-brand-brown mb-3">📱 How It Works</h3>
              <div className="space-y-2 text-sm text-brand-brown">
                <p><strong>1. Select your booking</strong> from the list above</p>
                <p><strong>2. Scan to Check-In:</strong> Use the QR code at hotel reception or check in manually</p>
                <p><strong>3. Scan to Open Door:</strong> Point your camera at the QR code on your room door</p>
                <p><strong>4. Access Code:</strong> Use the 4-digit code if QR scanning is unavailable</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
