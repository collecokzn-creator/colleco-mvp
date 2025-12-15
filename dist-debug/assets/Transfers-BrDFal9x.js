import { r as reactExports, j as jsxRuntimeExports, R as React } from "./motion-D9fZRtSt.js";
import { B as BookingNav } from "./BookingNav-B1OTCtxJ.js";
import { F as Filter, ab as ArrowUpDown, e as Car, m as User, n as CheckCircle2, ad as Heart, G as Award, x as Star, T as TrendingUp, o as Clock, S as Shield, a as DollarSign } from "./icons-C4AMPM7L.js";
import { B as Button } from "./Button-BvBK5int.js";
import "./react-4gMnsuNC.js";
import "./index-DlOecmR0.js";
import "./pdf-DKpnIAzb.js";
const _log = (level, ...args) => {
  return;
};
function LiveMap({ pickup, dropoff, driverLocation, showRoute = true, nearbyDrivers = [], height = "400px", waypoints = [], onRouteInfo }) {
  const mapRef = reactExports.useRef(null);
  const [map, setMap] = reactExports.useState(null);
  const [_markers, setMarkers] = reactExports.useState({ pickup: null, dropoff: null, driver: null });
  const nearbyMarkersRef = reactExports.useRef([]);
  const [_waypointMarkers, _setWaypointMarkers] = reactExports.useState([]);
  const [directionsRenderer, setDirectionsRenderer] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  _log("log", "[LiveMap] Render:", { pickup, dropoff, driverLocation, showRoute, nearbyDriversCount: nearbyDrivers.length, waypointsCount: waypoints.length, mapExists: !!map });
  const initMap = reactExports.useCallback(() => {
    if (!mapRef.current || !window.google) {
      return;
    }
    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: -29.8587, lng: 31.0218 },
        // Durban default
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true
      });
      setMap(mapInstance);
      setLoading(false);
      _log("log", "[LiveMap] Map initialized successfully");
      const renderer = new window.google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: "#FF6B35",
          strokeWeight: 4
        }
      });
      setDirectionsRenderer(renderer);
    } catch (e) {
      setError("Failed to initialize map");
      setLoading(false);
    }
  }, []);
  function geocodeAddress(address, callback) {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results[0]) {
        callback(results[0].geometry.location);
      }
    });
  }
  const updateMapMarkers = reactExports.useCallback(() => {
    if (!map || !window.google) return;
    if (pickup) {
      geocodeAddress(pickup, (location) => {
        setMarkers((prev) => {
          if (prev.pickup) prev.pickup.setMap(null);
          const marker = new window.google.maps.Marker({
            position: location,
            map,
            title: "Pickup",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4CAF50",
              fillOpacity: 1,
              strokeColor: "#fff",
              strokeWeight: 2
            },
            label: {
              text: "P",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "bold"
            }
          });
          return { ...prev, pickup: marker };
        });
      });
    }
    if (dropoff) {
      geocodeAddress(dropoff, (location) => {
        setMarkers((prev) => {
          if (prev.dropoff) prev.dropoff.setMap(null);
          const marker = new window.google.maps.Marker({
            position: location,
            map,
            title: "Dropoff",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#F44336",
              fillOpacity: 1,
              strokeColor: "#fff",
              strokeWeight: 2
            },
            label: {
              text: "D",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "bold"
            }
          });
          return { ...prev, dropoff: marker };
        });
      });
    }
    if (driverLocation && driverLocation.lat && driverLocation.lng) {
      setMarkers((prev) => {
        const newPosition = { lat: driverLocation.lat, lng: driverLocation.lng };
        if (prev.driver) {
          prev.driver.setPosition(newPosition);
          return prev;
        } else {
          const marker = new window.google.maps.Marker({
            position: newPosition,
            map,
            title: "Driver",
            icon: {
              url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="18" fill="#2196F3" stroke="white" stroke-width="2"/>
                  <text x="20" y="26" font-size="20" text-anchor="middle" fill="white">🚗</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 20)
            }
          });
          return { ...prev, driver: marker };
        }
      });
    }
  }, [map, pickup, dropoff, driverLocation]);
  const drawRoute = reactExports.useCallback(() => {
    if (!directionsRenderer || !window.google) return;
    if (!pickup || !dropoff) return;
    const directionsService = new window.google.maps.DirectionsService();
    const waypointsArray = waypoints.filter((w) => w && w.trim()).map((location) => ({
      location,
      stopover: true
    }));
    directionsService.route(
      {
        origin: pickup,
        destination: dropoff,
        waypoints: waypointsArray,
        optimizeWaypoints: true,
        // Optimize route order
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(result);
          if (waypointsArray.length > 0 && result.routes[0].waypoint_order) ;
          try {
            const legs = result.routes?.[0]?.legs || [];
            const distanceMeters = legs.reduce((sum, l) => sum + (l.distance?.value || 0), 0);
            const durationSeconds = legs.reduce((sum, l) => sum + (l.duration?.value || 0), 0);
            if (typeof onRouteInfo === "function") {
              onRouteInfo({
                distanceMeters,
                durationSeconds,
                distanceText: legs.map((l) => l.distance?.text).filter(Boolean).join(" + ") || null,
                durationText: legs.map((l) => l.duration?.text).filter(Boolean).join(" + ") || null,
                legsCount: legs.length
              });
            }
          } catch (_) {
          }
        }
      }
    );
  }, [directionsRenderer, pickup, dropoff, waypoints, onRouteInfo]);
  reactExports.useEffect(() => {
    if (!window.google) {
      {
        const errorMsg = "Google Maps API key not configured. Map preview unavailable. Set VITE_GOOGLE_MAPS_API_KEY in environment variables.";
        setError(errorMsg);
        setLoading(false);
        return;
      }
    } else {
      initMap();
    }
  }, [initMap]);
  reactExports.useEffect(() => {
    if (map && window.google) {
      updateMapMarkers();
    }
  }, [updateMapMarkers, map]);
  reactExports.useEffect(() => {
    if (map && window.google && showRoute && pickup && dropoff) {
      drawRoute();
    }
  }, [drawRoute, map, showRoute, pickup, dropoff]);
  reactExports.useEffect(() => {
    if (!map || !window.google) return;
    nearbyMarkersRef.current.forEach((marker) => marker.setMap(null));
    const newNearbyMarkers = nearbyDrivers.map((driver, index) => {
      return new window.google.maps.Marker({
        position: { lat: driver.lat, lng: driver.lng },
        map,
        title: `${driver.name || "Driver"} - ${driver.eta || 5} min away`,
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="#FF9800" stroke="white" stroke-width="2"/>
              <text x="16" y="21" font-size="16" text-anchor="middle" fill="white">🚐</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        },
        zIndex: 100 + index
      });
    });
    nearbyMarkersRef.current = newNearbyMarkers;
    if (nearbyDrivers.length > 0 && pickup) {
      const bounds = new window.google.maps.LatLngBounds();
      nearbyDrivers.forEach((driver) => {
        bounds.extend({ lat: driver.lat, lng: driver.lng });
      });
      map.fitBounds(bounds);
      const listener = window.google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom() > 15) map.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [map, nearbyDrivers, pickup]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full rounded-lg overflow-hidden border-2 border-gray-300", style: { height }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: mapRef, className: "w-full h-full" }),
    loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-cream/90", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown", children: "Loading map..." })
    ] }) }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-red-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-4 max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600 font-semibold", children: "Map Not Available" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-500 mt-1 mb-3", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-600", children: [
        "To fix: Add ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "bg-white px-1 rounded text-gray-800", children: "VITE_GOOGLE_MAPS_API_KEY" }),
        " to your environment variables or GitHub repository secrets."
      ] })
    ] }) }),
    !loading && !error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg text-sm", children: nearbyDrivers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-700", children: "Nearby Shuttles" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-orange-600", children: [
        nearbyDrivers.length,
        " available"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-700", children: "Live Tracking" }),
      driverLocation && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-orange", children: "Driver location updating" })
    ] }) })
  ] });
}
function TransferChat({ requestId, role = "customer" }) {
  const [messages, setMessages] = reactExports.useState([]);
  const [newMessage, setNewMessage] = reactExports.useState("");
  const [ws, setWs] = reactExports.useState(null);
  const messagesEndRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const wsUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.hostname}:${window.location.port || "4000"}/ws/transfer/${requestId}`;
    if (!window.WebSocket) {
      startPolling();
      return;
    }
    try {
      const socket = new WebSocket(wsUrl);
      socket.onopen = () => {
        socket.send(JSON.stringify({ type: "join", requestId, role }));
      };
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "message") {
            setMessages((prev) => [...prev, data.message]);
          } else if (data.type === "history") {
            setMessages(data.messages || []);
          }
        } catch (e) {
        }
      };
      socket.onerror = () => {
        startPolling();
      };
      setWs(socket);
      return () => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    } catch (e) {
      startPolling();
    }
  }, [requestId, role, startPolling]);
  const startPolling = reactExports.useCallback(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/transfers/request/${requestId}/messages`);
        const data = await res.json();
        if (data.ok && data.messages) {
          setMessages(data.messages);
        }
      } catch (e) {
        console.error("[chat] poll failed", e);
      }
    }, 3e3);
    return () => clearInterval(interval);
  }, [requestId]);
  reactExports.useEffect(() => {
    scrollToBottom();
  }, [messages]);
  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }
  async function sendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const message = {
      id: Date.now(),
      requestId,
      from: role,
      text: newMessage,
      timestamp: Date.now()
    };
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "message", message }));
    } else {
      try {
        await fetch(`/api/transfers/request/${requestId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message })
        });
      } catch (e2) {
        console.error("[chat] send failed", e2);
      }
    }
    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full bg-white rounded-lg border shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-b bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800", children: role === "customer" ? "💬 Chat with Driver" : "💬 Chat with Customer" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50", children: [
      messages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-gray-400 text-sm py-8", children: "No messages yet. Start chatting!" }) : messages.map((msg) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `flex ${msg.from === role ? "justify-end" : "justify-start"}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `max-w-xs px-4 py-2 rounded-lg ${msg.from === role ? "bg-brand-orange text-white" : "bg-white border text-gray-800"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: msg.text }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs opacity-70 mt-1", children: new Date(msg.timestamp).toLocaleTimeString() })
              ]
            }
          )
        },
        msg.id
      )),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: messagesEndRef })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: sendMessage, className: "p-4 border-t bg-white flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: newMessage,
          onChange: (e) => setNewMessage(e.target.value),
          placeholder: "Type a message...",
          className: "flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          className: "px-6 py-2 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-gold transition",
          children: "Send"
        }
      )
    ] })
  ] });
}
function DriverRating({ requestId, driver, onSubmit }) {
  const [rating, setRating] = reactExports.useState(0);
  const [hoverRating, setHoverRating] = reactExports.useState(0);
  const [review, setReview] = reactExports.useState("");
  const [submitted, setSubmitted] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/transfers/request/${requestId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, review, driverName: driver?.name })
      });
      const data = await res.json();
      if (data.ok) {
        setSubmitted(true);
        if (onSubmit) onSubmit(data);
      }
    } catch (e2) {
      console.error("[rating] submit failed", e2);
    } finally {
      setLoading(false);
    }
  }
  if (submitted) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 bg-cream-sand border border-cream-border rounded-lg text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl mb-2", children: "✅" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: "Thank you for your feedback!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty mt-1", children: "Your rating helps us improve our service." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 bg-white border-2 border-brand-orange rounded-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold mb-4 text-brand-brown", children: "Rate Your Driver" }),
    driver && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-gray-50 rounded", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Driver" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: driver.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500", children: [
        driver.vehicle,
        " • ",
        driver.plate
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 font-semibold", children: "How was your experience?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setRating(star),
            onMouseEnter: () => setHoverRating(star),
            onMouseLeave: () => setHoverRating(0),
            className: "text-4xl transition-transform hover:scale-110",
            children: (hoverRating || rating) >= star ? "⭐" : "☆"
          },
          star
        )) }),
        rating > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mt-2", children: [
          rating === 1 && "Poor",
          rating === 2 && "Fair",
          rating === 3 && "Good",
          rating === 4 && "Very Good",
          rating === 5 && "Excellent"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 font-semibold", children: "Leave a review (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: review,
            onChange: (e) => setReview(e.target.value),
            placeholder: "Share your experience...",
            rows: 4,
            className: "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          disabled: loading || rating === 0,
          className: "w-full px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-gold transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed",
          children: loading ? "Submitting..." : "Submit Rating"
        }
      )
    ] })
  ] });
}
const __vite_import_meta_env__ = {};
function RideSelector({
  pickup,
  dropoff,
  vehicleType,
  passengers,
  onSelectRide,
  onSkip,
  onCancel
}) {
  const _log2 = (level, ...args) => {
    if (!(__vite_import_meta_env__?.VITE_DEBUG_RIDES === "1")) return;
    if (level === "error") console.error(...args);
    else if (level === "warn") console.warn(...args);
    else console.log(...args);
  };
  const [rides, setRides] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [filterBy, setFilterBy] = reactExports.useState("all");
  const [sortBy, setSortBy] = reactExports.useState("recommended");
  const [favoriteDrivers, setFavoriteDrivers] = reactExports.useState([]);
  const [selectedRide, setSelectedRide] = reactExports.useState(null);
  const [preferredBrand, setPreferredBrand] = reactExports.useState("");
  const [preferredDriver, setPreferredDriver] = reactExports.useState("");
  const fetchAvailableRides = reactExports.useCallback(async () => {
    setLoading(true);
    const useDemo = (__vite_import_meta_env__?.VITE_DEMO_SHUTTLE ?? "1") === "1";
    const generateMockRides = () => {
      const brands = [
        { name: "Uber", isPremium: false },
        { name: "Executive Transfers", isPremium: true },
        { name: "City Cabs", isPremium: false },
        { name: "VIP Shuttles", isPremium: true },
        { name: "SafeRide", isPremium: false },
        { name: "Luxury Limo Service", isPremium: true }
      ];
      const drivers = [
        "Thabo Mkhize",
        "Sipho Ndlovu",
        "Zanele Khumalo",
        "Bheki Dlamini",
        "Nomusa Zulu",
        "Jabu Mthembu",
        "Thandiwe Sithole",
        "Mandla Ngubane"
      ];
      const models = ["Toyota Corolla", "BMW 3 Series", "Mercedes E-Class", "VW Polo", "Honda Accord", "Nissan Altima"];
      const colors = ["White", "Black", "Silver", "Gray", "Blue"];
      const features = ["AC", "WiFi", "USB", "Premium Sound", "Leather Seats", "Sunroof"];
      const languages = ["English", "Zulu", "Xhosa", "Afrikaans"];
      const specialties = ["Airport Transfers", "Long Distance", "Business Travel", "Family Friendly"];
      const basePrice = 150;
      const out = [];
      for (let i = 0; i < 10; i++) {
        const brand = brands[i % brands.length];
        const driver = drivers[i % drivers.length];
        const model = models[i % models.length];
        const color = colors[i % colors.length];
        const plate = `CA ${Math.floor(1e5 + Math.random() * 9e5)}`;
        const rating = 4 + Math.random() * 1;
        const totalReviews = 50 + Math.floor(Math.random() * 500);
        const completedTrips = 100 + Math.floor(Math.random() * 1400);
        const estimatedArrival = 5 + Math.floor(Math.random() * 20);
        const isVerified = Math.random() > 0.3;
        const isSuperDriver = rating >= 4.7 && completedTrips > 500;
        const isPopular = completedTrips > 800 && rating >= 4.5;
        let priceMultiplier = 1;
        if (brand.isPremium) priceMultiplier += 0.6;
        if (vehicleType === "suv") priceMultiplier += 0.3;
        else if (vehicleType === "van") priceMultiplier += 0.5;
        else if (vehicleType === "luxury") priceMultiplier += 1;
        priceMultiplier += Math.random() * 0.2 - 0.1;
        const price = Math.round(basePrice * priceMultiplier / 5) * 5;
        const vehicleFeatures = features.filter((_, idx) => (i + idx) % 2 === 0).slice(0, 3);
        const driverLangs = languages.filter((_, idx) => (i + idx) % 2 === 0).slice(0, 2);
        const driverSpecs = specialties.filter((_, idx) => (i + idx) % 3 === 0).slice(0, 2);
        const latestReview = totalReviews > 100 && Math.random() > 0.5 ? {
          comment: "Excellent service, very professional and punctual!",
          author: "Client " + (i + 1)
        } : null;
        out.push({
          id: `RIDE-${Date.now()}-${i}`,
          driver: {
            id: `DRIVER-${i}`,
            name: driver,
            photo: null,
            isVerified,
            isSuperDriver,
            languages: driverLangs,
            specialties: driverSpecs
          },
          brand,
          vehicle: {
            model,
            color,
            plate,
            features: vehicleFeatures
          },
          price,
          rating: Number(rating.toFixed(1)),
          totalReviews,
          completedTrips,
          estimatedArrival,
          isPopular,
          latestReview
        });
      }
      return out;
    };
    try {
      _log2("log", "[RideSelector] Fetching rides for:", { pickup, dropoff, vehicleType, passengers });
      const response = await fetch("/api/transfers/available-rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup,
          dropoff,
          vehicleType,
          passengers
        })
      });
      if (response.ok) {
        const data = await response.json();
        const list = data.rides || [];
        _log2("log", "[RideSelector] Received rides:", list.length);
        setRides(list.length ? list : useDemo ? generateMockRides() : []);
      } else {
        _log2("error", "[RideSelector] Failed to fetch rides");
        setRides(useDemo ? generateMockRides() : []);
      }
    } catch (error) {
      _log2("error", "Failed to fetch rides:", error);
      setRides(useDemo ? generateMockRides() : []);
    } finally {
      setLoading(false);
    }
  }, [pickup, dropoff, vehicleType, passengers]);
  const loadFavoriteDrivers = reactExports.useCallback(() => {
    try {
      const saved = localStorage.getItem("colleco.favoriteDrivers");
      setFavoriteDrivers(saved ? JSON.parse(saved) : []);
    } catch (error) {
      _log2("error", "Failed to load favorite drivers:", error);
    }
  }, []);
  reactExports.useEffect(() => {
    fetchAvailableRides();
    loadFavoriteDrivers();
  }, [fetchAvailableRides, loadFavoriteDrivers]);
  const toggleFavoriteDriver = (driverId) => {
    const updated = favoriteDrivers.includes(driverId) ? favoriteDrivers.filter((id) => id !== driverId) : [...favoriteDrivers, driverId];
    setFavoriteDrivers(updated);
    localStorage.setItem("colleco.favoriteDrivers", JSON.stringify(updated));
  };
  const getFilteredAndSortedRides = () => {
    let filtered = [...rides];
    _log2("log", `[RideSelector] Starting filter: ${filterBy}, Total rides: ${filtered.length}`);
    if (preferredBrand.trim()) {
      const q = preferredBrand.trim().toLowerCase();
      filtered = filtered.filter((r) => (r.brand.name || "").toLowerCase().includes(q));
    }
    if (preferredDriver.trim()) {
      const qd = preferredDriver.trim().toLowerCase();
      filtered = filtered.filter((r) => (r.driver.name || "").toLowerCase().includes(qd));
    }
    if (filterBy === "favorites") {
      filtered = filtered.filter((ride) => favoriteDrivers.includes(ride.driver.id));
      _log2("log", `[RideSelector] After favorites filter: ${filtered.length}`);
    } else if (filterBy === "premium") {
      filtered = filtered.filter((ride) => ride.brand.isPremium);
      _log2("log", `[RideSelector] After premium filter: ${filtered.length}`);
    } else if (filterBy === "budget") {
      if (rides.length > 0) {
        const minPrice = Math.min(...rides.map((r) => r.price));
        _log2("log", `[RideSelector] Min price: R${minPrice}, Budget threshold: R${minPrice * 1.1}`);
        filtered = filtered.filter((ride) => ride.price <= minPrice * 1.1);
        _log2("log", `[RideSelector] After budget filter: ${filtered.length}`);
      }
    } else if (filterBy === "top_rated") {
      filtered = filtered.filter((ride) => ride.rating >= 4.5);
      _log2("log", `[RideSelector] After top_rated filter: ${filtered.length}`);
    }
    switch (sortBy) {
      case "price_low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "popularity":
        filtered.sort((a, b) => b.completedTrips - a.completedTrips);
        break;
      case "recommended":
      default:
        filtered.sort((a, b) => {
          const scoreA = a.rating / 5 * 40 + Math.min(a.completedTrips / 1e3, 1) * 30 + (favoriteDrivers.includes(a.driver.id) ? 30 : 0);
          const scoreB = b.rating / 5 * 40 + Math.min(b.completedTrips / 1e3, 1) * 30 + (favoriteDrivers.includes(b.driver.id) ? 30 : 0);
          return scoreB - scoreA;
        });
    }
    _log2("log", `[RideSelector] Final filtered count: ${filtered.length}`);
    return filtered;
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0
    }).format(amount);
  };
  const getRatingColor = (rating) => {
    if (rating >= 4.8) return "text-green-600";
    if (rating >= 4.5) return "text-blue-600";
    if (rating >= 4) return "text-yellow-600";
    return "text-gray-600";
  };
  const getPriceLabel = (price, allPrices) => {
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    if (price === minPrice) return "Lowest Price";
    if (price === maxPrice) return "Premium";
    return "Competitive";
  };
  const filteredRides = getFilteredAndSortedRides();
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/50 z-modal flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg p-8 max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center mt-4 text-gray-600", children: "Finding available rides..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/50 z-modal flex items-center justify-center p-4 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col my-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 sm:p-6 border-b bg-gradient-to-r from-brand-orange to-orange-600", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Pick Your Ride" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-white/90 text-sm", children: [
        pickup,
        " → ",
        dropoff
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b bg-cream-50 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 sm:min-w-[200px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "h-3 w-3 inline mr-1" }),
            "Filter By"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: filterBy,
              onChange: (e) => setFilterBy(e.target.value),
              className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Rides" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "favorites", children: "My Favorites" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "premium", children: "Premium Brands" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "budget", children: "Budget Options" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "top_rated", children: "Top Rated (4.5+)" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 sm:min-w-[200px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { className: "h-3 w-3 inline mr-1" }),
            "Sort By"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: sortBy,
              onChange: (e) => setSortBy(e.target.value),
              className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "recommended", children: "Recommended" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price_low", children: "Price: Low to High" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price_high", children: "Price: High to Low" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "rating", children: "Highest Rated" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "popularity", children: "Most Popular" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-600", children: [
        "Showing ",
        filteredRides.length,
        " of ",
        rides.length,
        " available rides"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-4 space-y-4", children: filteredRides.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Car, { className: "h-16 w-16 text-gray-300 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "No rides match your filters" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setFilterBy("all"),
          className: "mt-3 text-brand-orange hover:underline text-sm",
          children: "Clear filters"
        }
      )
    ] }) : filteredRides.map((ride) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        onClick: () => setSelectedRide(ride),
        className: `border rounded-lg p-4 cursor-pointer transition-all ${selectedRide?.id === ride.id ? "border-brand-orange bg-orange-50 shadow-lg" : "border-gray-200 hover:border-brand-orange hover:shadow-md"}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 sm:gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-16 sm:w-20 h-16 sm:h-20 bg-gray-200 rounded-full overflow-hidden relative", children: [
            ride.driver.photo ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: ride.driver.photo,
                alt: ride.driver.name,
                className: "w-full h-full object-cover"
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-full h-full p-4 text-gray-400" }),
            ride.driver.isVerified && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 right-0 bg-blue-500 rounded-full p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-3 w-3 text-white" }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg text-gray-900", children: ride.driver.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        toggleFavoriteDriver(ride.driver.id);
                      },
                      className: "text-gray-400 hover:text-red-500 transition-colors",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Heart,
                        {
                          className: `h-4 w-4 ${favoriteDrivers.includes(ride.driver.id) ? "fill-red-500 text-red-500" : ""}`
                        }
                      )
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-sm text-gray-600", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Car, { className: "h-3 w-3" }),
                    ride.brand.name
                  ] }),
                  ride.brand.isPremium && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-yellow-600", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-3 w-3" }),
                    "Premium"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-gray-900", children: formatCurrency(ride.price) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500", children: getPriceLabel(ride.price, rides.map((r) => r.price)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-3 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: `h-4 w-4 fill-current ${getRatingColor(ride.rating)}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-semibold ${getRatingColor(ride.rating)}`, children: ride.rating.toFixed(1) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-500", children: [
                  "(",
                  ride.totalReviews,
                  " reviews)"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-gray-600", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  ride.completedTrips.toLocaleString(),
                  " trips"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-gray-600", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "ETA: ",
                  ride.estimatedArrival,
                  " min"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-3 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: ride.vehicle.model }),
                " • ",
                ride.vehicle.color,
                " • ",
                ride.vehicle.plate
              ] }),
              ride.vehicle.features.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: ride.vehicle.features.join(" • ") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
              ride.driver.languages.map((lang) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full",
                  children: lang
                },
                lang
              )),
              ride.driver.specialties.map((specialty) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full",
                  children: specialty
                },
                specialty
              )),
              ride.isPopular && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-1 bg-orange-100 text-brand-orange text-xs rounded-full flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3 w-3" }),
                "Popular Choice"
              ] }),
              ride.driver.isSuperDriver && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3 w-3" }),
                "Super Driver"
              ] })
            ] }),
            ride.latestReview && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 italic border-l-2 border-brand-orange", children: [
              '"',
              ride.latestReview.comment,
              '" - ',
              ride.latestReview.author
            ] })
          ] })
        ] })
      },
      ride.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t bg-gray-50 flex flex-wrap justify-between items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onCancel,
            className: "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm",
            children: "Cancel"
          }
        ),
        onSkip && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => onSkip(rides),
            className: "px-4 py-2 border border-brand-orange text-brand-orange rounded-lg hover:bg-orange-50 transition-colors text-sm",
            children: "Skip for now"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => selectedRide && onSelectRide(selectedRide),
          disabled: !selectedRide,
          className: "px-3 sm:px-6 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm sm:text-base",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4" }),
            "Confirm Ride ",
            selectedRide && `- ${formatCurrency(selectedRide.price)}`
          ]
        }
      )
    ] })
  ] }) });
}
let notificationPermission = "default";
async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.warn("[notifications] Not supported in this browser");
    return false;
  }
  if (Notification.permission === "granted") {
    notificationPermission = "granted";
    return true;
  }
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    notificationPermission = permission;
    return permission === "granted";
  }
  return false;
}
function showNotification(title, options = {}) {
  if (notificationPermission !== "granted") {
    console.warn("[notifications] Permission not granted");
    return;
  }
  const defaultOptions = {
    icon: "/assets/icons/icon-192x192.png",
    badge: "/assets/icons/icon-96x96.png",
    vibrate: [200, 100, 200],
    tag: "transfer-notification",
    requireInteraction: false,
    ...options
  };
  try {
    const notification = new Notification(title, defaultOptions);
    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.onClick) {
        options.onClick();
      }
    };
    setTimeout(() => notification.close(), 1e4);
    return notification;
  } catch (e) {
    console.error("[notifications] Show failed", e);
  }
}
function notifyTransferStatus(status, request) {
  const notifications = {
    matched: {
      title: "✅ Driver Found!",
      body: "A driver has been matched to your transfer request.",
      icon: "/assets/icons/icon-192x192.png"
    },
    accepted: {
      title: "🚗 Driver Accepted",
      body: `${request?.driver?.name || "Your driver"} is preparing to pick you up.`,
      icon: "/assets/icons/icon-192x192.png"
    },
    "en-route": {
      title: "🛣️ Driver En Route",
      body: `${request?.driver?.name || "Your driver"} is on the way. ETA: ${request?.driver?.eta || "10 min"}`,
      icon: "/assets/icons/icon-192x192.png",
      requireInteraction: true
    },
    arrived: {
      title: "📍 Driver Arrived!",
      body: `${request?.driver?.name || "Your driver"} is at your pickup location.`,
      icon: "/assets/icons/icon-192x192.png",
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200]
    },
    completed: {
      title: "✅ Trip Completed",
      body: "Thank you for using CollEco Transfer! Please rate your driver.",
      icon: "/assets/icons/icon-192x192.png"
    }
  };
  const config = notifications[status];
  if (config) {
    showNotification(config.title, config);
  }
}
function Transfers() {
  const [pickup, setPickup] = reactExports.useState("");
  const [dropoff, setDropoff] = reactExports.useState("");
  const [date, setDate] = reactExports.useState("");
  const [time, setTime] = reactExports.useState("");
  const [pax, setPax] = reactExports.useState(1);
  const [vehicleType, setVehicleType] = reactExports.useState("sedan");
  const [luggage, setLuggage] = reactExports.useState(1);
  const [specialRequirements, setSpecialRequirements] = reactExports.useState("");
  const [estimatedPrice, setEstimatedPrice] = reactExports.useState(null);
  const [bookingType, setBookingType] = reactExports.useState("instant");
  const [isRoundTrip, setIsRoundTrip] = reactExports.useState(false);
  const [isMultiStop, setIsMultiStop] = reactExports.useState(false);
  const [returnDate, setReturnDate] = reactExports.useState("");
  const [returnTime, setReturnTime] = reactExports.useState("");
  const [additionalStops, setAdditionalStops] = reactExports.useState([]);
  const [multiDayService, setMultiDayService] = reactExports.useState(false);
  const [serviceDays, setServiceDays] = reactExports.useState(1);
  const [recurringDays, setRecurringDays] = reactExports.useState([]);
  const [request, setRequest] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [status, setStatus] = reactExports.useState(null);
  const [driverLocation, setDriverLocation] = reactExports.useState(null);
  const [showChat, setShowChat] = reactExports.useState(false);
  const [previousStatus, setPreviousStatus] = reactExports.useState(null);
  const [nearbyDrivers, setNearbyDrivers] = reactExports.useState([]);
  const [loadingNearby, setLoadingNearby] = reactExports.useState(false);
  const [routeInfo, setRouteInfo] = reactExports.useState(null);
  const [_formErrors, setFormErrors] = reactExports.useState({});
  const [showRideSelector, setShowRideSelector] = reactExports.useState(false);
  const [selectedRide, setSelectedRide] = reactExports.useState(null);
  const [ridePending, setRidePending] = reactExports.useState(false);
  const [availableRides, setAvailableRides] = reactExports.useState([]);
  React.useEffect(() => {
    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    requestNotificationPermission();
  }, []);
  React.useEffect(() => {
    if (multiDayService) {
      if (recurringDays.length > 0) {
        setServiceDays(recurringDays.length);
      }
    }
  }, [recurringDays, multiDayService]);
  async function fetchNearbyDrivers(location) {
    if (!location || location.length < 3) {
      setNearbyDrivers([]);
      return;
    }
    setLoadingNearby(true);
    try {
      const res = await fetch(`/api/transfers/nearby?location=${encodeURIComponent(location)}`);
      const data = await res.json();
      if (data.ok && data.drivers) {
        setNearbyDrivers(data.drivers);
      } else {
        setNearbyDrivers([]);
      }
    } catch (e) {
      console.error("[transfers] fetch nearby drivers failed", e);
      setNearbyDrivers([]);
    } finally {
      setLoadingNearby(false);
    }
  }
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchNearbyDrivers(pickup);
    }, 500);
    return () => clearTimeout(timer);
  }, [pickup]);
  const estimatePrice = React.useCallback(async () => {
    try {
      const stops = additionalStops.filter((s) => s.trim());
      const res = await fetch("/api/transfers/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickup, dropoff, vehicleType, pax, luggage, isRoundTrip, additionalStops: stops })
      });
      const data = await res.json();
      if (data.ok && data.estimate) {
        setEstimatedPrice(data.estimate);
      }
    } catch (e) {
      console.error("[transfers] price estimation failed", e);
    }
  }, [pickup, dropoff, vehicleType, pax, luggage, isRoundTrip, additionalStops]);
  React.useEffect(() => {
    if (pickup && dropoff && pickup.length > 3 && dropoff.length > 3) {
      const timer = setTimeout(() => {
        estimatePrice();
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setEstimatedPrice(null);
    }
  }, [pickup, dropoff, vehicleType, pax, luggage, isRoundTrip, additionalStops, estimatePrice]);
  async function cancelRequest() {
    if (!request?.id) return;
    const confirmed = confirm("Are you sure you want to cancel this transfer request?");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/transfers/request/${request.id}/cancel`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.ok) {
        setStatus(null);
        setRequest(null);
        setDriverLocation(null);
        alert("Transfer request cancelled successfully.");
      }
    } catch (e) {
      console.error("[transfers] cancel failed", e);
      alert("Failed to cancel request. Please try again.");
    }
  }
  async function submitRequest(e) {
    e.preventDefault();
    const errors = {};
    if (!pickup || pickup.length < 3) errors.pickup = "Please enter a valid pickup location";
    if (!dropoff || dropoff.length < 3) errors.dropoff = "Please enter a valid dropoff location";
    if (bookingType === "prearranged" && !date) errors.date = "Please select a date";
    if (bookingType === "prearranged" && !time) errors.time = "Please select a time";
    if (pax < 1 || pax > 12) errors.pax = "Passengers must be between 1 and 12";
    if (luggage < 0 || luggage > 20) errors.luggage = "Luggage count must be between 0 and 20";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setShowRideSelector(true);
  }
  function handleSkipRideSelection(rides) {
    setAvailableRides(rides);
    setShowRideSelector(false);
    setRidePending(true);
    setSelectedRide(null);
  }
  async function autoAssignCheapestRide() {
    if (!availableRides || availableRides.length === 0) {
      alert("No available rides to assign. Please try again.");
      return;
    }
    const cheapestRide = availableRides.reduce(
      (min, ride) => ride.price < min.price ? ride : min
    );
    await confirmRideSelection(cheapestRide);
  }
  function reopenRideSelector() {
    setRidePending(false);
    setShowRideSelector(true);
  }
  async function confirmRideSelection(ride) {
    setSelectedRide(ride);
    setShowRideSelector(false);
    setRidePending(false);
    setLoading(true);
    setStatus("searching");
    try {
      const payload = {
        pickup,
        dropoff,
        date: bookingType === "instant" ? (/* @__PURE__ */ new Date()).toISOString() : date,
        time: bookingType === "instant" ? (/* @__PURE__ */ new Date()).toISOString() : time,
        pax,
        vehicleType,
        luggage,
        specialRequirements: specialRequirements.trim(),
        bookingType,
        isRoundTrip,
        isMultiStop,
        additionalStops: isMultiStop ? additionalStops.filter((s) => s.trim()) : [],
        returnDate: isRoundTrip ? returnDate : null,
        returnTime: isRoundTrip ? returnTime : null,
        multiDayService,
        serviceDays: multiDayService ? serviceDays : 1,
        recurringDays: multiDayService ? recurringDays : [],
        // Include selected ride details
        selectedRide: {
          rideId: ride.id,
          driverId: ride.driver.id,
          driverName: ride.driver.name,
          brandId: ride.brand.id,
          brandName: ride.brand.name,
          vehicleModel: ride.vehicle.model,
          vehiclePlate: ride.vehicle.plate,
          agreedPrice: ride.price
        }
      };
      const res = await fetch("/api/transfers/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.ok) {
        setRequest(data.request);
        setStatus("matched");
        pollStatus(data.request.id);
      } else {
        setStatus("error");
      }
    } catch (e) {
      console.error("[transfers] request failed", e);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }
  async function pollStatus(requestId) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/transfers/request/${requestId}`);
        const data = await res.json();
        if (data.ok && data.request) {
          setRequest(data.request);
          const newStatus = data.request.status;
          if (newStatus !== previousStatus && newStatus !== "searching") {
            notifyTransferStatus(newStatus, data.request);
            setPreviousStatus(newStatus);
          }
          setStatus(newStatus);
          if (data.request.driverLocation) {
            setDriverLocation(data.request.driverLocation);
          }
          if (newStatus === "completed" || newStatus === "cancelled") {
            clearInterval(interval);
          }
        }
      } catch (e) {
        console.error("[transfers] status poll failed", e);
      }
    }, 3e3);
    setTimeout(() => clearInterval(interval), 3e5);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream min-h-screen overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BookingNav, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl sm:text-4xl font-bold tracking-tight text-brand-brown", children: "Shuttle & Transfers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm sm:text-base text-brand-russty max-w-prose", children: "Request instant or scheduled transport, multi-stop journeys, and monitor live driver progress." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-brand-brown mb-4", children: "Booking Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setBookingType("instant"),
              className: `p-4 rounded-lg border-2 transition-all ${bookingType === "instant" ? "border-brand-orange bg-brand-orange/5 shadow-sm" : "border-cream-border hover:border-brand-orange/50 hover:bg-cream"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-brand-brown", children: "Instant Request" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-brand-russty mt-1", children: "Book now" })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setBookingType("prearranged"),
              className: `p-4 rounded-lg border-2 transition-all ${bookingType === "prearranged" ? "border-brand-orange bg-brand-orange/5 shadow-sm" : "border-cream-border hover:border-brand-orange/50 hover:bg-cream"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-brand-brown", children: "Prearranged" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-brand-russty mt-1", children: "Schedule ahead" })
              ] })
            }
          )
        ] })
      ] }),
      bookingType === "prearranged" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Multi-Day Service" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 cursor-pointer mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: multiDayService,
              onChange: (e) => setMultiDayService(e.target.checked),
              className: "w-5 h-5 accent-brand-orange rounded"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-brand-brown", children: "Enable Multi-Day Booking" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty", children: "Book recurring shuttle service for multiple days (discounts apply)" })
          ] })
        ] }),
        multiDayService && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 pt-4 border-t border-cream-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Number of Days" }),
            recurringDays.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2 rounded-lg border-2 border-brand-orange bg-brand-orange/5 text-brand-brown font-semibold w-20 text-center", children: serviceDays }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-brand-russty", children: "auto from selected days" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                min: 2,
                max: 30,
                value: serviceDays,
                onChange: (e) => setServiceDays(Number(e.target.value)),
                className: "w-32 border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block mb-3 text-sm font-semibold text-brand-brown", children: [
              "Recurring Days ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-russty font-normal", children: "(Optional)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  if (recurringDays.includes(idx)) {
                    setRecurringDays(recurringDays.filter((d) => d !== idx));
                  } else {
                    setRecurringDays([...recurringDays, idx]);
                  }
                },
                className: `px-4 py-2 rounded-lg text-sm font-semibold transition-all ${recurringDays.includes(idx) ? "bg-brand-orange text-white shadow-sm" : "border-2 border-cream-border text-brand-brown hover:border-brand-orange/50 hover:bg-cream"}`,
                children: day
              },
              day
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-russty mt-2", children: "Select specific days for recurring service" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 bg-green-50 border-2 border-green-200 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-green-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Multi-day discount:" }),
            " ",
            serviceDays >= 7 ? "20%" : serviceDays >= 3 ? "15%" : "10%",
            " off"
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-6", onSubmit: submitRequest, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-brand-brown mb-6", children: "Journey Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Pickup Location" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: pickup,
                  onChange: (e) => setPickup(e.target.value),
                  required: true,
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors",
                  placeholder: "e.g. King Shaka Airport"
                }
              )
            ] }),
            pickup && pickup.length >= 3 && !status && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-brand-brown", children: loadingNearby ? "Finding nearby shuttles..." : `${nearbyDrivers.length} shuttle${nearbyDrivers.length !== 1 ? "s" : ""} available near you` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-2 border-cream-border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                LiveMap,
                {
                  pickup,
                  nearbyDrivers,
                  showRoute: false,
                  height: "300px"
                }
              ) }),
              nearbyDrivers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-green-50 border-2 border-green-200 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-green-800 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Shuttles available in your area." }),
                " Average ETA: ",
                Math.min(...nearbyDrivers.map((d) => d.eta || 10)),
                " min"
              ] }) }),
              !loadingNearby && nearbyDrivers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-yellow-800 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "No shuttles currently in this area." }),
                " You can still submit a request and we'll notify nearby drivers."
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Dropoff Location" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: dropoff,
                  onChange: (e) => setDropoff(e.target.value),
                  required: true,
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors",
                  placeholder: "e.g. Oyster Box Hotel"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: isMultiStop,
                  onChange: (e) => {
                    setIsMultiStop(e.target.checked);
                    if (!e.target.checked) setAdditionalStops([]);
                  },
                  className: "w-5 h-5 accent-brand-orange rounded"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-brand-brown", children: "Add Multiple Stops" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty", children: "Visit multiple locations in one trip" })
              ] })
            ] }) }),
            isMultiStop && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-4 border-t border-cream-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-semibold text-brand-brown", children: "Additional Stops" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    size: "sm",
                    onClick: () => setAdditionalStops([...additionalStops, ""]),
                    disabled: additionalStops.length >= 5,
                    children: "Add Stop"
                  }
                )
              ] }),
              additionalStops.map((stop, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-brand-russty w-6", children: [
                  index + 1,
                  "."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: stop,
                    onChange: (e) => {
                      const newStops = [...additionalStops];
                      newStops[index] = e.target.value;
                      setAdditionalStops(newStops);
                    },
                    className: "flex-1 border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors",
                    placeholder: `Stop ${index + 1} location`
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    size: "sm",
                    variant: "danger",
                    onClick: () => setAdditionalStops(additionalStops.filter((_, i) => i !== index)),
                    children: "✕"
                  }
                )
              ] }, index)),
              additionalStops.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-blue-50 border-2 border-blue-200 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-blue-800", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Total stops:" }),
                " ",
                additionalStops.length + 2,
                " (Pickup → ",
                additionalStops.length,
                " stop",
                additionalStops.length !== 1 ? "s" : "",
                " → Dropoff)"
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: isRoundTrip,
                  onChange: (e) => setIsRoundTrip(e.target.checked),
                  className: "w-5 h-5 accent-brand-orange rounded"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-brand-brown", children: "Round Trip" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty", children: "Add a return journey (15% discount)" })
              ] })
            ] }) }),
            bookingType === "prearranged" && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Pickup Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "date",
                    value: date,
                    onChange: (e) => setDate(e.target.value),
                    required: true,
                    className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Pickup Time" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "time",
                    value: time,
                    onChange: (e) => setTime(e.target.value),
                    required: true,
                    className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                  }
                )
              ] })
            ] }) }),
            isRoundTrip && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-4 border-t border-cream-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-brand-brown", children: "Return Journey" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Return Date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "date",
                      value: returnDate,
                      onChange: (e) => setReturnDate(e.target.value),
                      required: bookingType === "prearranged",
                      min: date,
                      className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Return Time" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "time",
                      value: returnTime,
                      onChange: (e) => setReturnTime(e.target.value),
                      required: bookingType === "prearranged",
                      className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-green-50 border-2 border-green-200 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-green-800", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Round trip discount:" }),
                " 15% off total fare"
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Passengers" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  min: 1,
                  max: 12,
                  value: pax,
                  onChange: (e) => setPax(Number(e.target.value)),
                  required: true,
                  className: "w-32 border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-brand-brown", children: "Vehicle Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: vehicleType,
                onChange: (e) => setVehicleType(e.target.value),
                required: true,
                className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors",
                "aria-label": "Select vehicle type",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "sedan", children: "Sedan (1-4 passengers)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "suv", children: "SUV (1-6 passengers)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "van", children: "Van/Minibus (7-12 passengers)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "luxury", children: "Luxury Sedan (1-4 passengers)" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "luggage", className: "block text-sm font-medium text-brand-brown", children: "Luggage Pieces" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: "luggage",
                type: "number",
                min: 0,
                max: 20,
                value: luggage,
                onChange: (e) => setLuggage(Number(e.target.value)),
                className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors",
                "aria-label": "Number of luggage pieces"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "specialRequirements", className: "block text-sm font-medium text-brand-brown", children: [
              "Special Requirements ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 text-xs", children: "(optional)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                id: "specialRequirements",
                value: specialRequirements,
                onChange: (e) => setSpecialRequirements(e.target.value),
                placeholder: "Child seat, wheelchair accessible, pet friendly, etc.",
                rows: 2,
                maxLength: 200,
                className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors resize-none",
                "aria-label": "Special requirements for the transfer"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
              specialRequirements.length,
              "/200 characters"
            ] })
          ] }),
          estimatedPrice && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 bg-cream-sand border-2 border-brand-orange rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown font-medium", children: "Estimated Price" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mt-1", children: "Final price may vary based on traffic and actual route" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-brand-orange", children: [
                "R",
                estimatedPrice.amount
              ] }),
              estimatedPrice.distance && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-600", children: [
                estimatedPrice.distance,
                " km • ",
                estimatedPrice.duration
              ] })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "submit",
            fullWidth: true,
            disabled: loading,
            children: loading ? "Sending Request..." : bookingType === "instant" ? "Request Now" : "Schedule Transfer"
          }
        )
      ] }),
      ridePending && !status && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 p-6 border-2 border-brand-orange rounded-lg bg-orange-50 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-lg text-brand-brown mb-1", children: "Transfer Pending - Finalize Your Ride" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty", children: "Your transfer details are saved. Choose your preferred ride to proceed." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg p-4 mb-4 border border-cream-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Pickup" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: pickup })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Dropoff" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: dropoff })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Passengers" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-brand-brown", children: [
              pax,
              " passenger",
              pax !== 1 ? "s" : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Vehicle Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown capitalize", children: vehicleType })
          ] }),
          estimatedPrice && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Estimated Price Range" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold text-brand-orange text-lg", children: [
              "R",
              estimatedPrice.amount
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              fullWidth: true,
              onClick: reopenRideSelector,
              className: "flex items-center justify-center gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Car, { className: "h-4 w-4" }),
                "Pick My Ride"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              fullWidth: true,
              variant: "outline",
              onClick: autoAssignCheapestRide,
              className: "flex items-center justify-center gap-2 border-brand-orange text-brand-orange hover:bg-orange-50",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4" }),
                "Auto-assign Cheapest Ride"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-center text-gray-600 mt-2", children: "You can also proceed with other bookings and finalize this transfer later." })
        ] })
      ] }),
      status && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 p-5 border border-cream-border rounded-lg bg-white shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-3 h-3 rounded-full ${status === "searching" ? "bg-yellow-500 animate-pulse" : status === "matched" || status === "accepted" ? "bg-brand-orange" : status === "en-route" ? "bg-brand-gold animate-pulse" : status === "arrived" ? "bg-cream-sand" : status === "completed" ? "bg-brand-brown" : "bg-brand-russty"}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-bold text-lg text-brand-brown", children: [
            status === "searching" && "🔍 Finding available drivers...",
            status === "matched" && "✅ Driver matched!",
            status === "accepted" && "✅ Driver accepted your request",
            status === "en-route" && "🚗 Driver is on the way",
            status === "arrived" && "📍 Driver has arrived",
            status === "completed" && "✅ Trip completed",
            status === "error" && "❌ Request failed"
          ] })
        ] }),
        request && request.driver && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Driver:" }),
            " ",
            request.driver.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Vehicle:" }),
            " ",
            request.driver.vehicle,
            " (",
            request.driver.plate,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Vehicle Type:" }),
            " ",
            vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Passengers:" }),
            " ",
            pax,
            " | ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Luggage:" }),
            " ",
            luggage,
            " pieces"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "ETA:" }),
            " ",
            request.driver.eta || "Calculating..."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Price:" }),
            " R",
            request.price
          ] }),
          specialRequirements && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Special Requirements:" }),
            " ",
            specialRequirements
          ] }),
          (status === "matched" || status === "accepted" || status === "en-route" || status === "arrived") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LiveMap,
              {
                pickup: request.pickup,
                dropoff: request.dropoff,
                driverLocation,
                waypoints: request.additionalStops || [],
                showRoute: true,
                onRouteInfo: setRouteInfo
              }
            ),
            routeInfo && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 p-3 bg-white border border-cream-border rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-brand-brown flex gap-4 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Distance:" }),
                " ",
                (routeInfo.distanceMeters / 1e3).toFixed(1),
                " km"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Duration:" }),
                " ",
                routeInfo.durationText || `${Math.round(routeInfo.durationSeconds / 60)} min`
              ] })
            ] }) }),
            request.additionalStops && request.additionalStops.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 p-2 bg-cream-sand border border-cream-border rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-brand-brown", children: [
              "📍 Multi-stop route with ",
              request.additionalStops.length,
              " additional stop",
              request.additionalStops.length !== 1 ? "s" : ""
            ] }) })
          ] }),
          (status === "searching" || status === "matched") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              fullWidth: true,
              onClick: cancelRequest,
              className: "border-red-500 text-red-600 hover:bg-red-50",
              children: "❌ Cancel Request"
            }
          ) }),
          (status === "accepted" || status === "en-route" || status === "arrived") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                className: "flex-1",
                onClick: () => setShowChat(!showChat),
                children: [
                  "💬 ",
                  showChat ? "Hide Chat" : "Chat with Driver"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", children: "📞 Call" })
          ] }),
          showChat && request.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 h-96", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TransferChat, { requestId: request.id, role: "customer" }) }),
          status === "accepted" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 p-3 bg-cream-sand rounded border border-cream-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown text-xs", children: "Driver is preparing to pick you up. You'll receive updates as they approach." }) }),
          status === "en-route" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 p-3 bg-amber-100 rounded border border-brand-gold", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-brand-brown text-xs", children: [
            "Driver is en route to your pickup location. ETA: ",
            request.driver.eta
          ] }) }),
          status === "arrived" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 p-3 bg-cream-sand rounded border border-cream-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown text-xs font-semibold", children: "Driver has arrived at your pickup location!" }) })
        ] }),
        status === "searching" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "We're notifying all available drivers in your area. This may take a moment..." }),
        status === "completed" && request.driver && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          DriverRating,
          {
            requestId: request.id,
            driver: request.driver,
            onSubmit: () => {
            }
          }
        ) })
      ] }),
      selectedRide && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-6 mt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-brand-brown mb-4", children: "Transfer Terms & Conditions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown mb-1", children: "Cancellation Policy" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Free cancellation up to 2 hours before pickup" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "50% refund for cancellations 30min-2 hours before pickup" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "No refund for cancellations within 30 minutes of pickup" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown mb-1", children: "Payment Terms" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Full payment required at time of booking" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Loyalty discounts apply for round-trip and multi-day bookings" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Prices include all taxes and service fees" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown mb-1", children: "Transfer Provider Policies" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Valid ID required for all passengers" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Vehicle capacity limits strictly enforced" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Driver may refuse service if safety requirements not met" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Additional luggage surcharges may apply" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown mb-1", children: "Important Information" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Be ready 10 minutes before scheduled pickup" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Contact driver immediately if running late" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Multi-stop routes: Specify order and time at each stop" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Lost items: Report to driver immediately" })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-3", children: "Need Assistance?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 bg-green-50 border border-green-200 rounded-lg p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-green-900", children: "During Transfer - Contact Driver Directly" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-800 mb-3", children: "For pickup coordination, delays, or route questions:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-green-700 font-medium", children: [
                "Driver: ",
                selectedRide.driver.name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-600", children: "Contact via in-app chat or phone once matched" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-orange-50 border-2 border-brand-orange rounded-lg p-4 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-6 w-6 text-brand-orange", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-brand-brown text-lg", children: "Zola - 24/7 Instant Help" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown mb-3", children: "Get instant answers about your booking, changes, cancellations, refunds, payment issues, and recommendations. Zola handles most requests immediately and routes complex issues to the right specialist." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => {
                  window.dispatchEvent(new CustomEvent("openAIAgent"));
                  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                },
                className: "w-full bg-brand-orange text-white font-semibold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }),
                  "Chat with Zola Now"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mt-2 text-center", children: "Available 24/7 • Instant responses • Handles booking changes, queries & recommendations" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5 text-gray-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium text-gray-700 text-sm", children: "Need to Speak to a Specialist?" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mb-3", children: "If Zola can't resolve your issue, you'll be connected to our team:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "Email Support" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-700", children: "support@colleco.co.za" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Zola routes to specialist" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "Phone (Escalations)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-700", children: "+27 31 123 4567" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Mon-Fri: 9AM-5PM" })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    showRideSelector && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RideSelector,
      {
        pickup,
        dropoff,
        vehicleType,
        passengers: pax,
        onSelectRide: confirmRideSelection,
        onSkip: handleSkipRideSelection,
        onCancel: () => setShowRideSelector(false)
      }
    )
  ] });
}
export {
  Transfers as default
};
//# sourceMappingURL=Transfers-BrDFal9x.js.map
