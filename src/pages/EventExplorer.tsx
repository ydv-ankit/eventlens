import { eventsApi, type EventFilters } from "@/api/events";
import { EventDetailDrawer } from "@/components/common/EventDetailDrawer";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useProjectStore } from "@/store/useProjectStore";
import type { Event } from "@/types/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Activity, Filter, Loader2, Radio } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface LiveEvent {
  event_name: string;
  user_id: string | null;
  project_id: number;
  timestamp: string;
}

const MAX_LIVE = 50;

export default function EventExplorer() {
  const { selectedProject } = useProjectStore();
  const [liveMode, setLiveMode] = useState(false);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const liveFeedRef = useRef<HTMLDivElement>(null);

  const wsTopic = selectedProject ? `events:project:${selectedProject.id}` : "events";
  const { lastMessage, connected } = useWebSocket(useMemo(() => [wsTopic], [wsTopic]));

  useEffect(() => {
    if (!liveMode || lastMessage?.type !== "live_event") return;
    const e = lastMessage.payload as LiveEvent;
    if (selectedProject && e.project_id !== selectedProject.id) return;
    setLiveEvents((prev) => [e, ...prev].slice(0, MAX_LIVE));
  }, [lastMessage, liveMode, selectedProject]);

  // Auto-scroll live feed to top on new event
  useEffect(() => {
    liveFeedRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [liveEvents]);

  const [filters, setFilters] = useState<Omit<EventFilters, "cursor" | "project_id">>({
    event_name: "",
    user_id: "",
    from: "",
    to: "",
    limit: 50,
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const sentinelRef = useRef<HTMLTableRowElement>(null);

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

  // Auto-load next page when sentinel row scrolls into view
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const setF = (key: keyof typeof filters, value: string | number) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="flex flex-col h-full gap-4">
      <PageHeader
        title="Events"
        action={
          <Button
            variant={liveMode ? "default" : "outline"}
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => { setLiveMode((v) => !v); setLiveEvents([]); }}
          >
            <Radio size={12} className={liveMode && connected ? "animate-pulse text-green-400" : ""} />
            {liveMode ? (connected ? "Live" : "Reconnecting…") : "Go Live"}
          </Button>
        }
      />

      <div className="flex flex-1 gap-4 overflow-hidden">
      <aside className="w-56 shrink-0 space-y-4">
        {(["event_name", "user_id"] as const).map((key) => (
          <div key={key}>
            <Label className="text-xs mb-1.5 block">
              {key === "event_name" ? "Event Name" : "User ID"}
            </Label>
            <Input
              className="h-8 text-xs font-mono"
              placeholder={key === "event_name" ? "page_view" : "user_123"}
              value={String(filters[key] ?? "")}
              onChange={(e) => setF(key, e.target.value)}
            />
          </div>
        ))}
        <div>
          <Label className="text-xs mb-1.5 block">From</Label>
          <DatePicker label="Start date" value={filters.from ?? ""} onChange={(v) => setF("from", v)} />
        </div>
        <div>
          <Label className="text-xs mb-1.5 block">To</Label>
          <DatePicker label="End date" value={filters.to ?? ""} onChange={(v) => setF("to", v)} />
        </div>
      </aside>

      <div className="flex-1 overflow-auto">
        {liveMode ? (
          /* ── Live Feed ─────────────────────────────────────────────── */
          !projectId ? (
            <EmptyState icon={Radio} title="No project selected" description="Select a project from the top bar to see live events." />
          ) : liveEvents.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Waiting for events…
            </div>
          ) : (
            <div ref={liveFeedRef} className="rounded-lg border border-border overflow-hidden overflow-y-auto max-h-[calc(100vh-12rem)]">
              <table className="w-full text-xs">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-border bg-muted">
                    {["Timestamp", "Event", "User ID"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liveEvents.map((e, i) => (
                    <tr key={i} className="border-b border-border last:border-0 animate-in fade-in duration-300">
                      <td className="px-3 py-2 font-mono text-muted-foreground whitespace-nowrap">
                        {format(parseISO(e.timestamp), "HH:mm:ss.SSS")}
                      </td>
                      <td className="px-3 py-2 font-mono font-medium text-foreground">{e.event_name}</td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{e.user_id ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* ── Historical Table ───────────────────────────────────────── */
          !projectId ? (
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
                      {/* Sentinel row — triggers next page load when scrolled into view */}
                      <tr ref={sentinelRef}>
                        <td colSpan={4} className="px-3 py-3 text-center">
                          {isFetchingNextPage && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Loader2 size={12} className="animate-spin" />
                              Loading more…
                            </span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )
        )}
      </div>

      <EventDetailDrawer event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      </div>
    </div>
  );
}
