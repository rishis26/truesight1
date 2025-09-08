import React, { useEffect, useRef, useState } from 'react';
import { GlassCard } from './ui/GlassCard';

const LocationHeatmapView = ({ heatmapData = [] }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [infoWindow, setInfoWindow] = useState(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // Validate heatmapData prop - return null if invalid
  if (!Array.isArray(heatmapData) || heatmapData.length === 0) {
    return null;
  }

  // Filter out invalid entries (missing required properties)
  const validHeatmapData = heatmapData.filter(item => 
    item && 
    item.location && 
    item.coordinates && 
    typeof item.coordinates === 'object' &&
    typeof item.coordinates.lat === 'number' &&
    typeof item.coordinates.lng === 'number'
  );

  // If no valid data after filtering, return null
  if (validHeatmapData.length === 0) {
    return null;
  }

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        setIsGoogleMapsLoaded(true);
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="mapsJavaScriptAPI.js"]');
      if (existingScript) {
        // Script is already loading, wait for it
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkLoaded);
            setIsGoogleMapsLoaded(true);
          }
        }, 100);
        
        // Cleanup after 10 seconds
        setTimeout(() => {
          clearInterval(checkLoaded);
        }, 10000);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWWgQjKqJ1Z0Y&libraries=places';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Add a small delay to ensure Google Maps is fully initialized
        setTimeout(() => {
          if (window.google && window.google.maps) {
            setIsGoogleMapsLoaded(true);
          }
        }, 100);
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        setIsGoogleMapsLoaded(false);
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapRef.current || map) return;

    const initializeMap = () => {
      try {
        // Ensure Google Maps is fully loaded
        if (!window.google || !window.google.maps || !window.google.maps.Map) {
          console.error('Google Maps not fully loaded');
          return;
        }

        // Calculate bounds to fit all markers
        const bounds = new window.google.maps.LatLngBounds();
        validHeatmapData.forEach(item => {
          bounds.extend(new window.google.maps.LatLng(item.coordinates.lat, item.coordinates.lng));
        });

        const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 10,
        center: bounds.getCenter(),
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry.fill',
            stylers: [{ weight: '2.00' }]
          },
          {
            featureType: 'all',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#9c9c9c' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.text',
            stylers: [{ visibility: 'on' }]
          },
          {
            featureType: 'landscape',
            elementType: 'all',
            stylers: [{ color: '#f2f2f2' }]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry.fill',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'landscape.man_made',
            elementType: 'geometry.fill',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'poi',
            elementType: 'all',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'road',
            elementType: 'all',
            stylers: [{ saturation: -100 }, { lightness: 45 }]
          },
          {
            featureType: 'road',
            elementType: 'geometry.fill',
            stylers: [{ color: '#eeeeee' }]
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#7b7b7b' }]
          },
          {
            featureType: 'road',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'all',
            stylers: [{ visibility: 'simplified' }]
          },
          {
            featureType: 'road.arterial',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'all',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'water',
            elementType: 'all',
            stylers: [{ color: '#46bcec' }, { visibility: 'on' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry.fill',
            stylers: [{ color: '#c8d7d4' }]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#070707' }]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#ffffff' }]
          }
        ]
      });

      // Fit map to bounds with padding
      mapInstance.fitBounds(bounds);
      const listener = window.google.maps.event.addListener(mapInstance, 'idle', () => {
        if (mapInstance.getZoom() > 15) mapInstance.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });

        setMap(mapInstance);
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsGoogleMapsLoaded(false);
      }
    };

    initializeMap();
  }, [isGoogleMapsLoaded, validHeatmapData]);

  // Create markers when map is ready
  useEffect(() => {
    if (!map || !isGoogleMapsLoaded) return;

    try {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));

      const newMarkers = [];
      const newInfoWindow = new window.google.maps.InfoWindow();

    validHeatmapData.forEach((item, index) => {
      // Determine marker color based on risk score
      let markerColor = '#ef4444'; // Default red for high risk
      if (item.riskScore !== undefined) {
        if (item.riskScore >= 80) markerColor = '#dc2626'; // Critical - dark red
        else if (item.riskScore >= 60) markerColor = '#ef4444'; // High - red
        else if (item.riskScore >= 40) markerColor = '#f59e0b'; // Medium - orange
        else if (item.riskScore >= 20) markerColor = '#eab308'; // Low - yellow
        else markerColor = '#22c55e'; // Very low - green
      }

      // Create custom marker
      const marker = new window.google.maps.Marker({
        position: { lat: item.coordinates.lat, lng: item.coordinates.lng },
        map: map,
        title: item.location,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: markerColor,
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        animation: window.google.maps.Animation.DROP
      });

      // Create info window content with conditional rendering
      const infoContent = `
        <div style="padding: 12px; max-width: 300px; font-family: 'Segoe UI', sans-serif;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
            ${item.location}
          </h3>
          ${item.time ? `<p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Time:</strong> ${item.time}</p>` : ''}
          ${item.placeType ? `<p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Type:</strong> ${item.placeType}</p>` : ''}
          ${item.riskScore !== undefined ? `<p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Risk Score:</strong> ${item.riskScore}%</p>` : ''}
          ${item.interpretation ? `<p style="margin: 8px 0 0 0; color: #374151; font-size: 13px; line-height: 1.4;">${item.interpretation}</p>` : ''}
        </div>
      `;

      // Add click listener to marker
      marker.addListener('click', () => {
        newInfoWindow.setContent(infoContent);
        newInfoWindow.open(map, marker);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
    setInfoWindow(newInfoWindow);

      // Cleanup function
      return () => {
        newMarkers.forEach(marker => marker.setMap(null));
      };
    } catch (error) {
      console.error('Error creating markers:', error);
    }
  }, [map, isGoogleMapsLoaded, validHeatmapData]);

  // Loading state
  if (!isGoogleMapsLoaded) {
    return (
      <GlassCard variant="medium" elevation={2} className="p-6" glow={true}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading map...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              If this takes too long, the map may be blocked by your browser
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Error state
  if (isGoogleMapsLoaded === false) {
    return (
      <GlassCard variant="medium" elevation={2} className="p-6" glow={true}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">Map failed to load</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This might be due to browser restrictions or network issues
            </p>
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Location data: {validHeatmapData.length} locations detected
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="medium" elevation={2} className="p-6" glow={true}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            🗺️ Threat Location Heatmap
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {validHeatmapData.length} location{validHeatmapData.length !== 1 ? 's' : ''} detected
          </div>
        </div>
        
        <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span className="text-gray-600 dark:text-gray-300">Critical (80%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600 dark:text-gray-300">High (60-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-gray-600 dark:text-gray-300">Medium (40-59%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600 dark:text-gray-300">Low (20-39%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-300">Very Low (0-19%)</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default LocationHeatmapView;
