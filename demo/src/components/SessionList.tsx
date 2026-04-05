import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { venues } from "@/lib/data";
import type { Session } from "@/types";

interface SessionListProps {
  sessions: Session[];
  maxDisplay?: number;
}

export function SessionList({ sessions, maxDisplay = 50 }: SessionListProps) {
  const displayed = sessions.slice(0, maxDisplay);
  const remaining = sessions.length - displayed.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          Sessions ({sessions.length})
        </h3>
      </div>
      <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
        {displayed.map((s) => {
          const venue = venues[s.venue];
          const displayName = venue?.local_name || s.venue;
          return (
            <Card key={s.session_code} className="py-2">
              <CardContent className="px-3 py-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-sm">{s.sport}</span>
                  <Badge
                    variant={s.session_type === "Final" ? "default" : "secondary"}
                    className="text-xs shrink-0"
                  >
                    {s.session_type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {displayName} &middot; {s.start_time}–{s.end_time}
                  {s.times_are_local !== "PT" && ` (${s.times_are_local})`}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {s.events.join(", ")}
                </p>
              </CardContent>
            </Card>
          );
        })}
        {remaining > 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            +{remaining} more sessions
          </p>
        )}
        {sessions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No sessions match the current filters
          </p>
        )}
      </div>
    </div>
  );
}
