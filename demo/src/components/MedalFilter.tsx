import { Button } from "@/components/ui/button";
import type { MedalCategories } from "@/types";

interface MedalFilterToggleProps {
  value: MedalCategories;
  onChange: (value: MedalCategories) => void;
}

const options: { key: keyof MedalCategories; label: string }[] = [
  { key: "prelim", label: "Prelim" },
  { key: "bronze", label: "Bronze" },
  { key: "gold", label: "Gold" },
];

export function MedalFilterToggle({ value, onChange }: MedalFilterToggleProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground mr-1">Medals:</span>
      {options.map((opt) => (
        <Button
          key={opt.key}
          size="sm"
          variant={value[opt.key] ? "default" : "outline"}
          onClick={() => onChange({ ...value, [opt.key]: !value[opt.key] })}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
