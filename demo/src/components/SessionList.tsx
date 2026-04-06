import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { venues, formatDate } from "@/lib/data";
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
                  <div className="flex gap-1 shrink-0">
                    {venue && !venue.is_la_area && (
                      <Badge variant="outline" className="text-xs">
                        Remote
                      </Badge>
                    )}
                    {s.has_gold_medal && (
                      <Badge className="text-xs bg-yellow-500 text-yellow-950 hover:bg-yellow-500">
                        Gold
                      </Badge>
                    )}
                    {s.has_bronze_medal && (
                      <Badge className="text-xs bg-amber-700 text-amber-50 hover:bg-amber-700">
                        Bronze
                      </Badge>
                    )}
                    {!s.has_gold_medal && !s.has_bronze_medal && (
                      <Badge variant="secondary" className="text-xs">
                        {s.session_type}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(s.date)} &middot; {s.start_time}–{s.end_time}
                  {s.times_are_local !== "PT" && ` (${s.times_are_local})`}
                  {" · "}{displayName}
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
