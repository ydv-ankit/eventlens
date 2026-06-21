import type { EventsPage } from "@/types/api";
import { apiFetch } from "./client";

export interface EventFilters {
  project_id: number;
  event_name?: string;
  user_id?: string;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
}

export const eventsApi = {
  list: (filters: EventFilters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== "") params.set(k, String(v));
    });
    return apiFetch<EventsPage>(`/event?${params}`);
  },
};
