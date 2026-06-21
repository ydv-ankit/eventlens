import { systemApi } from "@/api/system";
import { KpiCard } from "@/components/common/KpiCard";
import { PageHeader } from "@/components/common/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Activity, AlertCircle, Layers, Zap } from "lucide-react";

export default function SystemPage() {
  const { data: health, isLoading } = useQuery({
    queryKey: ["system", "health"],
    queryFn: systemApi.health,
    refetchInterval: 15_000,
  });

  return (
    <div>
      <PageHeader title="System" description="Data pipeline status and ingestion metrics" />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : health ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Events / sec"       value={health.eventsPerSec}                          icon={Zap} />
          <KpiCard title="Events Processed"   value={health.totalEventsProcessed.toLocaleString()} icon={Activity} />
          <KpiCard title="Pending in Queue"   value={health.mainQueueDepth}                        icon={Layers} />
          <KpiCard title="Failed Insertions"  value={health.failedInsertionCount}                  icon={AlertCircle} />
        </div>
      ) : null}
    </div>
  );
}
