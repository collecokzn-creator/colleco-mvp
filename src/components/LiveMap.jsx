import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function LiveMap({ pickup, dropoff, driverLocation, showRoute = true, nearbyDrivers = [], height = '400px', waypoints = [] }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState({ pickup: null, dropoff: null, driver: null });
  const [nearbyMarkers, setNearbyMarkers] = useState([]);
  const [waypointMarkers, _setWaypointMarkers] = useState([]);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);

  useEffect(() => {
    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      script.onload = () => initMap();
    } else {
      initMap();
    }
  }, []);

  useEffect(() => {
    if (map && window.google) {
      updateMapMarkers();
      if (showRoute && pickup && dropoff) {
        drawRoute();
      }
    }
  }, [map, pickup, dropoff, driverLocation, showRoute, updateMapMarkers, drawRoute]);

  // Update nearby drivers markers
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing nearby markers
    nearbyMarkers.forEach(marker => marker.setMap(null));

    // Create new markers for nearby drivers
    const newNearbyMarkers = nearbyDrivers.map((driver, index) => {
      return new window.google.maps.Marker({
        position: { lat: driver.lat, lng: driver.lng },
        map: map,
        title: `${driver.name || 'Driver'} - ${driver.eta || 5} min away`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="#FF9800" stroke="white" stroke-width="2"/>
              <text x="16" y="21" font-size="16" text-anchor="middle" fill="white">🚐</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16),
        },
        zIndex: 100 + index,
      });
    });

    setNearbyMarkers(newNearbyMarkers);

    // Fit bounds to show all nearby drivers if present
    if (nearbyDrivers.length > 0 && pickup) {
      const bounds = new window.google.maps.LatLngBounds();
      nearbyDrivers.forEach(driver => {
        bounds.extend({ lat: driver.lat, lng: driver.lng });
      });
      map.fitBounds(bounds);
      // Don't zoom in too much
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 15) map.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [map, nearbyDrivers]);

  function initMap() {
    if (!mapRef.current || !window.google) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: -29.8587, lng: 31.0218 }, // Durban default
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    setMap(mapInstance);
    
    const renderer = new window.google.maps.DirectionsRenderer({
      map: mapInstance,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#FF6B35',
        strokeWeight: 4,
      }
    });
    
    setDirectionsRenderer(renderer);
  }

  const updateMapMarkers = useCallback(() => {
    if (!map || !window.google) return;

    // Clear existing markers
    Object.values(markers).forEach(marker => marker && marker.setMap(null));

    const newMarkers = {};

    // Pickup marker
    if (pickup) {
      geocodeAddress(pickup, (location) => {
        newMarkers.pickup = new window.google.maps.Marker({
          position: location,
          map: map,
          title: 'Pickup',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4CAF50',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
          label: {
            text: 'P',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold'
          }
        });
      });
    }

    // Dropoff marker
    if (dropoff) {
      geocodeAddress(dropoff, (location) => {
        newMarkers.dropoff = new window.google.maps.Marker({
          position: location,
          map: map,
          title: 'Dropoff',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#F44336',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
          label: {
            text: 'D',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold'
          }
        });
      });
    }

    // Driver marker (moving)
    if (driverLocation && driverLocation.lat && driverLocation.lng) {
      newMarkers.driver = new window.google.maps.Marker({
        position: { lat: driverLocation.lat, lng: driverLocation.lng },
        map: map,
        title: 'Driver',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="#2196F3" stroke="white" stroke-width="2"/>
              <text x="20" y="26" font-size="20" text-anchor="middle" fill="white">🚗</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20),
        },
        animation: window.google.maps.Animation.BOUNCE,
      });

      // Center on driver
      map.setCenter({ lat: driverLocation.lat, lng: driverLocation.lng });
    }

    setMarkers(newMarkers);
  }, [map, pickup, dropoff, driverLocation, markers]);

  function geocodeAddress(address, callback) {
    if (!window.google) return;
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        callback(results[0].geometry.location);
      }
    });
  }

  const drawRoute = useCallback(() => {
    if (!directionsRenderer || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    // Build waypoints array for multi-stop journeys
    const waypointsArray = waypoints
      .filter(w => w && w.trim())
      .map(location => ({
        location,
        stopover: true
      }));
    
    directionsService.route(
      {
        origin: pickup,
        destination: dropoff,
        waypoints: waypointsArray,
        optimizeWaypoints: true, // Optimize route order
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
          
          // Log optimized waypoint order if route was optimized
          if (waypointsArray.length > 0 && result.routes[0].waypoint_order) {
            /* optimized waypoint order available */
          }
        }
      }
    );
  }, [directionsRenderer, pickup, dropoff, waypoints]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border-2 border-gray-300" style={{ height }}>
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map overlay with info */}
      <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg text-sm">
        {nearbyDrivers.length > 0 ? (
          <>
            <p className="font-semibold text-gray-700">📍 Nearby Shuttles</p>
            <p className="text-xs text-orange-600">{nearbyDrivers.length} available</p>
          </>
        ) : (
          <>
            <p className="font-semibold text-gray-700">Live Tracking</p>
            {driverLocation && (
              <p className="text-xs text-brand-orange">🔴 Driver location updating</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
