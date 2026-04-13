import { Badge } from "@/components/ui/badge";
import { ROUND_TYPES, type RoundType } from "@/lib/data";

interface RoundFilterProps {
  selectedRounds: Set<RoundType>;
  onToggleRound: (round: RoundType) => void;
  sessionCounts: Map<RoundType, number>;
}

export function RoundFilter({
  selectedRounds,
  onToggleRound,
  sessionCounts,
}: RoundFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">
        Rounds:
      </span>
      {ROUND_TYPES.map((round) => {
        const count = sessionCounts.get(round) || 0;
        return (
          <button
            key={round}
            onClick={() => onToggleRound(round)}
            className="inline-flex items-center"
          >
            <Badge
              variant={selectedRounds.has(round) ? "default" : "secondary"}
              className="cursor-pointer gap-1.5"
            >
              {round}
              <span className="opacity-70">{count}</span>
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
