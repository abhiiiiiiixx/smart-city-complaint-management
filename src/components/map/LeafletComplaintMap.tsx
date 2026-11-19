import React, { useEffect, useRef } from 'react';
import { Complaint } from '../../types/database';
import L from 'leaflet';

interface LeafletComplaintMapProps {
  complaints?: Complaint[];
  selectedLocation?: { lat: number; lng: number } | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  center?: [number, number];
  zoom?: number;
  interactiveSelect?: boolean;
  onComplaintClick?: (complaint: Complaint) => void;
  height?: string;
}

export const LeafletComplaintMap: React.FC<LeafletComplaintMapProps> = ({
  complaints = [],
  selectedLocation,
  onLocationSelect,
  center = [23.1678, 79.9328], // Default to Jabalpur Civic Centre coordinates
  zoom = 13,
  interactiveSelect = false,
  onComplaintClick,
  height = '420px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);

  // Helper to create clean custom HTML markers with SVG
  const createMarkerIcon = (color: string, label?: string) => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${color};
          color: white;
          border: 2px solid white;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
          font-weight: bold;
          font-size: 11px;
        ">
          ${label || '📍'}
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Handle map clicks for selecting complaint location
      if (interactiveSelect && onLocationSelect) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when props change
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Update existing complaint markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    complaints.forEach((comp) => {
      if (!comp.latitude || !comp.longitude) return;

      let color = '#3b82f6'; // default blue
      if (comp.priority === 'Critical') color = '#e11d48'; // red
      else if (comp.priority === 'High') color = '#f59e0b'; // amber
      else if (comp.status === 'Resolved') color = '#10b981'; // green

      const marker = L.marker([comp.latitude, comp.longitude], {
        icon: createMarkerIcon(color, comp.priority === 'Critical' ? '⚠️' : '📍'),
      });

      const popupContent = `
        <div style="font-family: Inter, sans-serif; padding: 12px; min-width: 200px;">
          <div style="font-size: 11px; font-weight: 700; color: #0f2942; letter-spacing: 0.5px;">${comp.complaint_number}</div>
          <div style="font-weight: 600; font-size: 13px; margin: 4px 0; color: #1e293b;">${comp.title}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${comp.ward_or_area}</div>
          <div style="display: flex; gap: 6px; font-size: 10px; font-weight: 600;">
            <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${comp.status}</span>
            <span style="background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px;">${comp.priority}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      if (onComplaintClick) {
        marker.on('click', () => {
          onComplaintClick(comp);
        });
      }

      markersLayerRef.current?.addLayer(marker);
    });
  }, [complaints, onComplaintClick]);

  // Update selected location marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove();
      selectedMarkerRef.current = null;
    }

    if (selectedLocation) {
      const pinIcon = createMarkerIcon('#0D9488', '📌');
      const pin = L.marker([selectedLocation.lat, selectedLocation.lng], {
        icon: pinIcon,
        zIndexOffset: 1000,
      }).addTo(mapInstanceRef.current);

      pin.bindPopup(
        `<div style="font-family: Inter, sans-serif; padding: 8px; font-size: 12px;">
          <strong>Selected Location</strong><br/>
          Lat: ${selectedLocation.lat.toFixed(4)}, Lng: ${selectedLocation.lng.toFixed(4)}
        </div>`
      );

      selectedMarkerRef.current = pin;
    }
  }, [selectedLocation]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
      {interactiveSelect && (
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 shadow-md flex items-center gap-1.5">
          <span>👆 Click anywhere on map to drop grievance pin</span>
        </div>
      )}
    </div>
  );
};
