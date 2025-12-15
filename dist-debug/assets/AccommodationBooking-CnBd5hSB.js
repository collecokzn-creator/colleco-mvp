import { r as reactExports, j as jsxRuntimeExports, R as React } from "./motion-D9fZRtSt.js";
import { B as BookingNav } from "./BookingNav-B1OTCtxJ.js";
import { M as MapPin, C as Calendar, U as Users, X, aq as SlidersHorizontal, ar as List, t as Home, as as Map, x as Star, G as Award, ad as Heart, T as TrendingUp, n as CheckCircle2, aj as Wifi, at as Waves, au as Utensils, av as ParkingCircle, aw as Dumbbell, ak as Coffee, E as Sparkles, W as ChevronDown, a9 as Trash2, p as Plus, o as Clock, a as DollarSign } from "./icons-C4AMPM7L.js";
import { B as Button } from "./Button-BvBK5int.js";
import { E as ErrorBoundary, o as processBookingRewards } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
const __vite_import_meta_env__ = {};
function AccommodationSelector({ onSelectProperty, onSkip, onCancel, location, checkIn, checkOut, guests }) {
  const [properties, setProperties] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [sortBy, setSortBy] = reactExports.useState("recommended");
  const [favoriteProperties, setFavoriteProperties] = reactExports.useState([]);
  const [selectedProperty, setSelectedProperty] = reactExports.useState(null);
  const [minStars, setMinStars] = reactExports.useState(0);
  const [maxStars, setMaxStars] = reactExports.useState(5);
  const [priceRange, setPriceRange] = reactExports.useState([0, 1e4]);
  const [minRating, setMinRating] = reactExports.useState(0);
  const [propertyTypes, setPropertyTypes] = reactExports.useState([]);
  const [requiredAmenities, setRequiredAmenities] = reactExports.useState([]);
  const [freeCancellation, setFreeCancellation] = reactExports.useState(false);
  const [breakfastIncluded, setBreakfastIncluded] = reactExports.useState(false);
  const [mealPlanFilter, setMealPlanFilter] = reactExports.useState("");
  const [propertyMealPlans, setPropertyMealPlans] = reactExports.useState({});
  const [showFilters, setShowFilters] = reactExports.useState(false);
  const isMobile = window.innerWidth < 768;
  const [viewMode, setViewMode] = reactExports.useState(isMobile ? "grid" : "list");
  const [hoveredProperty, setHoveredProperty] = reactExports.useState(null);
  const googleMapsAreaUrl = location ? `https://www.google.com/maps/search/?api=1&query=hotels+accommodation+${encodeURIComponent(location)}` : null;
  reactExports.useEffect(() => {
    const saved = localStorage.getItem("colleco.favoriteProperties");
    if (saved) {
      try {
        setFavoriteProperties(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load favorites", e);
      }
    }
  }, []);
  reactExports.useEffect(() => {
    if (!location || !checkIn || !checkOut || !guests) return;
    setLoading(true);
    const generateMockProperties = () => {
      const propertyTypes2 = ["Hotel", "Guesthouse", "B&B", "Lodge", "Resort", "Apartment"];
      const propertyNames = [
        "The Oyster Box",
        "Beverly Hills Hotel",
        "Southern Sun",
        "Protea Hotel",
        "Garden Court",
        "African Pride",
        "City Lodge",
        "Premier Hotel",
        "Coastlands Musgrave",
        "Quarters Hotel",
        "Durban Hilton",
        "Holiday Inn",
        "Radisson Blu",
        "The Edward Hotel",
        "Blue Waters Hotel"
      ];
      const locations = [
        "Umhlanga Rocks, Durban",
        "Durban Beachfront",
        "Gateway, Umhlanga",
        "Ballito, KZN",
        "Durban North",
        "Morningside, Durban",
        "Westville, Durban",
        "Pinetown, Durban",
        "Umdloti Beach"
      ];
      const amenitiesList = [
        ["Free WiFi", "Pool", "Breakfast", "Parking", "Restaurant", "Gym", "Spa", "Room Service"],
        ["Free WiFi", "Pool", "Breakfast", "Parking", "Bar", "Beach Access"],
        ["Free WiFi", "Breakfast", "Parking", "Garden", "BBQ"],
        ["Free WiFi", "Pool", "Breakfast", "Parking", "Restaurant", "Gym", "Beach Access"],
        ["Free WiFi", "Pool", "Breakfast", "Parking", "Conference Room", "Business Center"],
        ["Free WiFi", "Breakfast", "Parking", "Pet Friendly", "Laundry", "Kitchen"],
        ["Free WiFi", "Pool", "Spa", "Restaurant", "Bar", "Beach Access", "Room Service"]
      ];
      const basePrice = 1200;
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1e3 * 60 * 60 * 24)));
      const propertyCount = 12 + Math.floor(Math.random() * 6);
      return Array.from({ length: propertyCount }, (_, index) => {
        const stars = 3 + Math.floor(Math.random() * 3);
        const type = propertyTypes2[index % propertyTypes2.length];
        const name = propertyNames[index % propertyNames.length];
        const address = locations[index % locations.length];
        const amenities = amenitiesList[index % amenitiesList.length];
        let priceMultiplier = 0.5 + stars / 5 * 1.5;
        if (type === "Resort" || type === "Lodge") priceMultiplier += 0.3;
        if (amenities.includes("Spa")) priceMultiplier += 0.2;
        if (amenities.includes("Beach Access")) priceMultiplier += 0.15;
        priceMultiplier += Math.random() * 0.3 - 0.15;
        const pricePerNight = Math.round(basePrice * priceMultiplier / 50) * 50;
        const totalPrice = pricePerNight * nights;
        const rating = 3.5 + Math.random() * 1.5;
        const reviewCount = 50 + Math.floor(Math.random() * 950);
        const distanceKm = 0.5 + Math.random() * 15;
        const isPremier = stars === 5 && rating >= 4.7;
        const ecoFriendly = Math.random() > 0.7;
        const isPopular = reviewCount > 500 && rating >= 4.5;
        const hasFreeCancellation = Math.random() > 0.4;
        const hasBreakfast = amenities.includes("Breakfast");
        const availableMealPlans = ["room_only"];
        if (stars >= 2) availableMealPlans.push("breakfast");
        if (stars >= 3 && (type === "Hotel" || type === "Resort" || type === "Lodge")) {
          availableMealPlans.push("half_board");
        }
        if (stars >= 4 && (type === "Hotel" || type === "Resort")) {
          availableMealPlans.push("full_board");
        }
        if (stars === 5 && type === "Resort") {
          availableMealPlans.push("all_inclusive");
        }
        const baseCoords = { lat: -29.8587, lng: 31.0218 };
        const latOffset = (Math.random() - 0.5) * 0.1;
        const lngOffset = (Math.random() - 0.5) * 0.1;
        return {
          id: `PROP-${Date.now()}-${index}`,
          name,
          type,
          stars,
          address,
          rating: Number(rating.toFixed(1)),
          reviewCount,
          pricePerNight,
          totalPrice,
          amenities,
          isPremier,
          ecoFriendly,
          isPopular,
          hasFreeCancellation,
          hasBreakfast,
          availableMealPlans,
          distanceKm: Number(distanceKm.toFixed(1)),
          imageUrl: null,
          checkIn,
          checkOut,
          nights,
          availableRooms: 1 + Math.floor(Math.random() * 5),
          lastBookedMinutesAgo: Math.random() > 0.6 ? Math.floor(Math.random() * 120) : null,
          coordinates: {
            lat: baseCoords.lat + latOffset,
            lng: baseCoords.lng + lngOffset
          }
        };
      });
    };
    const useDemo = (__vite_import_meta_env__?.VITE_DEMO_ACCOMMODATION ?? "1") === "1";
    fetch("/api/accommodation/available-properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location, checkIn, checkOut, guests })
    }).then((res) => res.ok ? res.json() : Promise.reject(new Error("bad status"))).then((data) => {
      const props = data.properties || [];
      const finalProps = props.length ? props : useDemo ? generateMockProperties() : [];
      setProperties(finalProps);
      if (finalProps.length) {
        const prices = finalProps.map((p) => p.pricePerNight);
        setPriceRange([Math.min(...prices), Math.max(...prices)]);
      }
    }).catch(() => {
      const mockProps = useDemo ? generateMockProperties() : [];
      setProperties(mockProps);
      if (mockProps.length) {
        const prices = mockProps.map((p) => p.pricePerNight);
        setPriceRange([Math.min(...prices), Math.max(...prices)]);
      }
    }).finally(() => setLoading(false));
  }, [location, checkIn, checkOut, guests]);
  const toggleFavorite = (propertyId) => {
    const updated = favoriteProperties.includes(propertyId) ? favoriteProperties.filter((id) => id !== propertyId) : [...favoriteProperties, propertyId];
    setFavoriteProperties(updated);
    localStorage.setItem("colleco.favoriteProperties", JSON.stringify(updated));
  };
  const getFilteredAndSortedProperties = () => {
    let filtered = [...properties];
    if (minStars > 0) filtered = filtered.filter((p) => p.stars >= minStars);
    if (maxStars < 5) filtered = filtered.filter((p) => p.stars <= maxStars);
    if (minRating > 0) filtered = filtered.filter((p) => p.rating >= minRating);
    if (propertyTypes.length > 0) filtered = filtered.filter((p) => propertyTypes.includes(p.type));
    if (requiredAmenities.length > 0) {
      filtered = filtered.filter(
        (p) => requiredAmenities.every((a) => (p.amenities || []).includes(a))
      );
    }
    if (freeCancellation) filtered = filtered.filter((p) => p.hasFreeCancellation);
    if (breakfastIncluded) filtered = filtered.filter((p) => p.hasBreakfast);
    if (mealPlanFilter) {
      filtered = filtered.filter(
        (p) => p.availableMealPlans && p.availableMealPlans.includes(mealPlanFilter)
      );
    }
    filtered = filtered.filter(
      (p) => p.pricePerNight >= priceRange[0] && p.pricePerNight <= priceRange[1]
    );
    switch (sortBy) {
      case "price_low":
        filtered.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case "price_high":
        filtered.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "stars":
        filtered.sort((a, b) => b.stars - a.stars);
        break;
      case "distance":
        filtered.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
        break;
      case "recommended":
      default:
        filtered.sort((a, b) => {
          const scoreA = a.rating / 5 * 40 + a.stars / 5 * 30 + Math.min(a.reviewCount / 1e3, 1) * 20 + (1 - a.pricePerNight / 1e4) * 10;
          const scoreB = b.rating / 5 * 40 + b.stars / 5 * 30 + Math.min(b.reviewCount / 1e3, 1) * 20 + (1 - b.pricePerNight / 1e4) * 10;
          return scoreB - scoreA;
        });
    }
    return filtered;
  };
  const clearFilters = () => {
    setMinStars(0);
    setMaxStars(5);
    setMinRating(0);
    setPropertyTypes([]);
    setRequiredAmenities([]);
    setFreeCancellation(false);
    setBreakfastIncluded(false);
    setMealPlanFilter("");
    if (properties.length) {
      properties.map((p) => p.pricePerNight);
      setPriceRange([Math.min(...properties.map((p) => p.pricePerNight)), Math.max(...properties.map((p) => p.pricePerNight))]);
    }
  };
  const getActiveFilterCount = () => {
    let count = 0;
    if (minStars > 0) count++;
    if (maxStars < 5) count++;
    if (minRating > 0) count++;
    if (propertyTypes.length > 0) count++;
    if (requiredAmenities.length > 0) count++;
    if (freeCancellation) count++;
    if (breakfastIncluded) count++;
    if (mealPlanFilter) count++;
    return count;
  };
  const formatCurrency = (amount) => `R${amount.toLocaleString()}`;
  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return "Exceptional";
    if (rating >= 4) return "Excellent";
    if (rating >= 3.5) return "Very Good";
    if (rating >= 3) return "Good";
    return "Average";
  };
  const getMealPlanLabel = (plan) => {
    const labels = {
      "room_only": "Room Only",
      "breakfast": "Bed & Breakfast",
      "half_board": "Half Board (B&B + Dinner)",
      "full_board": "Full Board (B, L & D)",
      "all_inclusive": "All Inclusive"
    };
    return labels[plan] || plan;
  };
  const getMealPlanPrice = (basePrice, plan) => {
    const multipliers = {
      "room_only": 1,
      "breakfast": 1.15,
      "half_board": 1.35,
      "full_board": 1.55,
      "all_inclusive": 1.85
    };
    return Math.round(basePrice * (multipliers[plan] || 1) / 50) * 50;
  };
  const getAmenityIcon = (amenity) => {
    const lower = amenity.toLowerCase();
    if (lower.includes("wifi")) return /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { className: "h-3 w-3" });
    if (lower.includes("pool")) return /* @__PURE__ */ jsxRuntimeExports.jsx(Waves, { className: "h-3 w-3" });
    if (lower.includes("breakfast") || lower.includes("restaurant")) return /* @__PURE__ */ jsxRuntimeExports.jsx(Utensils, { className: "h-3 w-3" });
    if (lower.includes("parking")) return /* @__PURE__ */ jsxRuntimeExports.jsx(ParkingCircle, { className: "h-3 w-3" });
    if (lower.includes("gym")) return /* @__PURE__ */ jsxRuntimeExports.jsx(Dumbbell, { className: "h-3 w-3" });
    if (lower.includes("coffee") || lower.includes("bar")) return /* @__PURE__ */ jsxRuntimeExports.jsx(Coffee, { className: "h-3 w-3" });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-3 w-3" });
  };
  const filteredProperties = getFilteredAndSortedProperties();
  const activeFilters = getActiveFilterCount();
  const demoModeHint = (__vite_import_meta_env__?.VITE_DEMO_ACCOMMODATION ?? "1") === "1" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 inline mr-2" }),
    "Demo mode active - showing sample properties"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/50 z-modal flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 sm:p-6 border-b bg-gradient-to-r from-brand-orange to-orange-600", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Find Your Perfect Stay" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-4 text-white/90 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: location })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              checkIn,
              " → ",
              checkOut
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              guests,
              " guest",
              guests !== 1 ? "s" : ""
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onCancel,
          className: "text-white/80 hover:text-white transition-colors",
          title: "Close",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-6 w-6" })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 sm:p-4 border-b bg-gray-50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center justify-between gap-2 mb-2 sm:mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 sm:gap-3 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowFilters(!showFilters),
            className: `flex items-center gap-2 px-3 sm:px-4 py-2 border-2 rounded-lg transition-all ${showFilters || activeFilters > 0 ? "border-brand-orange bg-brand-orange text-white" : "border-gray-300 bg-white hover:border-brand-orange"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Filters" }),
              activeFilters > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-white text-brand-orange px-2 py-0.5 rounded-full text-xs font-bold", children: activeFilters })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: sortBy,
            onChange: (e) => setSortBy(e.target.value),
            className: "px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-orange focus:outline-none text-sm sm:text-base",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "recommended", children: "Recommended" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price_low", children: "Price: Low to High" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price_high", children: "Price: High to Low" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "rating", children: "Highest Rated" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "stars", children: "Most Stars" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "distance", children: "Closest First" })
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 sm:gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setViewMode("list"),
              className: `p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-brand-orange text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`,
              title: "List view",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "h-5 w-5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setViewMode("grid"),
              className: `p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-brand-orange text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`,
              title: "Grid view (Best for mobile)",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Home, { className: "h-5 w-5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setViewMode("map"),
              className: `p-2 rounded-lg transition-colors ${viewMode === "map" ? "bg-brand-orange text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`,
              title: "Map view",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { className: "h-5 w-5" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs sm:text-sm text-gray-600", children: [
          filteredProperties.length,
          " of ",
          properties.length
        ] })
      ] })
    ] }),
    showFilters && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 sm:p-4 border-b bg-cream/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Star Rating" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: [3, 4, 5].map((star) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setMinStars(minStars === star ? 0 : star),
              className: `px-3 py-2 rounded-lg border-2 transition-all ${minStars === star ? "border-brand-orange bg-brand-orange text-white" : "border-gray-300 bg-white hover:border-brand-orange"}`,
              children: [
                star,
                "+ ★"
              ]
            },
            star
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Guest Rating" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: [0, 3.5, 4, 4.5].map((rating) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setMinRating(minRating === rating ? 0 : rating),
              className: `px-3 py-2 rounded-lg border-2 transition-all text-sm ${minRating === rating ? "border-brand-orange bg-brand-orange text-white" : "border-gray-300 bg-white hover:border-brand-orange"}`,
              children: rating === 0 ? "Any" : `${rating}+`
            },
            rating
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Property Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: ["Hotel", "Resort", "Guesthouse", "B&B"].map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setPropertyTypes(
                (prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
              ),
              className: `px-3 py-1 rounded-full border text-sm transition-all ${propertyTypes.includes(type) ? "border-brand-orange bg-brand-orange text-white" : "border-gray-300 bg-white hover:border-brand-orange"}`,
              children: type
            },
            type
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Meal Plan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: mealPlanFilter,
              onChange: (e) => setMealPlanFilter(e.target.value),
              className: "w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-orange focus:outline-none text-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Any Meal Plan" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "room_only", children: "Room Only" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "breakfast", children: "Bed & Breakfast" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "half_board", children: "Half Board (Breakfast + Dinner)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "full_board", children: "Full Board (All Meals)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all_inclusive", children: "All Inclusive" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Quick Filters" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: freeCancellation,
                  onChange: (e) => setFreeCancellation(e.target.checked),
                  className: "w-4 h-4 accent-brand-orange rounded"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Free Cancellation" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: breakfastIncluded,
                  onChange: (e) => setBreakfastIncluded(e.target.checked),
                  className: "w-4 h-4 accent-brand-orange rounded"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Breakfast Included" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Amenities" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: ["Free WiFi", "Pool", "Breakfast", "Parking", "Gym", "Spa", "Restaurant", "Beach Access"].map((amenity) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setRequiredAmenities(
              (prev) => prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
            ),
            className: `flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${requiredAmenities.includes(amenity) ? "border-brand-orange bg-brand-orange text-white" : "border-gray-300 bg-white hover:border-brand-orange"}`,
            children: [
              getAmenityIcon(amenity),
              amenity
            ]
          },
          amenity
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: [
          "Price per Night: ",
          formatCurrency(priceRange[0]),
          " - ",
          formatCurrency(priceRange[1])
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "range",
            min: properties.length ? Math.min(...properties.map((p) => p.pricePerNight)) : 0,
            max: properties.length ? Math.max(...properties.map((p) => p.pricePerNight)) : 1e4,
            value: priceRange[1],
            onChange: (e) => setPriceRange([priceRange[0], Number(e.target.value)]),
            className: "w-full accent-brand-orange"
          }
        )
      ] }),
      activeFilters > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: clearFilters,
          className: "mt-4 text-sm text-brand-orange hover:underline font-medium",
          children: "Clear all filters"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-2 sm:p-4 min-h-0", children: [
      demoModeHint,
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-4 border-brand-orange border-t-transparent" }) }) : filteredProperties.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Home, { className: "h-16 w-16 text-gray-300 mx-auto mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-gray-700 mb-2", children: "No properties found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 mb-4", children: "Try adjusting your filters or search criteria" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 justify-center", children: [
          activeFilters > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: clearFilters,
              className: "px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600",
              children: "Clear Filters"
            }
          ),
          googleMapsAreaUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: googleMapsAreaUrl,
              target: "_blank",
              rel: "noreferrer",
              className: "px-4 py-2 border-2 border-brand-orange text-brand-orange rounded-lg hover:bg-orange-50",
              children: "View on Google Maps"
            }
          )
        ] })
      ] }) : viewMode === "map" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full min-h-[600px] rounded-lg overflow-hidden border-2 border-gray-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "iframe",
          {
            src: `https://www.google.com/maps/embed/v1/search?key=${"demo"}&q=hotels+in+${encodeURIComponent(location)}&zoom=12`,
            className: "w-full h-full",
            style: { border: 0, minHeight: "600px" },
            allowFullScreen: true,
            loading: "lazy",
            referrerPolicy: "no-referrer-when-downgrade",
            title: "Property locations map"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 left-0 right-0 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-2xl p-4 max-h-64 overflow-y-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold text-brand-brown mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-brand-orange" }),
            filteredProperties.length,
            " Properties on Map"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            filteredProperties.slice(0, 5).map((property) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `p-3 border rounded-lg cursor-pointer transition-all ${selectedProperty?.id === property.id ? "border-brand-orange bg-orange-50" : "border-gray-200 hover:border-brand-orange hover:bg-gray-50"}`,
                onClick: () => setSelectedProperty(property),
                onMouseEnter: () => setHoveredProperty(property.id),
                onMouseLeave: () => setHoveredProperty(null),
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-sm text-brand-brown truncate", children: property.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center", children: Array.from({ length: property.stars }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 text-yellow-500 fill-current" }, i)) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "•" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-brand-orange", children: property.rating.toFixed(1) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-500", children: [
                          "(",
                          property.reviewCount,
                          ")"
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1 text-xs text-gray-600", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        property.distanceKm,
                        " km away"
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right flex-shrink-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold text-brand-orange", children: formatCurrency(property.pricePerNight) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500", children: "/night" })
                  ] })
                ] })
              },
              property.id
            )),
            filteredProperties.length > 5 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setViewMode("list"),
                className: "w-full text-center text-sm text-brand-orange hover:underline py-2",
                children: [
                  "View all ",
                  filteredProperties.length,
                  " properties in list"
                ]
              }
            )
          ] })
        ] }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4", children: filteredProperties.map((property, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          tabIndex: 0,
          className: `border-2 rounded-xl bg-white transition-all cursor-pointer ${selectedProperty?.id === property.id ? "border-brand-orange shadow-lg" : "border-gray-200 hover:border-brand-orange hover:shadow-md"} ${viewMode === "list" ? "flex gap-4 p-4" : "p-4"}`,
          onClick: () => setSelectedProperty(property),
          onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSelectedProperty(property);
            }
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex-shrink-0 ${viewMode === "list" ? "w-48 h-48" : "w-full h-48 mb-3"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Home, { className: "h-12 w-12 text-gray-400" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown", children: property.name }),
                    property.isPremier && /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-5 w-5 text-yellow-500", title: "Premier Property" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-1", children: property.type }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center", children: Array.from({ length: property.stars }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 text-yellow-500 fill-current" }, i)) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "|" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3 text-gray-500" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-600", children: [
                      property.distanceKm,
                      " km from center"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      toggleFavorite(property.id);
                    },
                    className: "p-2 hover:bg-gray-100 rounded-full transition-colors",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Heart,
                      {
                        className: `h-5 w-5 ${favoriteProperties.includes(property.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`
                      }
                    )
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 px-2 py-1 bg-brand-orange text-white rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: property.rating.toFixed(1) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-gray-900", children: getRatingLabel(property.rating) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500", children: [
                    property.reviewCount,
                    " reviews"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-3", children: [
                property.amenities.slice(0, viewMode === "list" ? 6 : 4).map((amenity, idx2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: "flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full",
                    children: [
                      getAmenityIcon(amenity),
                      amenity
                    ]
                  },
                  idx2
                )),
                property.amenities.length > (viewMode === "list" ? 6 : 4) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500 px-2 py-1", children: [
                  "+",
                  property.amenities.length - (viewMode === "list" ? 6 : 4),
                  " more"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-3", children: [
                property.hasFreeCancellation && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium", children: "Free Cancellation" }),
                property.isPopular && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-1 bg-orange-100 text-brand-orange text-xs rounded-full font-medium flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3 w-3" }),
                  "Popular"
                ] }),
                property.ecoFriendly && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium", children: "Eco-Friendly" }),
                property.lastBookedMinutesAgo && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium", children: [
                  "Booked ",
                  property.lastBookedMinutesAgo,
                  "m ago"
                ] })
              ] }),
              property.availableMealPlans && property.availableMealPlans.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-700 mb-1 block", children: "Meal Plan" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "select",
                  {
                    value: propertyMealPlans[property.id] || "room_only",
                    onChange: (e) => {
                      e.stopPropagation();
                      setPropertyMealPlans({
                        ...propertyMealPlans,
                        [property.id]: e.target.value
                      });
                    },
                    onClick: (e) => e.stopPropagation(),
                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange",
                    children: property.availableMealPlans.map((plan) => {
                      const planPrice = getMealPlanPrice(property.pricePerNight, plan);
                      const planLabel = getMealPlanLabel(plan);
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: plan, children: [
                        planLabel,
                        " - ",
                        formatCurrency(planPrice),
                        "/night"
                      ] }, plan);
                    })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto pt-3 border-t flex items-end justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500 mb-1", children: [
                    property.nights,
                    " night",
                    property.nights !== 1 ? "s" : ""
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold text-brand-orange", children: formatCurrency(getMealPlanPrice(property.pricePerNight, propertyMealPlans[property.id] || "room_only")) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600", children: "/night" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500", children: [
                    "Total: ",
                    formatCurrency(getMealPlanPrice(property.totalPrice, propertyMealPlans[property.id] || "room_only"))
                  ] }),
                  propertyMealPlans[property.id] && propertyMealPlans[property.id] !== "room_only" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-brand-orange font-medium mt-1", children: [
                    "• ",
                    getMealPlanLabel(propertyMealPlans[property.id])
                  ] })
                ] }),
                property.availableRooms <= 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-red-600 font-medium", children: [
                  "Only ",
                  property.availableRooms,
                  " left!"
                ] })
              ] })
            ] })
          ]
        },
        property.id
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 sm:p-4 border-t bg-gray-50 flex flex-wrap justify-between items-center gap-2 sm:gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onCancel,
            className: "px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors",
            children: "Cancel"
          }
        ),
        onSkip && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => onSkip(properties),
            className: "px-4 py-2 border-2 border-brand-orange text-brand-orange rounded-lg hover:bg-orange-50 transition-colors",
            children: "Skip for now"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => {
            if (selectedProperty) {
              const selectedMealPlan = propertyMealPlans[selectedProperty.id] || "room_only";
              const adjustedPrice = getMealPlanPrice(selectedProperty.pricePerNight, selectedMealPlan);
              const adjustedTotal = getMealPlanPrice(selectedProperty.totalPrice, selectedMealPlan);
              onSelectProperty({
                ...selectedProperty,
                selectedMealPlan,
                pricePerNight: adjustedPrice,
                totalPrice: adjustedTotal
              });
            }
          },
          disabled: !selectedProperty,
          className: "px-3 sm:px-6 py-2 sm:py-3 bg-brand-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-semibold text-sm sm:text-base",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-5 w-5" }),
            selectedProperty ? `Book ${selectedProperty.name} - ${formatCurrency(getMealPlanPrice(selectedProperty.totalPrice, propertyMealPlans[selectedProperty.id] || "room_only"))}` : "Select a Property"
          ]
        }
      )
    ] })
  ] }) });
}
function MealSelector({
  onMealsSelected,
  headCount = 1,
  nights = 1,
  bookingType = "FIT"
}) {
  const [mealItems, setMealItems] = reactExports.useState({});
  const [packages, setPackages] = reactExports.useState({});
  const [selectedMode, setSelectedMode] = reactExports.useState("none");
  const [selectedPackage, setSelectedPackage] = reactExports.useState(null);
  const [selectedItems, setSelectedItems] = reactExports.useState([]);
  const [customItems, setCustomItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const [expandedCategory, setExpandedCategory] = reactExports.useState(null);
  const [pricing, setPricing] = reactExports.useState(null);
  reactExports.useEffect(() => {
    async function loadMealOptions() {
      try {
        const [itemsRes, packagesRes] = await Promise.all([
          fetch("/api/meals/items"),
          fetch("/api/meals/packages")
        ]);
        if (itemsRes.ok && packagesRes.ok) {
          const itemsData = await itemsRes.json();
          const packagesData = await packagesRes.json();
          setMealItems(itemsData);
          setPackages(packagesData);
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to load meal options:", err);
        setError("Failed to load meal options");
        setLoading(false);
      }
    }
    loadMealOptions();
  }, []);
  const calculatePricing = reactExports.useCallback(async () => {
    if (selectedMode === "none") {
      setPricing(null);
      onMealsSelected([]);
      return;
    }
    try {
      let response;
      if (selectedMode === "package" && selectedPackage) {
        response = await fetch("/api/meals/calculate-package", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packageId: selectedPackage,
            headCount: bookingType === "Groups" ? headCount : 1,
            nights
          })
        });
      } else if (selectedMode === "alacarte" && selectedItems.length > 0) {
        response = await fetch("/api/meals/calculate-alacarte", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemIds: selectedItems,
            headCount
          })
        });
      } else if (selectedMode === "custom" && customItems.length > 0) {
        response = await fetch("/api/meals/calculate-custom", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mealRequirements: customItems,
            headCount
          })
        });
      }
      if (response?.ok) {
        const data = await response.json();
        setPricing(data);
        onMealsSelected(data);
      }
    } catch (err) {
      console.error("Failed to calculate pricing:", err);
    }
  }, [selectedMode, selectedPackage, selectedItems, customItems, headCount, nights, bookingType, onMealsSelected]);
  reactExports.useEffect(() => {
    calculatePricing();
  }, [calculatePricing]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-500", children: "Loading meal options..." });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-red-500", children: error });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-brand-brown mb-3", children: "Meal Plan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "radio",
              name: "mealMode",
              value: "none",
              checked: selectedMode === "none",
              onChange: (e) => {
                setSelectedMode(e.target.value);
                setSelectedPackage(null);
                setSelectedItems([]);
                setCustomItems([]);
              },
              className: "w-4 h-4"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700", children: "No meals (room only)" })
        ] }),
        packages.accommodation && packages.accommodation.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "radio",
                name: "mealMode",
                value: "package",
                checked: selectedMode === "package",
                onChange: (e) => setSelectedMode(e.target.value),
                className: "w-4 h-4"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700", children: "Meal packages" })
          ] }),
          selectedMode === "package" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-7 space-y-2 mt-2", children: packages.accommodation.map((pkg) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "radio",
                name: "package",
                value: pkg.id,
                checked: selectedPackage === pkg.id,
                onChange: (e) => setSelectedPackage(e.target.value),
                className: "w-4 h-4"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-brand-brown", children: pkg.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600", children: pkg.description })
            ] })
          ] }, pkg.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "radio",
              name: "mealMode",
              value: "alacarte",
              checked: selectedMode === "alacarte",
              onChange: (e) => setSelectedMode(e.target.value),
              className: "w-4 h-4"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700", children: "À la carte items" })
        ] }),
        selectedMode === "alacarte" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-7 space-y-3 mt-2", children: Object.entries(mealItems).map(([category, items]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setExpandedCategory(expandedCategory === category ? null : category),
              className: "flex items-center gap-2 text-sm font-semibold text-brand-brown hover:text-orange-600",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ChevronDown,
                  {
                    className: `h-4 w-4 transition-transform ${expandedCategory === category ? "rotate-180" : ""}`
                  }
                ),
                category.charAt(0).toUpperCase() + category.slice(1)
              ]
            }
          ),
          expandedCategory === category && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-6 space-y-2 mt-2", children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: selectedItems.includes(item.id),
                onChange: (e) => {
                  if (e.target.checked) {
                    setSelectedItems([...selectedItems, item.id]);
                  } else {
                    setSelectedItems(selectedItems.filter((id) => id !== item.id));
                  }
                },
                className: "w-4 h-4"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-700", children: item.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: item.description })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-brand-orange whitespace-nowrap", children: [
              "ZAR ",
              item.pricePerHead || 0,
              "/head"
            ] })
          ] }, item.id)) })
        ] }, category)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "radio",
              name: "mealMode",
              value: "custom",
              checked: selectedMode === "custom",
              onChange: (e) => setSelectedMode(e.target.value),
              className: "w-4 h-4"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700", children: "Custom meal bundle" })
        ] }),
        selectedMode === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-7 space-y-3 mt-2", children: [
          customItems.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                placeholder: "Description (e.g., Dinner)",
                value: item.description || "",
                onChange: (e) => {
                  const updated = [...customItems];
                  updated[index].description = e.target.value;
                  setCustomItems(updated);
                },
                className: "flex-1 text-sm border border-cream-border rounded px-2 py-1"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                min: "1",
                placeholder: "Qty",
                value: item.quantity || 1,
                onChange: (e) => {
                  const updated = [...customItems];
                  updated[index].quantity = Number(e.target.value);
                  setCustomItems(updated);
                },
                className: "w-12 text-sm border border-cream-border rounded px-2 py-1"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                min: "0",
                step: "0.01",
                placeholder: "Price (ZAR)",
                value: item.pricePerUnit || "",
                onChange: (e) => {
                  const updated = [...customItems];
                  updated[index].pricePerUnit = Number(e.target.value);
                  setCustomItems(updated);
                },
                className: "w-24 text-sm border border-cream-border rounded px-2 py-1"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setCustomItems(customItems.filter((_, i) => i !== index)),
                className: "text-red-500 hover:text-red-700 p-1",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
              }
            )
          ] }, index)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setCustomItems([...customItems, { description: "", quantity: 1, pricePerUnit: 0 }]),
              className: "flex items-center gap-1 text-xs text-brand-orange hover:text-orange-600 font-medium",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }),
                "Add item"
              ]
            }
          )
        ] })
      ] })
    ] }),
    pricing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-brand-brown mb-3", children: "Meal Cost Summary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
        pricing.items?.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-gray-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.name || item.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
            "ZAR ",
            item.total.toFixed(2)
          ] })
        ] }, index)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t pt-2 mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-semibold text-brand-orange", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "ZAR ",
            pricing.totalPrice.toFixed(2)
          ] })
        ] }) }),
        pricing.headCount && pricing.headCount > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-600 mt-2", children: [
          pricing.headCount,
          " ",
          pricing.type === "a_la_carte" ? "guests" : "people",
          " × meal selections"
        ] })
      ] })
    ] })
  ] });
}
function AccommodationBookingInner() {
  const [location, setLocation] = reactExports.useState("");
  const [checkIn, setCheckIn] = reactExports.useState("");
  const [checkOut, setCheckOut] = reactExports.useState("");
  const [guests, setGuests] = reactExports.useState(2);
  const [roomType, setRoomType] = reactExports.useState("standard");
  const [specialRequests, setSpecialRequests] = reactExports.useState("");
  const [showPropertySelector, setShowPropertySelector] = reactExports.useState(false);
  const [selectedProperty, setSelectedProperty] = reactExports.useState(null);
  const [propertyPending, setPropertyPending] = reactExports.useState(false);
  const [availableProperties, setAvailableProperties] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [formErrors, setFormErrors] = reactExports.useState({});
  const [propertyId, setPropertyId] = reactExports.useState("");
  const [properties, setProperties] = reactExports.useState([]);
  const [bookingType, setBookingType] = reactExports.useState("FIT");
  const [mealPricing, setMealPricing] = reactExports.useState(null);
  reactExports.useEffect(() => {
    async function searchProperties() {
      if (!location || location.length < 3) return;
      try {
        const response = await fetch(`/api/properties/search?location=${encodeURIComponent(location)}`);
        if (response.ok) {
          const data = await response.json();
          setProperties(data);
          if (data.length > 0 && !propertyId) {
            setPropertyId(data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to search properties:", error);
      }
    }
    const timer = setTimeout(searchProperties, 300);
    return () => clearTimeout(timer);
  }, [location, propertyId]);
  React.useEffect(() => {
    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        @page { margin: 1cm; }
        body * { visibility: hidden; }
        #booking-confirmation, #booking-confirmation * { visibility: visible; }
        #booking-confirmation { 
          position: absolute; 
          left: 0; 
          top: 0; 
          width: 100%;
          box-shadow: none !important;
        }
        #booking-confirmation button { display: none !important; }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const minCheckOut = checkIn ? new Date(new Date(checkIn).getTime() + 864e5).toISOString().split("T")[0] : today;
  const handleSkipPropertySelection = reactExports.useCallback((properties2) => {
    setAvailableProperties(properties2);
    setShowPropertySelector(false);
    setPropertyPending(true);
    setSelectedProperty(null);
  }, []);
  const confirmPropertySelection = reactExports.useCallback(async (property) => {
    setSelectedProperty(property);
    setShowPropertySelector(false);
    setPropertyPending(false);
    setLoading(true);
    try {
      const selectedProp = properties.find((p) => p.id === propertyId);
      if (!selectedProp) {
        throw new Error("Please select a property first");
      }
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = Math.ceil((checkOutDate - checkInDate) / (1e3 * 60 * 60 * 24));
      const basePrice = property.pricePerNight || selectedProp.basePrice;
      const retailPrice = basePrice;
      const lineItems = [
        {
          serviceType: "accommodation",
          description: `${selectedProp.name} - ${roomType} room`,
          basePrice,
          retailPrice,
          quantity: 1,
          // 1 room
          nights
        }
      ];
      if (mealPricing && mealPricing.items && mealPricing.items.length > 0) {
        mealPricing.items.forEach((mealItem) => {
          lineItems.push({
            serviceType: "meal",
            description: mealItem.name || mealItem.description,
            basePrice: mealItem.total / (mealItem.quantity || 1),
            // Back-calculate per-unit price
            retailPrice: mealItem.total / (mealItem.quantity || 1),
            quantity: mealItem.quantity || 1,
            nights: 1
            // Meals are per-head, not per-night
          });
        });
      }
      const userId = localStorage.getItem("colleco.user.id") || "guest_" + Date.now();
      const bookingData = {
        propertyId: selectedProp.id,
        supplierId: selectedProp.supplierId,
        // Derived from property mapping
        userId,
        bookingType,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        lineItems,
        metadata: {
          propertyId: property.id,
          propertyName: property.name,
          location,
          guests,
          roomType,
          specialRequests: specialRequests || void 0
        }
      };
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });
      if (!response.ok) {
        throw new Error(`Booking failed: ${response.statusText}`);
      }
      const booking = await response.json();
      const _loyaltyResult = processBookingRewards({
        id: booking.id,
        type: "accommodation",
        amount: booking.pricing.total,
        userId,
        checkInDate,
        propertyId: property.id,
        propertyName: property.name,
        nights,
        guests
      });
      const paymentUrl = `/checkout?bookingId=${booking.id}`;
      window.location.href = paymentUrl;
    } catch (error) {
      console.error("Booking failed:", error);
      alert(`Booking failed: ${error.message}

Please try again or contact support.`);
      setLoading(false);
    }
  }, [properties, propertyId, checkIn, checkOut, roomType, mealPricing, bookingType, guests, location, specialRequests]);
  const autoAssignCheapestProperty = reactExports.useCallback(async () => {
    if (!availableProperties || availableProperties.length === 0) {
      alert("No available properties to assign. Please try again.");
      return;
    }
    const cheapestProperty = availableProperties.reduce(
      (min, property) => property.pricePerNight < min.pricePerNight ? property : min
    );
    await confirmPropertySelection(cheapestProperty);
  }, [availableProperties, confirmPropertySelection]);
  const reopenPropertySelector = reactExports.useCallback(() => {
    setPropertyPending(false);
    setShowPropertySelector(true);
  }, []);
  const handleSubmit = reactExports.useCallback(async (e) => {
    e.preventDefault();
    const errors = {};
    if (!location || location.length < 3) errors.location = "Please enter a valid location";
    if (!checkIn) errors.checkIn = "Please select check-in date";
    if (!checkOut) errors.checkOut = "Please select check-out date";
    if (checkOut && checkIn && new Date(checkOut) <= new Date(checkIn)) {
      errors.checkOut = "Check-out must be after check-in";
    }
    if (guests < 1 || guests > 20) errors.guests = "Guests must be between 1 and 20";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setShowPropertySelector(true);
  }, [location, checkIn, checkOut, guests]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream min-h-screen overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BookingNav, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl sm:text-4xl font-bold tracking-tight text-brand-brown", children: "Accommodation Booking" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm sm:text-base text-brand-russty max-w-prose", children: "Find your perfect stay with our smart property selection and best price guarantee." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-brand-brown mb-4", children: "Search Accommodation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Location *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: location,
                onChange: (e) => setLocation(e.target.value),
                required: true,
                className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors",
                placeholder: "e.g., Durban, Umhlanga, Ballito"
              }
            ),
            formErrors.location && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1", children: formErrors.location })
          ] }),
          properties.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Select Property *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: properties.map((prop) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "label",
              {
                className: `flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${propertyId === prop.id ? "border-brand-orange bg-orange-50" : "border-cream-border hover:border-brand-orange"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "radio",
                      name: "property",
                      value: prop.id,
                      checked: propertyId === prop.id,
                      onChange: (e) => setPropertyId(e.target.value),
                      className: "mt-1"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: prop.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-600", children: [
                      prop.type,
                      " • ",
                      prop.location,
                      " • ",
                      prop.stars,
                      "⭐"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1", children: prop.description }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-brand-orange mt-2", children: [
                      "From ZAR ",
                      prop.basePrice,
                      "/night"
                    ] })
                  ] })
                ]
              },
              prop.id
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Booking Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: bookingType,
                onChange: (e) => setBookingType(e.target.value),
                required: true,
                className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "FIT", children: "Individual Booking" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Groups", children: "Group Booking (10+ guests)" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1", children: bookingType === "FIT" ? "Full payment due 7 days before check-in" : "25% deposit due now, balance 30 days before check-in" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Check-in Date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "date",
                  value: checkIn,
                  onChange: (e) => setCheckIn(e.target.value),
                  min: today,
                  required: true,
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                }
              ),
              formErrors.checkIn && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1", children: formErrors.checkIn })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Check-out Date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "date",
                  value: checkOut,
                  onChange: (e) => setCheckOut(e.target.value),
                  min: minCheckOut,
                  required: true,
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                }
              ),
              formErrors.checkOut && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1", children: formErrors.checkOut })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "guests", className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Number of Guests *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  id: "guests",
                  type: "number",
                  min: 1,
                  max: 20,
                  value: guests,
                  onChange: (e) => setGuests(Number(e.target.value)),
                  required: true,
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                }
              ),
              formErrors.guests && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1", children: formErrors.guests })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "roomType", className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Room Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  id: "roomType",
                  value: roomType,
                  onChange: (e) => setRoomType(e.target.value),
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "standard", children: "Standard Room" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "deluxe", children: "Deluxe Room" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "suite", children: "Suite" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "family", children: "Family Room" })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "specialRequests", className: "block mb-2 text-sm font-semibold text-brand-brown", children: [
              "Special Requests ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 text-xs", children: "(optional)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                id: "specialRequests",
                value: specialRequests,
                onChange: (e) => setSpecialRequests(e.target.value),
                placeholder: "Early check-in, late check-out, accessible room, etc.",
                rows: 3,
                maxLength: 200,
                className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors resize-none"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
              specialRequests.length,
              "/200 characters"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-brand-brown mb-3", children: "Meal Plans (Optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MealSelector,
              {
                onMealsSelected: setMealPricing,
                headCount: guests,
                nights: Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1e3 * 60 * 60 * 24)) || 1,
                bookingType
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", fullWidth: true, disabled: loading, children: loading ? "Processing..." : "Search Properties" })
        ] })
      ] }),
      propertyPending && !loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-2 border-brand-orange rounded-lg bg-orange-50 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-lg text-brand-brown mb-1", children: "Booking Pending - Choose Your Property" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty", children: "Your search details are saved. Select your preferred property to proceed." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg p-4 mb-4 border border-cream-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: location })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Guests" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-brand-brown", children: [
              guests,
              " guest",
              guests !== 1 ? "s" : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Check-in" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: checkIn })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Check-out" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: checkOut })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              fullWidth: true,
              onClick: reopenPropertySelector,
              className: "flex items-center justify-center gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Home, { className: "h-4 w-4" }),
                "Pick My Property"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              fullWidth: true,
              variant: "outline",
              onClick: autoAssignCheapestProperty,
              className: "flex items-center justify-center gap-2 border-brand-orange text-brand-orange hover:bg-orange-50",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4" }),
                "Auto-assign Cheapest Property"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-center text-gray-600 mt-2", children: "You can also proceed with other bookings and finalize this later." })
        ] })
      ] }),
      selectedProperty && !loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border", id: "booking-confirmation", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-brand-brown mb-1", children: "Booking Confirmed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
              "Confirmation ID: ACC-",
              Date.now().toString().slice(-8)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => {
                  const email = prompt("Enter your email address:");
                  if (email) {
                    alert(`Booking confirmation will be sent to ${email}

Note: Email functionality requires backend integration.`);
                  }
                },
                className: "px-3 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors text-sm flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }),
                  "Email"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => window.print(),
                className: "px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" }) }),
                  "Print"
                ]
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-3", children: "Property Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Property Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: selectedProperty.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Type & Rating" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-brand-brown", children: [
                  selectedProperty.type,
                  " • ",
                  selectedProperty.stars,
                  " ⭐"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Address" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-brand-brown flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "h-4 w-4 text-brand-orange", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 11a3 3 0 11-6 0 3 3 0 016 0z" })
                    ] }),
                    selectedProperty.address || location
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 p-3 bg-brand-orange/10 border-l-4 border-brand-orange rounded", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-brand-orange", children: "CollEco Travel Tip:" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-sm text-brand-brown", children: "Map shows approximate property location. Complete your booking here with CollEco Travel for exclusive rates and support!" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-lg overflow-hidden border-2 border-brand-orange mb-4 bg-gradient-to-br from-blue-50 to-green-50", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-64 flex flex-col items-center justify-center p-6", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "h-16 w-16 text-brand-orange mb-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 11a3 3 0 11-6 0 3 3 0 016 0z" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-brand-brown mb-1", children: selectedProperty.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 text-center", children: selectedProperty.address || location }),
                      selectedProperty.distanceKm && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-2", children: [
                        selectedProperty.distanceKm,
                        " km from city center"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "h-4 w-4 text-brand-orange", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 11a3 3 0 11-6 0 3 3 0 016 0z" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-brand-brown", children: "Property Location" })
                    ] }) })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Guest Rating" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-brand-brown", children: [
                  selectedProperty.rating?.toFixed(1) || "N/A",
                  "/5.0 (",
                  selectedProperty.reviewCount || 0,
                  " reviews)"
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-3", children: "Stay Information" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Check-in" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: new Date(checkIn).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "After 2:00 PM" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Check-out" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: new Date(checkOut).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Before 11:00 AM" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Duration" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: (() => {
                  const checkInDate = new Date(checkIn);
                  const checkOutDate = new Date(checkOut);
                  const diffTime = Math.abs(checkOutDate - checkInDate);
                  const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
                  const nights = Math.max(1, diffDays);
                  return `${nights} night${nights !== 1 ? "s" : ""}`;
                })() }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
                  guests,
                  " guest",
                  guests !== 1 ? "s" : ""
                ] })
              ] })
            ] })
          ] }),
          selectedProperty.amenities && selectedProperty.amenities.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-3", children: "Property Amenities" }),
            selectedProperty.requiredAmenities && selectedProperty.requiredAmenities.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-700 mb-2", children: "✓ Your Selected Amenities:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2", children: selectedProperty.requiredAmenities.map((amenity, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm bg-green-50 border border-green-200 rounded px-3 py-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-4 w-4 text-green-600 flex-shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-green-800", children: amenity })
              ] }, idx)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-700 mb-2", children: "All Available Amenities:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: selectedProperty.amenities.map((amenity, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-4 w-4 text-gray-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }),
                amenity
              ] }, idx)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-3", children: "Meal Plan" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `border rounded-lg p-4 ${selectedProperty.selectedMealPlan && selectedProperty.selectedMealPlan !== "room_only" ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `font-semibold ${selectedProperty.selectedMealPlan && selectedProperty.selectedMealPlan !== "room_only" ? "text-green-800" : "text-gray-700"}`, children: !selectedProperty.selectedMealPlan || selectedProperty.selectedMealPlan === "room_only" ? "🏨 Room Only" : selectedProperty.selectedMealPlan === "breakfast" ? "🍳 Bed & Breakfast" : selectedProperty.selectedMealPlan === "half_board" ? "🍽️ Half Board (Breakfast & Dinner)" : selectedProperty.selectedMealPlan === "full_board" ? "🍽️ Full Board (All Meals)" : selectedProperty.selectedMealPlan === "all_inclusive" ? "🍹 All Inclusive" : "🏨 Room Only" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm mt-1 ${selectedProperty.selectedMealPlan && selectedProperty.selectedMealPlan !== "room_only" ? "text-green-700" : "text-gray-600"}`, children: !selectedProperty.selectedMealPlan || selectedProperty.selectedMealPlan === "room_only" ? "No meals included - Room accommodation only" : selectedProperty.selectedMealPlan === "breakfast" ? "Daily breakfast included in your rate" : selectedProperty.selectedMealPlan === "half_board" ? "Breakfast and dinner included daily" : selectedProperty.selectedMealPlan === "full_board" ? "Breakfast, lunch, and dinner included daily" : selectedProperty.selectedMealPlan === "all_inclusive" ? "All meals, drinks, and activities included" : "No meals included" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-3", children: "Pricing Breakdown" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-600", children: [
                  "R",
                  selectedProperty.pricePerNight.toLocaleString(),
                  " × ",
                  (() => {
                    const checkInDate = new Date(checkIn);
                    const checkOutDate = new Date(checkOut);
                    const diffTime = Math.abs(checkOutDate - checkInDate);
                    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
                    return Math.max(1, diffDays);
                  })(),
                  " night(s)"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                  "R",
                  (selectedProperty.pricePerNight * (() => {
                    const checkInDate = new Date(checkIn);
                    const checkOutDate = new Date(checkOut);
                    const diffTime = Math.abs(checkOutDate - checkInDate);
                    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
                    return Math.max(1, diffDays);
                  })()).toLocaleString()
                ] })
              ] }),
              selectedProperty.selectedMealPlan && selectedProperty.selectedMealPlan !== "room_only" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm text-brand-orange", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Meal Plan: ",
                  (() => {
                    if (selectedProperty.selectedMealPlan === "breakfast") return "Bed & Breakfast";
                    if (selectedProperty.selectedMealPlan === "half_board") return "Half Board";
                    if (selectedProperty.selectedMealPlan === "full_board") return "Full Board";
                    if (selectedProperty.selectedMealPlan === "all_inclusive") return "All Inclusive";
                    return "";
                  })()
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Included in price" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm border-t pt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-brand-brown", children: "Total Amount" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-bold text-brand-orange", children: [
                  "R",
                  (selectedProperty.totalPrice || selectedProperty.pricePerNight * (() => {
                    const checkInDate = new Date(checkIn);
                    const checkOutDate = new Date(checkOut);
                    const diffTime = Math.abs(checkOutDate - checkInDate);
                    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
                    return Math.max(1, diffDays);
                  })()).toLocaleString()
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-3", children: "Terms & Conditions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 rounded-lg p-4 space-y-3 text-sm text-gray-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown mb-1", children: "Cancellation Policy" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 text-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Free cancellation up to 48 hours before check-in" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "50% refund for cancellations 24-48 hours before check-in" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "No refund for cancellations within 24 hours of check-in" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown mb-1", children: "Payment Terms" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 text-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Full payment required at time of booking" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Credit card details may be required for incidentals" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Prices include VAT where applicable" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown mb-1", children: "Property Policies" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 text-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Valid photo ID and credit card required at check-in" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Minimum age to check-in: 18 years" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Pets: Contact property for pet policy" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Children: All ages welcome (extra charges may apply)" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown mb-1", children: "Important Information" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 text-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Please inform the property of your estimated arrival time" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Special requests are subject to availability and may incur additional charges" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "This is a smoke-free property" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-3", children: "Need Assistance?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 bg-green-50 border border-green-200 rounded-lg p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-green-900", children: "During Your Stay - Contact Property Directly" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-800 mb-3", children: "For check-in, room requests, amenities, or on-site assistance:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 text-sm", children: [
                selectedProperty.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-700 font-medium", children: "Property Phone" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-green-900", children: selectedProperty.phone })
                ] }),
                selectedProperty.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-700 font-medium", children: "Property Email" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-green-900", children: selectedProperty.email })
                ] })
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
      ] })
    ] }),
    showPropertySelector && /* @__PURE__ */ jsxRuntimeExports.jsx(
      AccommodationSelector,
      {
        location,
        checkIn,
        checkOut,
        guests,
        onSelectProperty: confirmPropertySelection,
        onSkip: handleSkipPropertySelection,
        onCancel: () => setShowPropertySelector(false)
      }
    )
  ] });
}
function AccommodationBooking() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccommodationBookingInner, {}) });
}
export {
  AccommodationBooking as default
};
//# sourceMappingURL=AccommodationBooking-CnBd5hSB.js.map
