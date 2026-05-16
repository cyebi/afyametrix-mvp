import crypto from "node:crypto";

export type StoredCaseReport = {
  id: string;
  clientRef: string;
  reporterId: string;
  districtId?: string;
  caseType: string;
  severity: "low" | "medium" | "high" | "urgent";
  symptoms: string;
  location: string;
  occurredAt: string;
  submittedAt: string;
};

type CreateCaseInput = Omit<StoredCaseReport, "id" | "submittedAt">;

const caseByClientRef = new Map<string, StoredCaseReport>();
const allCases: StoredCaseReport[] = [];

export function createOrGetCase(input: CreateCaseInput): { caseReport: StoredCaseReport; duplicate: boolean } {
  const existing = caseByClientRef.get(input.clientRef);
  if (existing) {
    return { caseReport: existing, duplicate: true };
  }

  const created: StoredCaseReport = {
    ...input,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  };
  caseByClientRef.set(input.clientRef, created);
  allCases.push(created);
  return { caseReport: created, duplicate: false };
}

export function evaluateAlerts(caseReport: StoredCaseReport): string[] {
  const alerts: string[] = [];
  if (caseReport.severity === "urgent") {
    alerts.push("urgent_case_sms_fallback");
  }

  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const sameTypeRecent = allCases.filter((c) => {
    return c.caseType === caseReport.caseType && new Date(c.submittedAt).getTime() >= oneDayAgo;
  }).length;
  if (sameTypeRecent >= 3) {
    alerts.push("threshold_case_type_spike_24h");
  }
  return alerts;
}
