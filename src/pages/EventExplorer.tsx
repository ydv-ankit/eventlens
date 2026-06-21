import { eventsApi, type EventFilters } from "@/api/events";
import { EventDetailDrawer } from "@/components/common/EventDetailDrawer";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectStore } from "@/store/useProjectStore";
import type { Event } from "@/types/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Activity, Filter } from "lucide-react";
import { useState } from "react";

export default function EventExplorer() {
  const { selectedProject } = useProjectStore();

  const [filters, setFilters] = useState<Omit<EventFilters, "cursor" | "project_id">>({
    event_name: "",
    user_id: "",
    from: "",
    to: "",
    limit: 50,
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const projectId = selectedProject?.id ?? 0;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["events", filters],
    queryFn: ({ pageParam }) =>
      eventsApi.list({ ...filters, project_id: projectId, cursor: pageParam as string | undefined }),
    getNextPageParam: (last) => last.pagination.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!projectId,
  });

  const allEvents = data?.pages.flatMap((p) => p.events) ?? [];

  const setF = (key: keyof typeof filters, value: string | number) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="flex h-full gap-4">
      <aside className="w-56 shrink-0 space-y-4">
        {[
          { label: "Event Name", key: "event_name" as const, placeholder: "page_view" },
          { label: "User ID",    key: "user_id"    as const, placeholder: "user_123" },
          { label: "From",       key: "from"       as const, placeholder: "2026-01-01" },
          { label: "To",         key: "to"         as const, placeholder: "2026-12-31" },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <Label className="text-xs mb-1.5 block">{label}</Label>
            <Input
              className="h-8 text-xs font-mono"
              placeholder={placeholder}
              value={String(filters[key] ?? "")}
              onChange={(e) => setF(key, e.target.value)}
            />
          </div>
        ))}
      </aside>

      <div className="flex-1 overflow-auto">
        {!projectId ? (
          <EmptyState icon={Filter} title="No project selected" description="Select a project from the top bar to explore events." />
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}
          </div>
        ) : allEvents.length === 0 ? (
          <EmptyState icon={Activity} title="No events found" description="Try adjusting your filters." />
        ) : (
          <>
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-auto max-h-[calc(100vh-12rem)]">
              <table className="w-full text-xs">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-border bg-muted">
                    {["Timestamp", "Event", "User ID", "Metadata Preview"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allEvents.map((e) => (
                    <tr
                      key={e.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer"
                      onClick={() => setSelectedEvent(e)}
                    >
                      <td className="px-3 py-2 font-mono text-muted-foreground whitespace-nowrap">
                        {format(parseISO(e.timestamp), "MMM d, HH:mm:ss")}
                      </td>
                      <td className="px-3 py-2 font-mono font-medium text-foreground">{e.event_name}</td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{e.user_id ?? "—"}</td>
                      <td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate">
                        {JSON.stringify(e.metadata).slice(0, 60)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
            {hasNextPage && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline" size="sm" onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? "Loading…" : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <EventDetailDrawer event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
