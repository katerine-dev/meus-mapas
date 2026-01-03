'use client';

import { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
  ZoomControl,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Point } from '@/app/model/point';

// Ícone padrão do marker
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: '',
});

// Ícone do marker selecionado (vermelho com animação)
const selectedIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'selected-marker',
});

interface LeafletMapProps {
  center: [number, number];
  points: Point[];
  selectedPointId: string | null;
  onMapClick: (lat: number, lng: number) => void;
  onMarkerClick: (pointId: string) => void;
}

// Componente para capturar cliques no mapa
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      console.log('Map click event:', e.latlng.lat, e.latlng.lng);
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Componente para atualizar o centro do mapa
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  const prevCenter = useRef(center);

  useEffect(() => {
    if (prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1]) {
      map.setView(center, 13);
      prevCenter.current = center;
    }
  }, [center, map]);

  return null;
}

export default function LeafletMap({
  center,
  points,
  selectedPointId,
  onMapClick,
  onMarkerClick,
}: LeafletMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ZoomControl position="bottomright" />
      <MapClickHandler onMapClick={onMapClick} />
      <MapCenterUpdater center={center} />

      {points.map((point) => {
        const isSelected = point.id === selectedPointId;
        return (
          <Marker
            key={point.id}
            position={[point.location.latitude, point.location.longitude]}
            icon={isSelected ? selectedIcon : defaultIcon}
            eventHandlers={{
              click: () => onMarkerClick(point.id),
            }}
          >
            {isSelected && (
              <Popup autoPan={false}>
                <span>{point.name}</span>
              </Popup>
            )}
          </Marker>
        );
      })}
    </MapContainer>
  );
}
