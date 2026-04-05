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
        <div className="flex items-center gap-2">
          {!isAllDates && (
            <button
              onClick={() => onDateRangeChange(null)}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Include prelims
            </button>
          )}
          <span className="text-sm font-semibold">
            {isAllDates ? "All dates (incl. prelims)" : formatRangeLabel(range)}
          </span>
        </div>
      </div>
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
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Prelims · {formatDate(ALL_DATES[0])}</span>
        <span className="text-center">Day 0 · {formatDate(ALL_DATES[DAY_0_INDEX])}</span>
        <span>Day 16 · {formatDate(ALL_DATES[maxIndex])}</span>
      </div>
    </div>
  );
}
