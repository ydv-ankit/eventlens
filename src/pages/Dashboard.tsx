import { analyticsApi, type VolumeInterval } from "@/api/analytics";
import { EventVolumeChart } from "@/components/charts/EventVolumeChart";
import { KpiCard } from "@/components/common/KpiCard";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { SystemHealth } from "@/types/api";
import { useProjectStore } from "@/store/useProjectStore";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Activity, FolderOpen, Users, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const INTERVALS: { label: string; value: VolumeInterval }[] = [
  { label: "1h",  value: "1h"  },
  { label: "24h", value: "24h" },
  { label: "7d",  value: "7d"  },
  { label: "30d", value: "30d" },
];

export default function Dashboard() {
  const { selectedProject } = useProjectStore();
  const [interval, setInterval] = useState<VolumeInterval>("24h");

  const projectId = selectedProject?.id;

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["analytics", "overview", projectId],
    queryFn: () => analyticsApi.overview(projectId!),
    enabled: !!projectId,
    refetchInterval: 5_000,
  });

  const { data: volume = [], isLoading: volumeLoading } = useQuery({
    queryKey: ["analytics", "volume", projectId, interval],
    queryFn: () => analyticsApi.eventVolume(projectId!, interval),
    enabled: !!projectId,
    refetchInterval: 5_000,
  });

  const { data: topEvents = [] } = useQuery({
    queryKey: ["analytics", "top", projectId],
    queryFn: () => analyticsApi.topEvents(projectId!, 8),
    enabled: !!projectId,
    refetchInterval: 5_000,
  });

  const { data: recentEvents = [] } = useQuery({
    queryKey: ["analytics", "recent", projectId],
    queryFn: () => analyticsApi.recentEvents(projectId!, 10),
    enabled: !!projectId,
    refetchInterval: 5_000,
  });

  // Real-time events/sec via WebSocket
  const { lastMessage } = useWebSocket(useMemo(() => ["system"], []));
  const [liveEventsPerSec, setLiveEventsPerSec] = useState<number | null>(null);

  useEffect(() => {
    if (lastMessage?.type === "system_metrics") {
      setLiveEventsPerSec((lastMessage.payload as SystemHealth).eventsPerSec);
    }
  }, [lastMessage]);

  if (!projectId) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No project selected"
        description="Select a project from the top bar to view dashboard metrics."
      />
    );
  }

  const fmt = (n?: number) => (n !== undefined ? n.toLocaleString() : "—");

  return (
    <div>
      <PageHeader title="Dashboard" description={selectedProject?.name} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {overviewLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))
        ) : (
          <>
            <KpiCard title="Today's Events" value={fmt(overview?.today_events)} icon={Activity} />
            <KpiCard title="Active Users" value={fmt(overview?.active_users)} icon={Users} />
            <KpiCard title="Events / sec" value={liveEventsPerSec ?? overview?.events_per_sec ?? "—"} icon={Zap} />
          </>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Event Volume</CardTitle>
            <div className="flex gap-1">
              {INTERVALS.map(({ label, value }) => (
                <Button
                  key={value}
                  variant={interval === value ? "secondary" : "ghost"}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setInterval(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {volumeLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <EventVolumeChart data={volume} interval={interval} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Events</CardTitle>
          </CardHeader>
          <CardContent>
            {topEvents.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">No events yet</p>
            ) : (
              <div className="space-y-2">
                {topEvents.map((e) => (
                  <div key={e.event_name} className="flex items-center justify-between">
                    <span className="font-mono text-xs text-foreground truncate max-w-[120px]">
                      {e.event_name}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {e.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentEvents.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                <div>
                  <p className="font-mono text-xs font-medium text-foreground">{e.event_name}</p>
                  {e.user_id && (
                    <p className="font-mono text-[10px] text-muted-foreground">{e.user_id}</p>
                  )}
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {format(parseISO(e.timestamp), "HH:mm:ss")}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
