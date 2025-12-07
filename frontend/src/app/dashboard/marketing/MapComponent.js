'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Marker colors based on type
const markerColors = {
  banner: 'red',
  reklama: 'blue',
  hamkor: 'green'
};

// Andijan region coordinates and zoom level
const ANDIJAN_CENTER = [72.3442, 40.7821];
const ANDIJAN_ZOOM = 9;

const MapComponent = ({ markers = [], onMapClick }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    const initializeMap = () => {
      if (map.current) return;

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [{
            id: 'osm',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19
          }]
        },
        center: [72.3442, 40.7821], // Andijan coordinates
        zoom: 9
      });

      // Add navigation controls
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
      
      // Add fullscreen control
      map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

      map.current.on('load', () => {
        setLoading(false);
      });

      map.current.on('click', (e) => {
        if (onMapClick) {
          onMapClick({
            lat: e.lngLat.lat,
            lng: e.lngLat.lng
          });
        }
      });
    };

    // Add a small delay to ensure the container is ready
    const timer = setTimeout(initializeMap, 100);

    return () => {
      clearTimeout(timer);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onMapClick]);

  useEffect(() => {
    if (!map.current || !markers.length) return;

    // Remove existing markers
    const markers = document.getElementsByClassName('maplibregl-marker');
    while (markers[0]) {
      markers[0].remove();
    }

    // Add new markers
    markers.forEach(marker => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.backgroundImage = 'url(https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png)';
      el.style.backgroundSize = 'cover';
      el.style.cursor = 'pointer';

      const popup = new maplibregl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-gray-900">${marker.name}</h3>
            <p class="text-gray-700">${marker.district}</p>
            <p class="text-gray-700">${marker.address}</p>
            <p class="text-gray-700">${marker.phone}</p>
            <p class="text-gray-700">${marker.status}</p>
          </div>
        `);

      new maplibregl.Marker(el)
        .setLngLat([marker.lng, marker.lat])
        .setPopup(popup)
        .addTo(map.current);
    });
  }, [markers]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default MapComponent; 