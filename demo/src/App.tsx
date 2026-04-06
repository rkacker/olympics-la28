import { useState, useMemo, useCallback } from "react";
import { MapView, type GeoFilter } from "@/components/Map";
import { DateSlider } from "@/components/DateSlider";
import { SportFilter } from "@/components/SportFilter";
import { SessionList } from "@/components/SessionList";
import { MedalFilterToggle } from "@/components/MedalFilter";
import {
  ALL_DATES,
  DEFAULT_DATE_RANGE,
  filterSessions,
  getVenueSessionCounts,
  sessions,
  venues,
} from "@/lib/data";
import type { MedalFilter } from "@/types";

function App() {
  const [dateRange, setDateRange] = useState<[number, number] | null>(DEFAULT_DATE_RANGE);
  const [selectedSports, setSelectedSports] = useState<Set<string>>(new Set());
  const [medalFilter, setMedalFilter] = useState<MedalFilter>("all");
  const [geoFilter, setGeoFilter] = useState<GeoFilter>("all");

  const filteredSessions = useMemo(
    () => filterSessions(dateRange, selectedSports, medalFilter),
    [dateRange, selectedSports, medalFilter]
  );

  const venueCounts = useMemo(
    () => getVenueSessionCounts(filteredSessions),
    [filteredSessions]
  );

  const geoFilteredSessions = useMemo(() => {
    if (geoFilter === "all") {
      return filteredSessions.filter((s) => {
        const v = venues[s.venue];
        return v?.is_la_area;
      });
    }
    if (geoFilter === "TBD") return filteredSessions.filter((s) => s.venue === "N/A" || s.venue === "TBD");
    return filteredSessions.filter((s) => {
      const v = venues[s.venue];
      return v && `${v.city}, ${v.state}` === geoFilter;
    });
  }, [filteredSessions, geoFilter]);

  // Count sessions by sport for the selected date range (ignoring sport filter)
  const sportSessionCounts = useMemo(() => {
    const startDate = dateRange !== null ? ALL_DATES[dateRange[0]] : null;
    const endDate = dateRange !== null ? ALL_DATES[dateRange[1]] : null;
    const dateSessions = sessions.filter((s) => {
      if (startDate && endDate && (s.date < startDate || s.date > endDate))
        return false;
      return true;
    });
    const counts = new Map<string, number>();
    for (const s of dateSessions) {
      counts.set(s.sport, (counts.get(s.sport) || 0) + 1);
    }
    return counts;
  }, [dateRange]);

  const toggleSport = useCallback((sport: string) => {
    setSelectedSports((prev) => {
      const next = new Set(prev);
      if (next.has(sport)) next.delete(sport);
      else next.add(sport);
      return next;
    });
  }, []);

  const clearSports = useCallback(() => setSelectedSports(new Set()), []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">
              LA 2028 Olympics Schedule Explorer
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {sessions.length} sessions across {ALL_DATES.length} days
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            <span>Source PDFs: </span>
            <a href="https://la28.org/content/dam/latwentyeight/competition-schedule-imagery/uploaded-march-16-v-3-0/LA28OlympicGamesCompetitionScheduleByDayV3.0.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline">By Day</a>
            {" · "}
            <a href="https://la28.org/content/dam/latwentyeight/competition-schedule-imagery/uploaded-march-16-v-3-0/LA28OlympicGamesCompetitionScheduleByEventV3.0.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline">By Event</a>
            {" · "}
            <a href="https://la28.org/content/dam/latwentyeight/competition-schedule-imagery/uploaded-march-16-v-3-0/LA28OlympicGamesCompetitionScheduleBySessionV3.0.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline">By Session</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="mb-4">
          <DateSlider
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
          {/* Filters: show first on mobile, in sidebar on desktop */}
          <aside className="lg:border-l lg:pl-4 space-y-4 order-first lg:order-last lg:col-start-2 lg:row-start-1 lg:row-span-2">
            <MedalFilterToggle value={medalFilter} onChange={setMedalFilter} />
            <SportFilter
              selectedSports={selectedSports}
              onToggleSport={toggleSport}
              onClearAll={clearSports}
              sessionCounts={sportSessionCounts}
            />
          </aside>

          <div className="space-y-4 order-last lg:order-first">
            <MapView
              filteredSessions={filteredSessions}
              venueCounts={venueCounts}
              geoFilter={geoFilter}
              onGeoFilterChange={setGeoFilter}
            />
            <SessionList sessions={geoFilteredSessions} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
