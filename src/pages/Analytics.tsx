import { analyticsApi, type VolumeInterval } from "@/api/analytics";
import { EventDistributionChart } from "@/components/charts/EventDistributionChart";
import { EventVolumeChart } from "@/components/charts/EventVolumeChart";
import { TopEventsChart } from "@/components/charts/TopEventsChart";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectStore } from "@/store/useProjectStore";
import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { useState } from "react";

const INTERVALS: { label: string; value: VolumeInterval }[] = [
  { label: "Today", value: "24h" }, { label: "7 days", value: "7d" }, { label: "30 days", value: "30d" },
];

export default function Analytics() {
  const { selectedProject } = useProjectStore();
  const [interval, setInterval] = useState<VolumeInterval>("24h");

  const projectId = selectedProject?.id ?? null;
  const enabled = !!projectId;

  const { data: volume = [], isLoading: volumeLoading } = useQuery({
    queryKey: ["analytics", "volume", projectId, interval],
    queryFn: () => analyticsApi.eventVolume(projectId!, interval),
    enabled,
  });

  const { data: topEvents = [], isLoading: topLoading } = useQuery({
    queryKey: ["analytics", "top", projectId],
    queryFn: () => analyticsApi.topEvents(projectId!, 10),
    enabled,
  });

  const controls = (
    <div className="flex gap-1">
      {INTERVALS.map(({ label, value }) => (
        <Button key={value} variant={interval === value ? "secondary" : "ghost"} size="sm" className="h-8 px-2 text-xs" onClick={() => setInterval(value)}>
          {label}
        </Button>
      ))}
    </div>
  );

  return (
    <div>
      <PageHeader title="Analytics" action={controls} />

      {!projectId ? (
        <EmptyState icon={BarChart3} title="No project selected" description="Select a project from the top bar to view analytics." />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Event Volume</CardTitle></CardHeader>
            <CardContent>
              {volumeLoading ? <Skeleton className="h-48 w-full" /> : <EventVolumeChart data={volume} interval={interval} />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Top Events</CardTitle></CardHeader>
            <CardContent>
              {topLoading ? <Skeleton className="h-48 w-full" /> : <TopEventsChart data={topEvents} />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Event Distribution</CardTitle></CardHeader>
            <CardContent>
              {topLoading ? <Skeleton className="h-48 w-full" /> : <EventDistributionChart data={topEvents} />}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
