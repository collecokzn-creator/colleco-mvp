import React, { useEffect, useRef, useState } from 'react';

export default function LiveMap({ pickup, dropoff, driverLocation, showRoute = true }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState({ pickup: null, dropoff: null, driver: null });
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
  }, [map, pickup, dropoff, driverLocation, showRoute]);

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

  function updateMapMarkers() {
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
  }

  function geocodeAddress(address, callback) {
    if (!window.google) return;
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        callback(results[0].geometry.location);
      }
    });
  }

  function drawRoute() {
    if (!directionsRenderer || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: pickup,
        destination: dropoff,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
        }
      }
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden border-2 border-gray-300">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map overlay with info */}
      <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg text-sm">
        <p className="font-semibold text-gray-700">Live Tracking</p>
        {driverLocation && (
          <p className="text-xs text-green-600">🔴 Driver location updating</p>
        )}
      </div>
    </div>
  );
}
