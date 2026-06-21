import type { SystemHealth } from "@/types/api";
import { apiFetch } from "./client";

export const systemApi = {
  health: () => apiFetch<SystemHealth>("/system/health"),
};
