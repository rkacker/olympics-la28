import scheduleData from "@/data/schedule.json";
import venuesData from "@/data/venues.json";
import sportsData from "@/data/sports.json";
import type { Session, Venues, Sport, MedalFilter } from "@/types";

export const sessions: Session[] = scheduleData as Session[];
export const venues: Venues = venuesData as Venues;
export const sports: Sport[] = sportsData as Sport[];

export const ALL_DATES = [
  ...new Set(sessions.map((s) => s.date)),
].sort();

export const ALL_SPORTS = [...new Set(sessions.map((s) => s.sport))].sort();

export const CATEGORIES = [...new Set(sports.map((s) => s.category))].sort();

export function filterSessions(
  selectedDate: string | null,
  selectedSports: Set<string>,
  medalFilter: MedalFilter = "all"
): Session[] {
  return sessions.filter((s) => {
    if (selectedDate && s.date !== selectedDate) return false;
    if (selectedSports.size > 0 && !selectedSports.has(s.sport)) return false;
    if (medalFilter === "gold" && !s.has_gold_medal) return false;
    if (medalFilter === "bronze" && !s.has_bronze_medal) return false;
    return true;
  });
}

export function getVenueSessionCounts(
  filteredSessions: Session[]
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const s of filteredSessions) {
    counts.set(s.venue, (counts.get(s.venue) || 0) + 1);
  }
  return counts;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getGamesDay(dateStr: string): number | null {
  const session = sessions.find((s) => s.date === dateStr);
  return session?.games_day ?? null;
}
