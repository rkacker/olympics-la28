import { useEffect, useState, useMemo, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { venues, formatDate } from "@/lib/data";
import type { Session } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LA_CENTER: [number, number] = [33.95, -118.25];
const LA_ZOOM = 10;
const REMOTE_ZOOM = 12;

interface MapViewProps {
  filteredSessions: Session[];
  venueCounts: Map<string, number>;
}

/** Groups non-LA venues by city, returning city name, coordinates, and total session count. */
function useRemoteCities(venueCounts: Map<string, number>) {
  return useMemo(() => {
    const cityMap = new Map<
      string,
      { city: string; state: string; lat: number; lng: number; count: number }
    >();
    for (const [name, v] of Object.entries(venues)) {
      if (v.is_la_area || name === "N/A" || name === "TBD") continue;
      const count = venueCounts.get(name) || 0;
      if (count === 0) continue;
      const key = `${v.city}, ${v.state}`;
      const existing = cityMap.get(key);
      if (existing) {
        existing.count += count;
      } else {
        cityMap.set(key, {
          city: v.city,
          state: v.state,
          lat: v.lat,
          lng: v.lng,
          count,
        });
      }
    }
    return [...cityMap.values()].sort((a, b) => b.count - a.count);
  }, [venueCounts]);
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

function FlyToControl({
  target,
  onReset,
}: {
  target: { lat: number; lng: number; label: string } | null;
  onReset: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], REMOTE_ZOOM, { duration: 1.2 });
    } else {
      map.flyTo(LA_CENTER, LA_ZOOM, { duration: 1.2 });
    }
  }, [target, map]);

  if (!target) return null;

  return (
    <div className="leaflet-top leaflet-right" style={{ pointerEvents: "auto" }}>
      <div className="leaflet-control m-2">
        <Button
          size="sm"
          variant="default"
          className="shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
        >
          ← Back to LA
        </Button>
      </div>
    </div>
  );
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
  const allVenues = Object.entries(venues).filter(
    ([name]) => name !== "N/A" && name !== "TBD"
  );

  const remoteCities = useRemoteCities(venueCounts);

  const [flyTarget, setFlyTarget] = useState<{
    lat: number;
    lng: number;
    label: string;
  } | null>(null);

  const handleCityClick = useCallback(
    (city: { city: string; state: string; lat: number; lng: number }) => {
      setFlyTarget({
        lat: city.lat,
        lng: city.lng,
        label: `${city.city}, ${city.state}`,
      });
    },
    []
  );

  const handleBackToLA = useCallback(() => {
    setFlyTarget(null);
  }, []);

  return (
    <div className="space-y-2">
      {remoteCities.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Venues:
          </span>
          <button
            onClick={() => flyTarget ? handleBackToLA() : undefined}
            className="inline-flex items-center"
          >
            <Badge
              variant={!flyTarget ? "default" : "secondary"}
              className="cursor-pointer gap-1.5"
            >
              LA Area
            </Badge>
          </button>
          {remoteCities.map((rc) => {
            const label = `${rc.city}, ${rc.state}`;
            const isActive = flyTarget?.label === label;
            return (
              <button
                key={label}
                onClick={() =>
                  isActive ? handleBackToLA() : handleCityClick(rc)
                }
                className="inline-flex items-center"
              >
                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className="cursor-pointer gap-1.5"
                >
                  {rc.city}
                  <span className="opacity-70">{rc.count}</span>
                </Badge>
              </button>
            );
          })}
        </div>
      )}

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
        {!flyTarget && <FitBounds venueCounts={venueCounts} />}
        <FlyToControl target={flyTarget} onReset={handleBackToLA} />
        {allVenues.map(([name, v]) => {
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
                          <span className="text-gray-500">
                            {formatDate(s.date)}{s.start_time ? ` · ${s.start_time}–${s.end_time}` : ""}
                          </span>
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
    </div>
  );
}
