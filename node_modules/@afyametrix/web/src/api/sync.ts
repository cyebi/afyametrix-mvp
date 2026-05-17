import type { OfflineQueuedCase } from "../offline/offlineQueue";

const API_BASE = "http://localhost:4100/api";

type SyncResponse = {
  received: number;
  accepted: number;
  duplicates: number;
  results: Array<{
    clientRef: string;
    serverId: string;
    duplicate: boolean;
    alerts: string[];
  }>;
};

async function getAuthToken(): Promise<string> {
  const existing = window.localStorage.getItem("afyametrix_token");
  if (existing) {
    return existing;
  }

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "chps",
      password: "password123",
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to authenticate for sync");
  }
  const data = (await res.json()) as { token: string };
  window.localStorage.setItem("afyametrix_token", data.token);
  return data.token;
}

export async function syncQueuedCases(queued: OfflineQueuedCase[]): Promise<SyncResponse> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/sync/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      cases: queued.map((q) => ({
        clientRef: q.clientRef,
        caseType: q.caseType,
        severity: q.severity,
        symptoms: q.symptoms,
        location: q.location,
        occurredAt: q.occurredAt,
      })),
    }),
  });
  if (!res.ok) {
    throw new Error(`Sync failed (${res.status})`);
  }
  return (await res.json()) as SyncResponse;
}
