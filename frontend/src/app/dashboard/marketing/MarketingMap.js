'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';

// Separate component for map events
function MapEvents({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e);
    }
  });
  return null;
}

export default function MarketingMap({
  markers,
  onMapClick,
  isDarkMode
}) {
  return (
    <MapContainer
      center={[40.7821, 72.3442]}
      zoom={11}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onMapClick={onMapClick} />
      {markers.map(marker => (
        <Marker
          key={marker._id}
          position={[
            marker.location.coordinates[1],
            marker.location.coordinates[0]
          ]}
        >
          <Popup>
            <div>
              <div className="font-bold mb-1">{marker.type.toUpperCase()}</div>
              <div><b>Title:</b> {marker.title || marker.bannerName || marker.reklamaMavzusi || marker.hamkorNomi}</div>
              <div><b>Tuman:</b> {marker.district}</div>
              <div><b>Status:</b> {marker.status}</div>
              <div><b>Manzil:</b> {marker.address}</div>
              <div><b>Izoh:</b> {marker.description}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}