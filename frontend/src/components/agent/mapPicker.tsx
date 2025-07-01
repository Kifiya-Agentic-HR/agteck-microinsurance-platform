'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Don't forget to import Leaflet's CSS

// Define the props for our component
interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  // NEW: Prop to receive coordinates from the parent form
  center?: { lat: number; lng: number }; 
}

// Re-using your custom icon setup
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// NEW: A controller component to programmatically change the map's view
function MapViewController({ center }: { center?: { lat: number, lng: number }}) {
  const map = useMap();
  useEffect(() => {
    // When the center prop changes, move the map view
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], 13); // Zoom to a city-level view
    }
  }, [center, map]);

  return null; // This component does not render anything
}

// UPDATED: The marker now also responds to external coordinate changes
function LocationMarker({ onLocationSelect, center }: MapPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    center ? L.latLng(center.lat, center.lng) : null
  );

  // This effect syncs the marker's position when a search is performed
  useEffect(() => {
    if (center && center.lat && center.lng) {
      setPosition(L.latLng(center.lat, center.lng));
    }
  }, [center]);

  // This hook handles manual clicks on the map
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  );
}

// UPDATED: The main MapPicker component
export default function MapPicker({ onLocationSelect, center }: MapPickerProps) {
  // Set the initial center from the prop, or use a default
  const initialCenter: [number, number] = center && center.lat && center.lng
    ? [center.lat, center.lng]
    : [9.03, 38.74]; // Default to Addis Ababa

  return (
    <MapContainer
      center={initialCenter}
      zoom={10} // Start with a wider zoom
      scrollWheelZoom={true}
      style={{ height: '300px', width: '100%', borderRadius: '12px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* Add the new controller and pass props to the marker */}
      <MapViewController center={center} />
      <LocationMarker onLocationSelect={onLocationSelect} center={center} />
    </MapContainer>
  );
}