import { useChartColors } from "@/hooks/useChartColors";
import type { TopEvent } from "@/types/api";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CHAR_WIDTH = 7;
const BAR_HEIGHT = 36;
const CHART_PADDING = 32;

export function TopEventsChart({ data }: { data: TopEvent[] }) {
  const c = useChartColors();
  const yAxisWidth = Math.min(140, Math.max(80,
    Math.max(...data.map(d => d.event_name.length)) * CHAR_WIDTH
  ));
  const chartHeight = Math.max(120, data.length * BAR_HEIGHT + CHART_PADDING);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 0 }} barSize={14}>
        <CartesianGrid horizontal={false} stroke={c.grid} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: c.tick }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="event_name"
          tick={{ fontSize: 11, fill: c.tick, fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
          width={yAxisWidth}
        />
        <Tooltip
          contentStyle={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 6, fontSize: 12, color: c.tooltipText }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#6366f1" />
      </BarChart>
    </ResponsiveContainer>
  );
}
