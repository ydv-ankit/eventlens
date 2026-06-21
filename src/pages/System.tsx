import { KpiCard } from "@/components/common/KpiCard";
import { PageHeader } from "@/components/common/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { SystemHealth } from "@/types/api";
import { Activity, AlertCircle, Layers, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const TOPICS = ["system"];

export default function SystemPage() {
  const { lastMessage, connected } = useWebSocket(TOPICS);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    if (lastMessage?.type === "system_metrics") {
      setHealth(lastMessage.payload as SystemHealth);
    }
  }, [lastMessage]);

  return (
    <div>
      <PageHeader
        title="System"
        description="Data pipeline status and ingestion metrics"
        action={
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-green-500" : "bg-yellow-500"}`} />
            {connected ? "Live" : "Reconnecting…"}
          </span>
        }
      />

      {!health ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Events / sec"
            value={health.eventsPerSec}
            subtitle="Across all projects, last 1s window"
            icon={Zap}
          />
          <KpiCard
            title="Total Events Processed"
            value={health.totalEventsProcessed.toLocaleString()}
            subtitle="All projects, since system start"
            icon={Activity}
          />
          <KpiCard
            title="Processing"
            value={health.mainQueueDepth}
            subtitle="Events currently being inserted"
            icon={Layers}
          />
          <KpiCard
            title="Failed Insertions"
            value={health.failedInsertionCount}
            subtitle="Write failures in last 1s window"
            icon={AlertCircle}
          />
        </div>
      )}
    </div>
  );
}
