import { Button } from "@/components/ui/button";
import type { MedalFilter } from "@/types";

interface MedalFilterToggleProps {
  value: MedalFilter;
  onChange: (value: MedalFilter) => void;
}

const options: { value: MedalFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "gold", label: "Gold" },
  { value: "bronze", label: "Bronze" },
];

export function MedalFilterToggle({ value, onChange }: MedalFilterToggleProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground mr-1">Medals:</span>
      {options.map((opt) => (
        <Button
          key={opt.value}
          size="sm"
          variant={value === opt.value ? "default" : "outline"}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
