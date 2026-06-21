import { useChartColors } from "@/hooks/useChartColors";
import type { TopEvent } from "@/types/api";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#f43f5e", "#a855f7"];

const truncate = (s: string, max = 18) => s.length > max ? s.slice(0, max) + "…" : s;

export function EventDistributionChart({ data }: { data: TopEvent[] }) {
  const c = useChartColors();

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="event_name" cx="50%" cy="50%" outerRadius={70} strokeWidth={0}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            formatter={(value, name) => [value, truncate(String(name))]}
            contentStyle={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 6, fontSize: 12, color: c.tooltipText }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
        {data.map((d, i) => (
          <div key={d.event_name} className="flex items-center gap-1.5 min-w-0">
            <span className="shrink-0 h-2 w-2 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="truncate font-mono text-[10px] text-muted-foreground" title={d.event_name}>
              {d.event_name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
