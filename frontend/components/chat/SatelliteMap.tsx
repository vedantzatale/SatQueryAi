"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import type { Geometry } from "geojson";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

interface SatelliteMapProps {
  geometry: Geometry;
}

/** Real Leaflet map (OpenStreetMap tiles) rendering actual GeoJSON geometry —
 * an AOI polygon/point from data provenance, or a georeferenced evidence
 * geometry. Never invents coordinates; callers must only render this when a
 * real geometry exists. */
export function SatelliteMap({ geometry }: SatelliteMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const layer = L.geoJSON(geometry as GeoJSON.GeoJsonObject);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 });
    } else {
      const [lng, lat] = (geometry as GeoJSON.Point).coordinates as [number, number];
      map.setView([lat, lng], 13);
    }
  }, [geometry]);

  return (
    <MapContainer
      ref={mapRef}
      center={[20, 78]}
      zoom={4}
      scrollWheelZoom
      className="h-full w-full"
      attributionControl
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <GeoJSON
        data={geometry as GeoJSON.GeoJsonObject}
        style={{ color: "#34d399", weight: 2, fillColor: "#34d399", fillOpacity: 0.12 }}
        pointToLayer={(_, latlng) => {
          return L.circleMarker(latlng, {
            radius: 8,
            color: "#34d399",
            weight: 2,
            fillColor: "#34d399",
            fillOpacity: 0.5,
          });
        }}
      />
    </MapContainer>
  );
}
