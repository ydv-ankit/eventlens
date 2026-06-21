import type { Event } from "@/types/api";
import { apiFetch } from "./client";

export const usersApi = {
  timeline: (userId: string) => apiFetch<Event[]>(`/users/${userId}/events`),
};
