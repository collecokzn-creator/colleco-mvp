import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { c as useUser, u as useNavigate } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./icons-C4AMPM7L.js";
function CheckIn() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeBookings, setActiveBookings] = reactExports.useState([]);
  const [selectedBooking, setSelectedBooking] = reactExports.useState(null);
  const [checkInStep, setCheckInStep] = reactExports.useState("select");
  const [scanMode, setScanMode] = reactExports.useState(null);
  const [_cameraActive, setCameraActive] = reactExports.useState(false);
  const [_scanResult, setScanResult] = reactExports.useState(null);
  const [error, setError] = reactExports.useState("");
  const videoRef = reactExports.useRef(null);
  const canvasRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
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
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setScanMode(null);
  };
  const scanQRCode = () => {
    setTimeout(() => {
      if (selectedBooking) {
        handleSuccessfulScan(selectedBooking.qrCode);
      }
    }, 2e3);
  };
  const handleSuccessfulScan = (qrData) => {
    stopCamera();
    setScanResult(qrData);
    if (scanMode === "checkin") {
      const booking = activeBookings.find((b) => b.qrCode === qrData);
      if (booking) {
        setCheckInStep("success");
        setTimeout(() => {
          setCheckInStep("select");
          setScanResult(null);
        }, 3e3);
      }
    } else if (scanMode === "door") {
      setCheckInStep("success");
      setTimeout(() => {
        setCheckInStep("select");
        setScanResult(null);
      }, 3e3);
    }
  };
  const handleManualCheckIn = (booking) => {
    setSelectedBooking(booking);
    setCheckInStep("success");
    setTimeout(() => {
      setCheckInStep("select");
      setSelectedBooking(null);
    }, 3e3);
  };
  if (!user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-8 rounded-lg shadow-md text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown mb-4", children: "Please login to access check-in" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => navigate("/login"),
          className: "px-6 py-2 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-highlight transition",
          children: "Login"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-cream", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border-b border-cream-border shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-4xl mx-auto px-4 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-brand-orange to-brand-gold rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "🏨" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-brand-brown", children: "Self Check-In" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty", children: "Scan QR code or check in manually" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto px-4 py-6", children: [
      checkInStep === "success" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6 animate-fade-in", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 bg-green-500 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "✓" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-green-800 text-lg", children: scanMode === "checkin" ? "Check-In Successful!" : "Door Unlocked!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-700 text-sm", children: scanMode === "checkin" ? `Welcome to ${selectedBooking?.propertyName}! Room ${selectedBooking?.roomNumber}` : "Door will remain unlocked for 30 seconds" })
        ] })
      ] }) }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-red-700 font-semibold", children: [
        "⚠️ ",
        error
      ] }) }),
      checkInStep === "scanning" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md overflow-hidden mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-brand-brown text-white p-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: scanMode === "checkin" ? "Scan Check-In QR Code" : "Scan Door QR Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                stopCamera();
                setCheckInStep("select");
              },
              className: "px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition",
              children: "Cancel"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative bg-black aspect-video", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "video",
            {
              ref: videoRef,
              className: "w-full h-full object-cover",
              autoPlay: true,
              playsInline: true
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef, className: "hidden" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-64 h-64 border-4 border-brand-orange rounded-lg relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-0 right-0 h-1 bg-brand-orange animate-pulse" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 left-0 right-0 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white font-semibold bg-black/50 inline-block px-4 py-2 rounded-lg", children: "Position QR code within the frame" }) })
        ] })
      ] }),
      checkInStep === "select" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => selectedBooking && startCamera("checkin"),
              disabled: !selectedBooking,
              className: `p-6 rounded-lg border-2 transition-all ${selectedBooking ? "bg-white border-brand-orange hover:bg-brand-orange hover:text-white cursor-pointer" : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl", children: "📷" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-lg", children: "Scan to Check-In" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm opacity-75", children: "Scan QR code at reception" })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => selectedBooking && startCamera("door"),
              disabled: !selectedBooking,
              className: `p-6 rounded-lg border-2 transition-all ${selectedBooking ? "bg-white border-brand-gold hover:bg-brand-gold hover:text-white cursor-pointer" : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl", children: "🚪" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-lg", children: "Scan to Open Door" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm opacity-75", children: "Scan QR at your room" })
              ] })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-brand-brown mb-4", children: "Your Active Bookings" }),
          activeBookings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8 text-brand-russty", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4", children: "No active bookings found" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => navigate("/packages"),
                className: "px-6 py-2 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-highlight transition",
                children: "Browse Packages"
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: activeBookings.map((booking) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `border-2 rounded-lg p-4 transition-all cursor-pointer ${selectedBooking?.id === booking.id ? "border-brand-orange bg-brand-orange/5" : "border-cream-border hover:border-brand-orange/50"}`,
              onClick: () => setSelectedBooking(booking),
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-brand-brown text-lg", children: booking.propertyName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded", children: booking.status })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-sm text-brand-russty", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                      "🏠 Room: ",
                      booking.roomNumber
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                      "📅 Check-in: ",
                      booking.checkInDate
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                      "📅 Check-out: ",
                      booking.checkOutDate
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                      "🔑 Access Code: ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-bold text-brand-orange", children: booking.accessCode })
                    ] })
                  ] })
                ] }),
                selectedBooking?.id === booking.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      handleManualCheckIn(booking);
                    },
                    className: "px-4 py-2 bg-brand-orange text-white text-sm rounded-lg font-semibold hover:bg-brand-highlight transition whitespace-nowrap",
                    children: "Manual Check-In"
                  }
                ) })
              ] })
            },
            booking.id
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 bg-gradient-to-r from-brand-orange/10 to-brand-gold/10 rounded-lg p-6 border border-brand-orange/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-brand-brown mb-3", children: "📱 How It Works" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm text-brand-brown", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "1. Select your booking" }),
              " from the list above"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "2. Scan to Check-In:" }),
              " Use the QR code at hotel reception or check in manually"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "3. Scan to Open Door:" }),
              " Point your camera at the QR code on your room door"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "4. Access Code:" }),
              " Use the 4-digit code if QR scanning is unavailable"
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  CheckIn as default
};
//# sourceMappingURL=CheckIn-BaqdhfOa.js.map
