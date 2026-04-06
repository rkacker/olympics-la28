import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { sports, CATEGORIES } from "@/lib/data";

interface SportFilterProps {
  selectedSports: Set<string>;
  onToggleSport: (sport: string) => void;
  onClearAll: () => void;
  sessionCounts: Map<string, number>;
}

export function SportFilter({
  selectedSports,
  onToggleSport,
  onClearAll,
  sessionCounts,
}: SportFilterProps) {
  const [query, setQuery] = useState("");
  const lowerQuery = query.toLowerCase();

  const sportsByCategory = new Map<string, typeof sports>();
  for (const cat of CATEGORIES) {
    const filtered = sports.filter(
      (s) => s.category === cat && s.sport.toLowerCase().includes(lowerQuery)
    );
    if (filtered.length > 0) {
      sportsByCategory.set(cat, filtered);
    }
  }

  // Count sessions per sport from filtered data
  function getSportSessionCount(sportName: string): number {
    return sessionCounts.get(sportName) || 0;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Sports</h3>
        {selectedSports.size > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Clear all ({selectedSports.size})
          </button>
        )}
      </div>
      <input
        type="text"
        placeholder="Search sports..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full text-sm px-2 py-1 rounded-md border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
        {[...sportsByCategory.keys()].map((cat) => (
          <div key={cat}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {cat}
            </p>
            <div className="space-y-0.5">
              {sportsByCategory.get(cat)?.map((s) => {
                const count = getSportSessionCount(s.sport);
                return (
                  <label
                    key={s.sport}
                    className="flex items-center gap-2 py-0.5 cursor-pointer hover:bg-accent/50 rounded px-1"
                  >
                    <Checkbox
                      checked={selectedSports.has(s.sport)}
                      onCheckedChange={() => onToggleSport(s.sport)}
                    />
                    <span className="text-sm flex-1 truncate">{s.sport}</span>
                    {count > 0 && (
                      <Badge variant="secondary" className="text-xs h-5 px-1.5">
                        {count}
                      </Badge>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
