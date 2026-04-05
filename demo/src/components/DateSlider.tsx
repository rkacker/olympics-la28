import { Slider } from "@/components/ui/slider";
import { ALL_DATES, formatDate, getGamesDay } from "@/lib/data";

interface DateSliderProps {
  selectedDateIndex: number;
  onDateChange: (index: number) => void;
}

export function DateSlider({
  selectedDateIndex,
  onDateChange,
}: DateSliderProps) {
  const date = ALL_DATES[selectedDateIndex];
  const gamesDay = getGamesDay(date);
  const label = gamesDay !== null && gamesDay >= 0 ? `Day ${gamesDay}` : `Day ${gamesDay}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Date</h3>
        <span className="text-sm font-semibold">
          {formatDate(date)} ({label})
        </span>
      </div>
      <Slider
        value={[selectedDateIndex]}
        onValueChange={(v) => onDateChange(Array.isArray(v) ? v[0] : v)}
        min={0}
        max={ALL_DATES.length - 1}
        step={1}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatDate(ALL_DATES[0])}</span>
        <span>{formatDate(ALL_DATES[ALL_DATES.length - 1])}</span>
      </div>
    </div>
  );
}
