import type { AnalyticsOverview, RecentEvent, TopEvent, VolumePoint } from "@/types/api";
import { apiFetch } from "./client";

export type VolumeInterval = "1h" | "24h" | "7d" | "30d";

export const analyticsApi = {
  overview: (projectId: number) =>
    apiFetch<AnalyticsOverview>(`/analytics/overview?project_id=${projectId}`),
  eventVolume: (projectId: number, interval: VolumeInterval) =>
    apiFetch<VolumePoint[]>(`/analytics/events/volume?project_id=${projectId}&interval=${interval}`),
  topEvents: (projectId: number, limit = 10) =>
    apiFetch<TopEvent[]>(`/analytics/events/top?project_id=${projectId}&limit=${limit}`),
  recentEvents: (projectId: number, limit = 20) =>
    apiFetch<RecentEvent[]>(`/analytics/events/recent?project_id=${projectId}&limit=${limit}`),
};
