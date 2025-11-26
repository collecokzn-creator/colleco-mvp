import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function LiveMap({ pickup, dropoff, driverLocation, showRoute = true, nearbyDrivers = [], height = '400px', waypoints = [], onRouteInfo }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState({ pickup: null, dropoff: null, driver: null });
  const nearbyMarkersRef = useRef([]); // use ref to avoid effect dependency loop
  const [_waypointMarkers, _setWaypointMarkers] = useState([]); // unused currently; reserved for future waypoint visuals
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('[LiveMap] Render:', { pickup, dropoff, driverLocation, showRoute, nearbyDriversCount: nearbyDrivers.length, waypointsCount: waypoints.length, mapExists: !!map });

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google) {
      console.log('[LiveMap] initMap called but mapRef or google not ready');
      return;
    }

    console.log('[LiveMap] Initializing map...');
    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: -29.8587, lng: 31.0218 }, // Durban default
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      setMap(mapInstance);
      setLoading(false);
      console.log('[LiveMap] Map initialized successfully');
      
      const renderer = new window.google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#FF6B35',
          strokeWeight: 4,
        }
      });
      
      setDirectionsRenderer(renderer);
    } catch (e) {
      console.error('[LiveMap] Failed to initialize map:', e);
      setError('Failed to initialize map');
      setLoading(false);
    }
  }, []);

  function geocodeAddress(address, callback) {
    if (!window.google) return;
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        callback(results[0].geometry.location);
      }
    });
  }

  const updateMapMarkers = useCallback(() => {
    if (!map || !window.google) return;

    // Pickup marker - only create if doesn't exist or location changed
    if (pickup) {
      geocodeAddress(pickup, (location) => {
        setMarkers(prev => {
          // Remove old pickup marker if exists
          if (prev.pickup) prev.pickup.setMap(null);
          
          const marker = new window.google.maps.Marker({
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
          return { ...prev, pickup: marker };
        });
      });
    }

    // Dropoff marker - only create if doesn't exist or location changed
    if (dropoff) {
      geocodeAddress(dropoff, (location) => {
        setMarkers(prev => {
          // Remove old dropoff marker if exists
          if (prev.dropoff) prev.dropoff.setMap(null);
          
          const marker = new window.google.maps.Marker({
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
          return { ...prev, dropoff: marker };
        });
      });
    }

    // Driver marker - update position if exists, create if doesn't
    if (driverLocation && driverLocation.lat && driverLocation.lng) {
      setMarkers(prev => {
        const newPosition = { lat: driverLocation.lat, lng: driverLocation.lng };
        
        if (prev.driver) {
          // Just update the position of existing marker
          prev.driver.setPosition(newPosition);
          return prev;
        } else {
          // Create new driver marker
          const marker = new window.google.maps.Marker({
            position: newPosition,
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
          });
          return { ...prev, driver: marker };
        }
      });
    }
  }, [map, pickup, dropoff, driverLocation]);

  const drawRoute = useCallback(() => {
    if (!directionsRenderer || !window.google) return;
    if (!pickup || !dropoff) return;

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

          // Aggregate route metrics and report to parent if requested
          try {
            const legs = result.routes?.[0]?.legs || [];
            const distanceMeters = legs.reduce((sum, l) => sum + (l.distance?.value || 0), 0);
            const durationSeconds = legs.reduce((sum, l) => sum + (l.duration?.value || 0), 0);

            if (typeof onRouteInfo === 'function') {
              onRouteInfo({
                distanceMeters,
                durationSeconds,
                distanceText: legs.map(l => l.distance?.text).filter(Boolean).join(' + ') || null,
                durationText: legs.map(l => l.duration?.text).filter(Boolean).join(' + ') || null,
                legsCount: legs.length
              });
            }
          } catch (_) {
            // no-op
          }
        } else {
          console.error('[LiveMap] Directions request failed:', status);
        }
      }
    );
  }, [directionsRenderer, pickup, dropoff, waypoints, onRouteInfo]);

  useEffect(() => {
    // Load Google Maps script
    console.log('[LiveMap] Script loading effect triggered', { hasGoogle: !!window.google });
    if (!window.google) {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      console.log('[LiveMap] API Key present:', !!apiKey, 'Length:', apiKey?.length);
      if (!apiKey || apiKey === 'YOUR_API_KEY') {
        const errorMsg = 'Google Maps API key is missing or invalid';
        console.error('[LiveMap]', errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      console.log('[LiveMap] Adding Google Maps script to page');
      document.head.appendChild(script);
      
      script.onload = () => {
        console.log('[LiveMap] Google Maps script loaded successfully');
        setTimeout(() => {
          console.log('[LiveMap] Attempting to initialize map');
          initMap();
        }, 100);
      };
      
      script.onerror = (e) => {
        const errorMsg = 'Failed to load Google Maps script - check API key and billing';
        console.error('[LiveMap]', errorMsg, e);
        setError(errorMsg);
        setLoading(false);
      };
    } else {
      console.log('[LiveMap] Google Maps already loaded, initializing directly');
      initMap();
    }
  }, []); // Empty deps - run once on mount only

  useEffect(() => {
    if (map && window.google) {
      updateMapMarkers();
    }
  }, [map, pickup, dropoff, driverLocation]);

  useEffect(() => {
    if (map && window.google && showRoute && pickup && dropoff) {
      drawRoute();
    }
  }, [map, pickup, dropoff, showRoute, waypoints]);

  // Update nearby drivers markers
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing nearby markers
    nearbyMarkersRef.current.forEach(marker => marker.setMap(null));

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

    nearbyMarkersRef.current = newNearbyMarkers;

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
  }, [map, nearbyDrivers, pickup]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border-2 border-gray-300" style={{ height }}>
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-cream/90">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-2"></div>
            <p className="text-sm text-brand-brown">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <div className="text-center p-4">
            <p className="text-red-600 font-semibold">Map Error</p>
            <p className="text-sm text-red-500 mt-1">{error}</p>
          </div>
        </div>
      )}
      
      {/* Map overlay with info */}
      {!loading && !error && (
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {nearbyDrivers.length > 0 ? (
            <>
              <p className="font-semibold text-gray-700">Nearby Shuttles</p>
              <p className="text-xs text-orange-600">{nearbyDrivers.length} available</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-gray-700">Live Tracking</p>
              {driverLocation && (
                <p className="text-xs text-brand-orange">Driver location updating</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
