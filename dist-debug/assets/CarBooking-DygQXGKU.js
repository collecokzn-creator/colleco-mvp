import { r as reactExports, j as jsxRuntimeExports, R as React } from "./motion-D9fZRtSt.js";
import { B as BookingNav } from "./BookingNav-B1OTCtxJ.js";
import { G as Award, F as Filter, ab as ArrowUpDown, ac as ChevronLeft, w as ChevronRight, e as Car, ad as Heart, x as Star, U as Users, ae as Luggage, af as Gauge, ag as Fuel, ah as Snowflake, ai as Radio, S as Shield, T as TrendingUp, n as CheckCircle2, o as Clock, a as DollarSign } from "./icons-C4AMPM7L.js";
import { B as Button } from "./Button-BvBK5int.js";
import { o as processBookingRewards } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
const __vite_import_meta_env__ = {};
function CarHireSelector({
  pickupLocation,
  dropoffLocation,
  pickupDate,
  dropoffDate,
  onSelectCar,
  onSkip,
  onCancel
}) {
  const _log = (level, ...args) => {
    if (!(__vite_import_meta_env__?.VITE_DEBUG_CARHIRE === "1")) return;
    if (level === "error") console.error(...args);
    else if (level === "warn") console.warn(...args);
    else console.log(...args);
  };
  const [cars, setCars] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [errorMsg, setErrorMsg] = reactExports.useState("");
  const [filterBy, setFilterBy] = reactExports.useState("all");
  const [sortBy, setSortBy] = reactExports.useState("recommended");
  const [favoriteCars, setFavoriteCars] = reactExports.useState([]);
  const [selectedCar, setSelectedCar] = reactExports.useState(null);
  const [preferredTransmission, setPreferredTransmission] = reactExports.useState("");
  const [preferredFuelType, setPreferredFuelType] = reactExports.useState("");
  const [minSeats, setMinSeats] = reactExports.useState(0);
  const [requiredFeatures, setRequiredFeatures] = reactExports.useState([]);
  const [canScrollLeft, setCanScrollLeft] = reactExports.useState(false);
  const [canScrollRight, setCanScrollRight] = reactExports.useState(false);
  const scrollContainerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    fetchAvailableCars();
    loadFavoriteCars();
  }, [fetchAvailableCars, loadFavoriteCars]);
  const fetchAvailableCars = reactExports.useCallback(async () => {
    setLoading(true);
    const useDemo = (__vite_import_meta_env__?.VITE_DEMO_CARHIRE ?? "1") === "1";
    setErrorMsg("");
    const generateMockCars = () => {
      const carData = [
        { make: "Toyota", model: "Corolla", year: 2023, category: "Compact", seats: 5, luggage: 2, transmission: "Automatic", fuelType: "Petrol" },
        { make: "VW", model: "Polo", year: 2024, category: "Economy", seats: 5, luggage: 2, transmission: "Manual", fuelType: "Petrol" },
        { make: "Nissan", model: "X-Trail", year: 2023, category: "SUV", seats: 7, luggage: 4, transmission: "Automatic", fuelType: "Diesel" },
        { make: "Hyundai", model: "i20", year: 2024, category: "Economy", seats: 5, luggage: 2, transmission: "Manual", fuelType: "Petrol" },
        { make: "Toyota", model: "Fortuner", year: 2023, category: "SUV", seats: 7, luggage: 5, transmission: "Automatic", fuelType: "Diesel" },
        { make: "BMW", model: "3 Series", year: 2024, category: "Luxury", seats: 5, luggage: 3, transmission: "Automatic", fuelType: "Petrol" },
        { make: "Mercedes", model: "C-Class", year: 2023, category: "Luxury", seats: 5, luggage: 3, transmission: "Automatic", fuelType: "Petrol" },
        { make: "Renault", model: "Kwid", year: 2024, category: "Economy", seats: 4, luggage: 1, transmission: "Manual", fuelType: "Petrol" },
        { make: "Kia", model: "Sportage", year: 2023, category: "SUV", seats: 5, luggage: 4, transmission: "Automatic", fuelType: "Diesel" },
        { make: "Honda", model: "Civic", year: 2024, category: "Compact", seats: 5, luggage: 2, transmission: "Automatic", fuelType: "Petrol" },
        { make: "Tesla", model: "Model 3", year: 2024, category: "Luxury", seats: 5, luggage: 2, transmission: "Automatic", fuelType: "Electric" },
        { make: "Toyota", model: "Prius", year: 2023, category: "Compact", seats: 5, luggage: 2, transmission: "Automatic", fuelType: "Hybrid" }
      ];
      const featuresList = [
        ["AC", "GPS", "Bluetooth", "USB"],
        ["AC", "Bluetooth", "USB"],
        ["AC", "GPS", "Bluetooth", "USB", "Cruise Control"],
        ["AC", "USB"],
        ["AC", "GPS", "Bluetooth", "USB", "Leather Seats", "4x4"],
        ["AC", "GPS", "Bluetooth", "USB", "Leather Seats", "Sunroof"],
        ["AC", "GPS", "Bluetooth", "USB", "Leather Seats", "Premium Sound"],
        ["AC"],
        ["AC", "GPS", "Bluetooth", "USB", "Parking Sensors"],
        ["AC", "Bluetooth", "USB", "Apple CarPlay"],
        ["AC", "GPS", "Bluetooth", "USB", "Autopilot", "Premium Sound"],
        ["AC", "GPS", "Bluetooth", "USB", "Eco Mode"]
      ];
      const basePrice = 350;
      const pickupDt = new Date(pickupDate);
      const dropoffDt = new Date(dropoffDate);
      const days = Math.max(1, Math.ceil((dropoffDt - pickupDt) / (1e3 * 60 * 60 * 24)));
      return carData.map((car, index) => {
        const features = featuresList[index % featuresList.length];
        let priceMultiplier = 1;
        if (car.category === "Luxury") priceMultiplier = 2.5;
        else if (car.category === "SUV") priceMultiplier = 1.8;
        else if (car.category === "Compact") priceMultiplier = 1.2;
        else if (car.category === "Economy") priceMultiplier = 0.8;
        if (car.transmission === "Automatic") priceMultiplier += 0.2;
        if (car.fuelType === "Electric") priceMultiplier += 0.4;
        if (car.fuelType === "Hybrid") priceMultiplier += 0.3;
        if (car.year >= 2024) priceMultiplier += 0.15;
        priceMultiplier += Math.random() * 0.2 - 0.1;
        const pricePerDay = Math.round(basePrice * priceMultiplier / 10) * 10;
        const totalPrice = pricePerDay * days;
        const rating = 3.8 + Math.random() * 1.2;
        const reviewCount = 30 + Math.floor(Math.random() * 470);
        const safetyRating = 4 + Math.floor(Math.random() * 2);
        const isPremium = car.category === "Luxury" && car.year >= 2023;
        const insuranceIncluded = Math.random() > 0.5;
        const isPopular = reviewCount > 300 && rating >= 4.5;
        return {
          id: `CAR-${Date.now()}-${index}`,
          ...car,
          features,
          pricePerDay,
          totalPrice,
          days,
          rating: Number(rating.toFixed(1)),
          reviewCount,
          safetyRating,
          isPremium,
          insuranceIncluded,
          isPopular,
          imageUrl: null
        };
      });
    };
    try {
      _log("log", "[CarHireSelector] Fetching cars for:", { pickupLocation, dropoffLocation, pickupDate, dropoffDate });
      const response = await fetch("/api/carhire/available-cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupLocation,
          dropoffLocation,
          pickupDate,
          dropoffDate
        })
      });
      if (response.ok) {
        const data = await response.json();
        const list = data.cars || [];
        setCars(list.length ? list : useDemo ? generateMockCars() : []);
        if (!list.length && useDemo) {
          setErrorMsg("Live car hire providers unavailable. Showing demo cars.");
        }
      } else {
        _log("error", "[CarHireSelector] Failed to fetch cars");
        setCars(useDemo ? generateMockCars() : []);
        setErrorMsg("Unable to load live cars. Showing demo cars.");
      }
    } catch (error) {
      _log("error", "[CarHireSelector] Error fetching cars:", error);
      setCars(useDemo ? generateMockCars() : []);
      setErrorMsg("Network error. Showing demo cars.");
    } finally {
      setLoading(false);
    }
  }, [pickupLocation, dropoffLocation, pickupDate, dropoffDate]);
  const loadFavoriteCars = reactExports.useCallback(() => {
    try {
      const saved = localStorage.getItem("colleco.favoriteCars");
      if (saved) {
        setFavoriteCars(JSON.parse(saved));
      }
    } catch (error) {
      _log("error", "[CarHireSelector] Error loading favorites:", error);
    }
  }, []);
  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setCanScrollLeft(container.scrollTop > 0);
    setCanScrollRight(
      container.scrollTop < container.scrollHeight - container.clientHeight - 10
    );
  };
  reactExports.useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      const handleKeyDown = (e) => {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          scrollUp();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          scrollDown();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        container.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [cars]);
  const scrollUp = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ top: -300, behavior: "smooth" });
    }
  };
  const scrollDown = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ top: 300, behavior: "smooth" });
    }
  };
  const toggleFavorite = (carId) => {
    const newFavorites = favoriteCars.includes(carId) ? favoriteCars.filter((id) => id !== carId) : [...favoriteCars, carId];
    setFavoriteCars(newFavorites);
    localStorage.setItem("colleco.favoriteCars", JSON.stringify(newFavorites));
  };
  const scoreCar = (car) => {
    let score = 0;
    const safetyScore = car.safetyRating / 5 * 20 + car.rating / 5 * 20;
    score += safetyScore;
    const avgPrice = cars.reduce((sum, c) => sum + c.pricePerDay, 0) / cars.length;
    const priceScore = (1 - car.pricePerDay / (avgPrice * 1.5)) * 35;
    score += Math.max(0, priceScore);
    const reviewScore = car.reviewCount / 500 * 5;
    const ratingScore = car.rating / 5 * 20;
    score += Math.min(25, reviewScore + ratingScore);
    if (car.transmission === "Automatic") score += 3;
    if (car.fuelType === "Electric" || car.fuelType === "Hybrid") score += 5;
    if (car.features.includes("GPS")) score += 2;
    if (car.features.includes("AC")) score += 2;
    if (car.insuranceIncluded) score += 3;
    if (car.isPremium) score += 5;
    return Math.round(score);
  };
  const autoPickBestCar = () => {
    if (cars.length === 0) return;
    const scoredCars = cars.map((car) => ({
      ...car,
      smartScore: scoreCar(car)
    }));
    const best = scoredCars.reduce(
      (max, car) => car.smartScore > max.smartScore ? car : max
    );
    setSelectedCar(best);
    onSelectCar(best);
  };
  const getFilteredAndSortedCars = () => {
    let filtered = [...cars];
    if (preferredTransmission) {
      filtered = filtered.filter(
        (c) => c.transmission && c.transmission.toLowerCase().includes(preferredTransmission.toLowerCase())
      );
    }
    if (preferredFuelType) {
      filtered = filtered.filter(
        (c) => c.fuelType && c.fuelType.toLowerCase().includes(preferredFuelType.toLowerCase())
      );
    }
    if (minSeats > 0) {
      filtered = filtered.filter((c) => c.seats >= minSeats);
    }
    if (requiredFeatures.length > 0) {
      filtered = filtered.filter(
        (c) => c.features && requiredFeatures.every(
          (feature) => c.features.some((f) => f.toLowerCase().includes(feature.toLowerCase()))
        )
      );
    }
    if (filterBy !== "all") {
      if (filterBy === "favorites") {
        filtered = filtered.filter((c) => favoriteCars.includes(c.id));
      } else if (filterBy === "premium") {
        filtered = filtered.filter((c) => c.isPremium);
      } else {
        filtered = filtered.filter((c) => c.category.toLowerCase() === filterBy);
      }
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_low":
          return a.pricePerDay - b.pricePerDay;
        case "price_high":
          return b.pricePerDay - a.pricePerDay;
        case "rating":
          return b.rating - a.rating;
        case "recommended":
        default:
          return scoreCar(b) - scoreCar(a);
      }
    });
    return filtered;
  };
  const formatCurrency = (amount) => {
    return `R${amount.toLocaleString()}`;
  };
  const filteredCars = getFilteredAndSortedCars();
  const calculateRentalDays = () => {
    if (!pickupDate || !dropoffDate) return 1;
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);
    const diffTime = Math.abs(dropoff - pickup);
    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };
  const rentalDays = calculateRentalDays();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/50 z-modal flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 sm:p-6 border-b bg-gradient-to-r from-brand-orange to-orange-600", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Pick My Car" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-white/90 text-sm", children: [
        pickupLocation,
        " • ",
        pickupDate,
        " to ",
        dropoffDate,
        " • ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
          rentalDays,
          " day",
          rentalDays !== 1 ? "s" : ""
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b bg-gray-50 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: autoPickBestCar,
          className: "px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 text-sm font-medium",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4" }),
            "Auto Smart Pick"
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Transmission" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: preferredTransmission,
              onChange: (e) => setPreferredTransmission(e.target.value),
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Any" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Automatic", children: "Automatic" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Manual", children: "Manual" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Fuel Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: preferredFuelType,
              onChange: (e) => setPreferredFuelType(e.target.value),
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Any" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Petrol", children: "Petrol" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Diesel", children: "Diesel" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Electric", children: "Electric" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Hybrid", children: "Hybrid" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Minimum Seats" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: minSeats,
              onChange: (e) => setMinSeats(Number(e.target.value)),
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "0", children: "Any" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "4", children: "4+ Seats" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "5", children: "5+ Seats" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "7", children: "7+ Seats" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Required Features" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              multiple: true,
              value: requiredFeatures,
              onChange: (e) => setRequiredFeatures(Array.from(e.target.selectedOptions, (option) => option.value)),
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none",
              size: 3,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "AC", children: "Air Conditioning" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "GPS", children: "GPS Navigation" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Bluetooth", children: "Bluetooth" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "USB", children: "USB Charging" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "h-4 w-4 text-gray-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: filterBy,
              onChange: (e) => setFilterBy(e.target.value),
              className: "px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Cars" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "favorites", children: "Favorites" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "economy", children: "Economy" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "compact", children: "Compact" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "suv", children: "SUV" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "luxury", children: "Luxury" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "premium", children: "Premium Only" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { className: "h-4 w-4 text-gray-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: sortBy,
              onChange: (e) => setSortBy(e.target.value),
              className: "px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "recommended", children: "Recommended" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price_low", children: "Price: Low to High" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price_high", children: "Price: High to Low" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "rating", children: "Highest Rated" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-600 ml-auto", children: [
          filteredCars.length,
          " car",
          filteredCars.length !== 1 ? "s" : "",
          " available"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 relative", ref: scrollContainerRef, children: [
      errorMsg && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 p-3 bg-brand-orange/10 border-l-4 border-brand-orange rounded", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-brand-orange", children: "Notice:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-sm text-brand-brown", children: errorMsg })
      ] }),
      canScrollLeft && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: scrollUp,
          className: "fixed top-1/2 left-4 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors border-2 border-gray-200",
          "aria-label": "Scroll up",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-6 w-6 text-brand-orange rotate-90" })
        }
      ),
      canScrollRight && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: scrollDown,
          className: "fixed bottom-32 left-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors border-2 border-gray-200",
          "aria-label": "Scroll down",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-6 w-6 text-brand-orange rotate-90" })
        }
      ),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-4 border-brand-orange border-t-transparent" }) }) : filteredCars.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Car, { className: "h-16 w-16 text-gray-300 mx-auto mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "No cars match your criteria" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setFilterBy("all");
              setPreferredTransmission("");
              setPreferredFuelType("");
              setMinSeats(0);
              setRequiredFeatures([]);
            },
            className: "mt-4 text-brand-orange hover:underline text-sm",
            children: "Clear all filters"
          }
        )
      ] }) : filteredCars.map((car) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          onClick: () => setSelectedCar(car),
          className: `mb-4 border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${selectedCar?.id === car.id ? "border-brand-orange bg-orange-50" : "border-gray-200 hover:border-brand-orange/50"}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 sm:gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 sm:w-40 h-20 sm:h-28 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden", children: car.imageUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: car.imageUrl,
                alt: `${car.make} ${car.model}`,
                className: "w-full h-full object-cover"
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Car, { className: "h-12 w-12 text-gray-400" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-lg text-brand-brown", children: [
                    car.make,
                    " ",
                    car.model
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
                    car.year,
                    " • ",
                    car.category
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      toggleFavorite(car.id);
                    },
                    className: "p-2 hover:bg-gray-100 rounded-full transition-colors",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Heart,
                      {
                        className: `h-5 w-5 ${favoriteCars.includes(car.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`
                      }
                    )
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3 mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 text-brand-gold" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: car.rating.toFixed(1) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
                  "(",
                  car.reviewCount,
                  " reviews)"
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 mb-3 text-sm text-gray-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    car.seats,
                    " seats"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Luggage, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    car.luggage,
                    " bags"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Gauge, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: car.transmission })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Fuel, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: car.fuelType })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mb-3", children: car.features.map((feature, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: "px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center gap-1",
                  children: [
                    feature === "AC" && /* @__PURE__ */ jsxRuntimeExports.jsx(Snowflake, { className: "h-3 w-3" }),
                    feature === "Bluetooth" && /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-3 w-3" }),
                    feature
                  ]
                },
                idx
              )) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-2", children: [
                car.isPremium && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-3 w-3" }),
                  "Premium Vehicle"
                ] }),
                car.insuranceIncluded && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3 w-3" }),
                  "Insurance Included"
                ] }),
                car.isPopular && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-1 bg-orange-100 text-brand-orange text-xs rounded-full flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3 w-3" }),
                  "Popular Choice"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold text-brand-orange", children: formatCurrency(car.pricePerDay) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600", children: "per day" }),
                car.totalPrice && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500 ml-auto", children: [
                  "Total: ",
                  formatCurrency(car.totalPrice)
                ] })
              ] })
            ] })
          ] })
        },
        car.id
      ))
    ] }),
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
            onClick: () => onSkip(cars),
            className: "px-4 py-2 border border-brand-orange text-brand-orange rounded-lg hover:bg-orange-50 transition-colors text-sm",
            children: "Skip for now"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => selectedCar && onSelectCar(selectedCar),
          disabled: !selectedCar,
          className: "px-3 sm:px-6 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm sm:text-base",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4" }),
            "Confirm Car ",
            selectedCar && `- ${formatCurrency(selectedCar.pricePerDay)}/day`
          ]
        }
      )
    ] })
  ] }) });
}
function CarBooking() {
  const [pickupLocation, setPickupLocation] = reactExports.useState("");
  const [dropoffLocation, setDropoffLocation] = reactExports.useState("");
  const [pickupDate, setPickupDate] = reactExports.useState("");
  const [pickupTime, setPickupTime] = reactExports.useState("09:00");
  const [dropoffDate, setDropoffDate] = reactExports.useState("");
  const [dropoffTime, setDropoffTime] = reactExports.useState("17:00");
  const [driverAge, setDriverAge] = reactExports.useState(25);
  const [insuranceLevel, setInsuranceLevel] = reactExports.useState("basic");
  const [additionalDrivers, setAdditionalDrivers] = reactExports.useState(0);
  const [showCarSelector, setShowCarSelector] = reactExports.useState(false);
  const [selectedCar, setSelectedCar] = reactExports.useState(null);
  const [carPending, setCarPending] = reactExports.useState(false);
  const [availableCars, setAvailableCars] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [formErrors, setFormErrors] = reactExports.useState({});
  React.useEffect(() => {
    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const minDropoff = pickupDate || today;
  function handleSkipCarSelection(cars) {
    setAvailableCars(cars);
    setShowCarSelector(false);
    setCarPending(true);
    setSelectedCar(null);
  }
  async function autoAssignCheapestCar() {
    if (!availableCars || availableCars.length === 0) {
      alert("No available cars to assign. Please try again.");
      return;
    }
    const cheapestCar = availableCars.reduce(
      (min, car) => car.pricePerDay < min.pricePerDay ? car : min
    );
    await confirmCarSelection(cheapestCar);
  }
  function reopenCarSelector() {
    setCarPending(false);
    setShowCarSelector(true);
  }
  async function confirmCarSelection(car) {
    setSelectedCar(car);
    setShowCarSelector(false);
    setCarPending(false);
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      const pickupDateObj = new Date(pickupDate);
      const dropoffDateObj = new Date(dropoffDate);
      const days = Math.ceil((dropoffDateObj - pickupDateObj) / (1e3 * 60 * 60 * 24));
      const totalPrice = car.pricePerDay * days;
      const booking = {
        id: `CAR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: "car_hire",
        amount: totalPrice,
        userId: localStorage.getItem("colleco.user.id") || "guest_" + Date.now(),
        checkInDate: pickupDateObj,
        carId: car.id,
        make: car.make,
        model: car.model,
        pickupLocation,
        dropoffLocation,
        days,
        insuranceLevel,
        additionalDrivers
      };
      const result = processBookingRewards(booking);
      alert(`Car "${car.make} ${car.model}" booked successfully! You earned ${result.pointsEarned} loyalty points! 🎉`);
      setLoading(false);
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Booking failed. Please try again.");
      setLoading(false);
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    const errors = {};
    if (!pickupLocation || pickupLocation.length < 3) errors.pickupLocation = "Please enter a valid pickup location";
    if (!dropoffLocation || dropoffLocation.length < 3) errors.dropoffLocation = "Please enter a valid dropoff location";
    if (!pickupDate) errors.pickupDate = "Please select pickup date";
    if (!dropoffDate) errors.dropoffDate = "Please select dropoff date";
    if (dropoffDate && pickupDate && new Date(dropoffDate) <= new Date(pickupDate)) {
      errors.dropoffDate = "Dropoff must be after pickup";
    }
    if (driverAge < 18 || driverAge > 99) errors.driverAge = "Driver must be between 18 and 99 years old";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setShowCarSelector(true);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream min-h-screen overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BookingNav, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl sm:text-4xl font-bold tracking-tight text-brand-brown", children: "Car Hire" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm sm:text-base text-brand-russty max-w-prose", children: "Choose from our wide selection of vehicles with flexible pickup and dropoff options." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-brand-brown mb-4", children: "Search Available Cars" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Pickup Location *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: pickupLocation,
                  onChange: (e) => setPickupLocation(e.target.value),
                  required: true,
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors",
                  placeholder: "e.g., King Shaka Airport"
                }
              ),
              formErrors.pickupLocation && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1", children: formErrors.pickupLocation })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Dropoff Location *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: dropoffLocation,
                  onChange: (e) => setDropoffLocation(e.target.value),
                  required: true,
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors",
                  placeholder: "e.g., Durban City Centre"
                }
              ),
              formErrors.dropoffLocation && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1", children: formErrors.dropoffLocation })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Pickup Date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "date",
                  value: pickupDate,
                  onChange: (e) => setPickupDate(e.target.value),
                  min: today,
                  required: true,
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                }
              ),
              formErrors.pickupDate && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1", children: formErrors.pickupDate })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Pickup Time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "time",
                  value: pickupTime,
                  onChange: (e) => setPickupTime(e.target.value),
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Dropoff Date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "date",
                  value: dropoffDate,
                  onChange: (e) => setDropoffDate(e.target.value),
                  min: minDropoff,
                  required: true,
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                }
              ),
              formErrors.dropoffDate && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1", children: formErrors.dropoffDate })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Dropoff Time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "time",
                  value: dropoffTime,
                  onChange: (e) => setDropoffTime(e.target.value),
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "driverAge", className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Driver Age *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  id: "driverAge",
                  type: "number",
                  min: 18,
                  max: 99,
                  value: driverAge,
                  onChange: (e) => setDriverAge(Number(e.target.value)),
                  required: true,
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                }
              ),
              formErrors.driverAge && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1", children: formErrors.driverAge })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "insuranceLevel", className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Insurance Level" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  id: "insuranceLevel",
                  value: insuranceLevel,
                  onChange: (e) => setInsuranceLevel(e.target.value),
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "basic", children: "Basic" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "premium", children: "Premium" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "full", children: "Full Cover" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "additionalDrivers", className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Additional Drivers" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  id: "additionalDrivers",
                  type: "number",
                  min: 0,
                  max: 3,
                  value: additionalDrivers,
                  onChange: (e) => setAdditionalDrivers(Number(e.target.value)),
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", fullWidth: true, disabled: loading, children: loading ? "Processing..." : "Search Available Cars" })
        ] })
      ] }),
      carPending && !loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-2 border-brand-orange rounded-lg bg-orange-50 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-lg text-brand-brown mb-1", children: "Booking Pending - Choose Your Car" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty", children: "Your search details are saved. Select your preferred vehicle to proceed." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg p-4 mb-4 border border-cream-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Pickup" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: pickupLocation })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Dropoff" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: dropoffLocation })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Dates" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-brand-brown", children: [
              pickupDate,
              " to ",
              dropoffDate
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { fullWidth: true, onClick: reopenCarSelector, className: "flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Car, { className: "h-4 w-4" }),
            "Pick My Car"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              fullWidth: true,
              variant: "outline",
              onClick: autoAssignCheapestCar,
              className: "flex items-center justify-center gap-2 border-brand-orange text-brand-orange hover:bg-orange-50",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4" }),
                "Auto-assign Cheapest Car"
              ]
            }
          )
        ] })
      ] }),
      selectedCar && !loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-brand-brown mb-4", children: "Booking Confirmed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Vehicle:" }),
              " ",
              selectedCar.make,
              " ",
              selectedCar.model
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Category:" }),
              " ",
              selectedCar.category
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Price per Day:" }),
              " R",
              selectedCar.pricePerDay
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Total:" }),
              " R",
              selectedCar.totalPrice
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-brand-brown mb-4", children: "Rental Terms & Conditions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown mb-1", children: "Cancellation Policy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Free cancellation up to 48 hours before pickup" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "50% refund for cancellations 24-48 hours before pickup" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "No refund for cancellations within 24 hours of pickup" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown mb-1", children: "Payment Terms" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Full rental amount charged at booking" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Security deposit required at pickup (refunded after return)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Fuel and damage waiver options available" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown mb-1", children: "Rental Company Policies" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Valid driver's license required (minimum 21 years old)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "International license or IDP may be required" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Vehicle inspection at pickup and return is mandatory" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Insurance coverage included; excess may apply" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown mb-1", children: "Important Information" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Pickup timing: Arrive 15 minutes before booked time" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Return vehicle with full fuel tank to avoid surcharge" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Report any damage immediately to rental company" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Child car seats available upon request" })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-3", children: "Need Assistance?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 bg-green-50 border border-green-200 rounded-lg p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-green-900", children: "During Your Rental - Contact Company Directly" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-800 mb-3", children: "For pickup, vehicle issues, roadside assistance, or extensions:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-700 font-medium", children: "Rental Company Contact Info" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-600", children: "Available at pickup location or in your confirmation email" })
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
      !selectedCar && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-6 mt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-brand-brown mb-4", children: "Need Assistance?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 bg-green-50 border border-green-200 rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-green-900", children: "During Rental - Contact Company Directly" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-800 mb-3", children: "For pickup, vehicle issues, roadside assistance, or extensions:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-700 font-medium", children: "Rental Company Contact Info" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-600", children: "Available at pickup location or in your confirmation email" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-orange-50 border-2 border-brand-orange rounded-lg p-4 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-6 w-6 text-brand-orange", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-brand-brown text-lg", children: "Zola - Your AI Travel Assistant (24/7)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown mb-3", children: "Get instant answers from Zola about your booking, changes, cancellations, refunds, payment issues, and recommendations." }),
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mt-2 text-center", children: "Available 24/7 • Instant responses • Handles booking changes & queries" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5 text-gray-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium text-gray-700 text-sm", children: "Need to Speak to a Specialist?" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mb-3", children: "If Zola can't resolve your issue:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "Email Support" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-700", children: "support@colleco.co.za" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Zola routes to specialist" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "Phone (Escalations)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-700", children: "+27 31 123 4567" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    showCarSelector && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CarHireSelector,
      {
        pickupLocation,
        dropoffLocation,
        pickupDate,
        dropoffDate,
        onSelectCar: confirmCarSelection,
        onSkip: handleSkipCarSelection,
        onCancel: () => setShowCarSelector(false)
      }
    )
  ] });
}
export {
  CarBooking as default
};
//# sourceMappingURL=CarBooking-DygQXGKU.js.map
