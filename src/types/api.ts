export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface ApiKey {
  id: number;
  project_id: number;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export interface ApiKeyCreated extends ApiKey {
  key: string;
}

export interface Event {
  id: number;
  event_name: string;
  metadata: Record<string, unknown>;
  project_id: number;
  user_id: string | null;
  timestamp: string;
  created_at: string;
}

export interface EventsPage {
  events: Event[];
  pagination: { hasMore: boolean; nextCursor: string | null; limit: number };
}

export interface AnalyticsOverview {
  today_events: number;
  active_users: number;
  events_per_sec: number;
  project_count: number;
}

export interface VolumePoint {
  bucket: string;
  count: number;
}

export interface TopEvent {
  event_name: string;
  count: number;
}

export interface RecentEvent {
  id: number;
  event_name: string;
  user_id: string | null;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export interface SystemHealth {
  eventsPerSec: number;
  totalEventsProcessed: number;
  failedInsertionCount: number;
  mainQueueDepth: number;
}
