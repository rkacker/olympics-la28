import { Slider } from "@/components/ui/slider";
import { ALL_DATES, DAY_0_INDEX, formatDate, getGamesDay } from "@/lib/data";

interface DateSliderProps {
  dateRange: [number, number] | null;
  onDateRangeChange: (range: [number, number] | null) => void;
}

function formatDayLabel(index: number): string {
  const date = ALL_DATES[index];
  const gamesDay = getGamesDay(date);
  if (gamesDay === null) return formatDate(date);
  if (gamesDay < 0) return `Prelims (Day ${gamesDay})`;
  if (gamesDay === 0) return "Day 0 — Opening Ceremony";
  if (gamesDay === 16) return "Day 16 — Closing Ceremony";
  return `Day ${gamesDay}`;
}

function formatRangeLabel(range: [number, number]): string {
  if (range[0] === range[1]) {
    return `${formatDate(ALL_DATES[range[0]])} · ${formatDayLabel(range[0])}`;
  }
  return `${formatDate(ALL_DATES[range[0]])} – ${formatDate(ALL_DATES[range[1]])}`;
}

export function DateSlider({ dateRange, onDateRangeChange }: DateSliderProps) {
  const maxIndex = ALL_DATES.length - 1;
  const isAllDates = dateRange === null;
  const range = dateRange ?? [0, maxIndex];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Dates</h3>
        <span className="text-sm font-semibold">
          {isAllDates ? "All dates" : formatRangeLabel(range)}
        </span>
      </div>
      <div className="relative">
        <Slider
          value={[range[0], range[1]]}
          onValueChange={(v) => {
            const vals = Array.isArray(v) ? v : [v, v];
            onDateRangeChange([vals[0], vals[1]]);
          }}
          min={0}
          max={maxIndex}
          step={1}
        />
        {/* Tick marks for Prelims start, Day 0, Day 16 */}
        <div className="absolute inset-x-0 top-0 h-full pointer-events-none" aria-hidden>
          {[0, DAY_0_INDEX, maxIndex].map((idx) => (
            <div
              key={idx}
              className="absolute top-1/2 w-px h-3 -translate-y-1/2 bg-muted-foreground/40"
              style={{ left: `${(idx / maxIndex) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
