import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { venues } from "@/lib/data";
import type { Session } from "@/types";

const LA_CENTER: [number, number] = [33.95, -118.25];
const LA_ZOOM = 10;

interface MapViewProps {
  filteredSessions: Session[];
  venueCounts: Map<string, number>;
}

function FitBounds({ venueCounts }: { venueCounts: Map<string, number> }) {
  const map = useMap();
  useEffect(() => {
    if (venueCounts.size === 0) return;
    const bounds: [number, number][] = [];
    for (const [name] of venueCounts) {
      const v = venues[name];
      if (v?.is_la_area) bounds.push([v.lat, v.lng]);
    }
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [venueCounts, map]);
  return null;
}

function getRadius(count: number): number {
  if (count === 0) return 4;
  if (count <= 2) return 6;
  if (count <= 5) return 9;
  if (count <= 10) return 12;
  if (count <= 20) return 15;
  return 18;
}

function getColor(count: number): string {
  if (count === 0) return "#94a3b8";
  if (count <= 2) return "#3b82f6";
  if (count <= 5) return "#8b5cf6";
  if (count <= 10) return "#f59e0b";
  return "#ef4444";
}

export function MapView({ filteredSessions, venueCounts }: MapViewProps) {
  const laVenues = Object.entries(venues).filter(
    ([name, v]) => v.is_la_area && name !== "N/A" && name !== "TBD"
  );

  const remoteVenues = Object.entries(venues).filter(
    ([name, v]) => !v.is_la_area && name !== "N/A" && name !== "TBD"
  );

  const remoteCounts = remoteVenues
    .map(([name, v]) => ({
      name,
      localName: v.local_name,
      city: v.city,
      state: v.state,
      count: venueCounts.get(name) || 0,
    }))
    .filter((r) => r.count > 0);

  return (
    <div className="space-y-2">
      <MapContainer
        center={LA_CENTER}
        zoom={LA_ZOOM}
        className="h-[500px] w-full rounded-lg border"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds venueCounts={venueCounts} />
        {laVenues.map(([name, v]) => {
          const count = venueCounts.get(name) || 0;
          if (count === 0) return null;
          const sessionsAtVenue = filteredSessions.filter(
            (s) => s.venue === name
          );
          const displayName = v.local_name || name;

          return (
            <CircleMarker
              key={name}
              center={[v.lat, v.lng]}
              radius={getRadius(count)}
              fillColor={getColor(count)}
              fillOpacity={count > 0 ? 0.8 : 0.3}
              color={count > 0 ? "#1e293b" : "#94a3b8"}
              weight={1}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <p className="font-bold text-sm">{displayName}</p>
                  {v.local_name && (
                    <p className="text-xs text-gray-500">Official: {name}</p>
                  )}
                  <p className="text-xs text-gray-500">{v.city}, {v.state}</p>
                  <p className="text-xs font-semibold mt-1">
                    {count} session{count !== 1 ? "s" : ""}
                  </p>
                  {sessionsAtVenue.length > 0 && (
                    <ul className="mt-1 text-xs space-y-0.5 max-h-[150px] overflow-y-auto">
                      {sessionsAtVenue.slice(0, 10).map((s) => (
                        <li key={s.session_code}>
                          <span className="font-medium">{s.sport}</span>{" "}
                          {s.start_time}–{s.end_time}
                        </li>
                      ))}
                      {sessionsAtVenue.length > 10 && (
                        <li className="text-gray-400">
                          +{sessionsAtVenue.length - 10} more
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {remoteCounts.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Outside LA: </span>
          {remoteCounts.map((r, i) => (
            <span key={r.name}>
              {i > 0 && ", "}
              {r.localName || r.name} ({r.city}, {r.count} sessions)
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
