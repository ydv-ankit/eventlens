import { useChartColors } from "@/hooks/useChartColors";
import type { VolumePoint } from "@/types/api";
import { format, parseISO } from "date-fns";
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";

interface Props { data: VolumePoint[]; interval: string }

const formatBucket = (bucket: string, interval: string) => {
  try {
    const d = parseISO(bucket);
    if (interval === "1h") return format(d, "HH:mm");
    if (interval === "24h") return format(d, "HH:mm");
    return format(d, "MMM d");
  } catch {
    return bucket;
  }
};

export function EventVolumeChart({ data, interval }: Props) {
  const c = useChartColors();

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        No events for this period
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: formatBucket(d.bucket, interval),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: c.tick }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: c.tick }}
          axisLine={false} tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: c.tooltipBg,
            border: `1px solid ${c.tooltipBorder}`,
            borderRadius: 6,
            fontSize: 12,
            color: c.tooltipText,
          }}
        />
        <Line
          type="monotone" dataKey="count" stroke="#6366f1"
          strokeWidth={2} dot={false} name="Events"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
