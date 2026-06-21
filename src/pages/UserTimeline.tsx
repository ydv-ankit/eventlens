import { usersApi } from "@/api/users";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Event } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

function TimelineEvent({ event }: { event: Event }) {
  const [expanded, setExpanded] = useState(false);
  const hasMetadata = Object.keys(event.metadata).length > 0;

  return (
    <div className="relative pl-6">
      <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary" />
      <div className="absolute left-[3.5px] top-4 bottom-0 w-px bg-border" />

      <div className="pb-6">
        <button
          className="flex w-full items-start gap-3 text-left"
          onClick={() => hasMetadata && setExpanded((e) => !e)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium text-foreground">{event.event_name}</span>
              {hasMetadata && (expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />)}
            </div>
            <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
              {format(parseISO(event.timestamp), "MMM d, yyyy HH:mm:ss")}
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] shrink-0">
            p{event.project_id}
          </Badge>
        </button>

        {expanded && hasMetadata && (
          <pre className="mt-2 rounded-md bg-muted px-3 py-2 font-mono text-[11px] text-foreground overflow-auto">
            {JSON.stringify(event.metadata, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

export default function UserTimeline() {
  const { id: userId } = useParams<{ id: string }>();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["user", userId, "events"],
    queryFn: () => usersApi.timeline(userId!),
    enabled: !!userId,
  });

  return (
    <div>
      <PageHeader
        title="User Timeline"
        description={<span className="font-mono">{userId}</span>}
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}
        </div>
      ) : events.length === 0 ? (
        <EmptyState icon={Users} title="No events found" description="This user has no recorded events." />
      ) : (
        <div className="max-w-2xl">
          {events.map((e) => <TimelineEvent key={e.id} event={e} />)}
        </div>
      )}
    </div>
  );
}
