import scheduleData from "@/data/schedule.json";
import venuesData from "@/data/venues.json";
import sportsData from "@/data/sports.json";
import type { Session, Venues, Sport, MedalCategories } from "@/types";

export const sessions: Session[] = scheduleData as Session[];
export const venues: Venues = venuesData as Venues;
export const sports: Sport[] = sportsData as Sport[];

export const ALL_DATES = [
  ...new Set(sessions.map((s) => s.date)),
].sort();

export const ALL_SPORTS = [...new Set(sessions.map((s) => s.sport))].sort();

export const CATEGORIES = [...new Set(sports.map((s) => s.category))].sort();

// Index of Day 0 (Opening Ceremony, July 14) and Day 16 (Closing Ceremony, July 30)
export const DAY_0_INDEX = ALL_DATES.indexOf("2028-07-14");
export const DAY_16_INDEX = ALL_DATES.indexOf("2028-07-30");
export const DEFAULT_DATE_RANGE: [number, number] = [DAY_0_INDEX, DAY_16_INDEX];

const DEFAULT_MEDAL_CATEGORIES: MedalCategories = { prelim: true, bronze: true, gold: true };

export function filterSessions(
  dateRange: [number, number] | null,
  selectedSports: Set<string>,
  medalFilter: MedalCategories = DEFAULT_MEDAL_CATEGORIES
): Session[] {
  const startDate = dateRange !== null ? ALL_DATES[dateRange[0]] : null;
  const endDate = dateRange !== null ? ALL_DATES[dateRange[1]] : null;

  return sessions.filter((s) => {
    if (startDate && endDate && (s.date < startDate || s.date > endDate))
      return false;
    if (selectedSports.size > 0 && !selectedSports.has(s.sport)) return false;

    const isPrelim = !s.has_gold_medal && !s.has_bronze_medal;
    const passesMedal =
      (isPrelim && medalFilter.prelim) ||
      (s.has_gold_medal && medalFilter.gold) ||
      (s.has_bronze_medal && medalFilter.bronze);
    if (!passesMedal) return false;

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
