import type { Project } from "@/types/api";
import { apiFetch } from "./client";

export const projectsApi = {
  list: () => apiFetch<Project[]>("/project"),
  get: (id: number) => apiFetch<Project>(`/project/${id}`),
  create: (body: { name: string; description?: string }) =>
    apiFetch<Project>("/project", { method: "POST", body: JSON.stringify(body) }),
  update: (id: number, body: { name?: string; description?: string }) =>
    apiFetch<Project>(`/project/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (id: number) => apiFetch<{ id: number }>(`/project/${id}`, { method: "DELETE" }),
};
