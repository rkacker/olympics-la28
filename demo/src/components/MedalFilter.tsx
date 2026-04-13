import { Badge } from "@/components/ui/badge";
import type { MedalCategories } from "@/types";

interface MedalFilterToggleProps {
  value: MedalCategories;
  onChange: (value: MedalCategories) => void;
  counts: { prelim: number; bronze: number; gold: number };
}

const options: { key: keyof MedalCategories; label: string }[] = [
  { key: "prelim", label: "Prelim" },
  { key: "bronze", label: "Bronze" },
  { key: "gold", label: "Gold" },
];

export function MedalFilterToggle({ value, onChange, counts }: MedalFilterToggleProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">
        Rounds:
      </span>
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange({ ...value, [opt.key]: !value[opt.key] })}
          className="inline-flex items-center"
        >
          <Badge
            variant={value[opt.key] ? "default" : "secondary"}
            className="cursor-pointer gap-1.5"
          >
            {opt.label}
            <span className="opacity-70">{counts[opt.key]}</span>
          </Badge>
        </button>
      ))}
    </div>
  );
}
