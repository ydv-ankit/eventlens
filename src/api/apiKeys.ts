import type { ApiKey, ApiKeyCreated } from "@/types/api";
import { apiFetch } from "./client";

export const apiKeysApi = {
  list: (projectId: number) => apiFetch<ApiKey[]>(`/project/${projectId}/api-keys`),
  create: (projectId: number) =>
    apiFetch<ApiKeyCreated>(`/project/${projectId}/api-keys`, { method: "POST" }),
  delete: (id: number) => apiFetch<{ id: number }>(`/api-keys/${id}`, { method: "DELETE" }),
};
