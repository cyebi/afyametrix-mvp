import { useEffect, useState } from "react";
import { syncQueuedCases } from "./api/sync";
import {
  listQueuedCaseReports,
  markReportsSynced,
  queueOfflineCaseReport,
  readQueuedCount,
} from "./offline/offlineQueue";

type FormStep = 1 | 2 | 3 | 4;

export function App() {
  const [step, setStep] = useState<FormStep>(1);
  const [queuedCount, setQueuedCount] = useState(0);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [status, setStatus] = useState("Ready");
  const [syncTimeline, setSyncTimeline] = useState<string[]>([]);
  const [form, setForm] = useState({
    caseType: "suspected_cholera",
    severity: "urgent" as "low" | "medium" | "high" | "urgent",
    symptoms: "",
    location: "CHPS-001",
    patientGroup: "adult",
    riskSignals: "",
  });

  useEffect(() => {
    void refreshCount();
  }, []);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  async function refreshCount() {
    const count = await readQueuedCount();
    setQueuedCount(count);
  }

  async function addOfflineReport() {
    if (form.symptoms.trim().length < 3) {
      setStatus("Please enter symptoms (at least 3 characters).");
      return;
    }

    await queueOfflineCaseReport({
      clientRef: crypto.randomUUID(),
      caseType: form.caseType,
      severity: form.severity,
      symptoms: `${form.symptoms}; group=${form.patientGroup}; risk=${form.riskSignals || "none"}`,
      location: form.location,
      occurredAt: new Date().toISOString(),
    });
    setStatus("Offline report queued");
    setSyncTimeline((prev) => [`${new Date().toLocaleTimeString()}: Case saved offline`, ...prev].slice(0, 6));
    setForm((current) => ({ ...current, symptoms: "" }));
    setStep(1);
    await refreshCount();
  }

  async function syncReports() {
    setStatus("Syncing queued reports...");
    setSyncTimeline((prev) => [`${new Date().toLocaleTimeString()}: Sync started`, ...prev].slice(0, 6));
    try {
      const queued = await listQueuedCaseReports();
      if (queued.length === 0) {
        setStatus("No queued reports to sync.");
        setSyncTimeline((prev) => [`${new Date().toLocaleTimeString()}: No queued items`, ...prev].slice(0, 6));
        return;
      }

      const response = await syncQueuedCases(queued);
      const syncedIds = queued
        .filter((q) => response.results.some((r) => r.clientRef === q.clientRef))
        .map((q) => q.id);
      await markReportsSynced(syncedIds);
      await refreshCount();
      setStatus(`Synced ${response.accepted}/${response.received} reports (${response.duplicates} duplicates).`);
      setSyncTimeline((prev) => [
        `${new Date().toLocaleTimeString()}: Sync complete (${response.accepted}/${response.received})`,
        ...prev,
      ].slice(0, 6));
    } catch (error) {
      setStatus(`Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      setSyncTimeline((prev) => [`${new Date().toLocaleTimeString()}: Sync failed`, ...prev].slice(0, 6));
    }
  }

  const canNextStep1 = form.caseType.trim().length > 2 && form.location.trim().length > 1;
  const canNextStep2 = form.symptoms.trim().length >= 3;

  return (
    <main className="page">
      <header>
        <h1>Afyametrix Onboarding Preview</h1>
        <p>CHPS frontline reporting with offline-first submission and district sync.</p>
      </header>
      <section className={`network ${isOnline ? "online" : "offline"}`}>
        <strong>{isOnline ? "Online" : "Offline"}</strong>
        <span>{isOnline ? "Ready to sync queued reports" : "You can continue capturing cases offline"}</span>
      </section>
      <section className="card">
        <h2>Case Report Form</h2>
        <p className="step">Step {step} of 4</p>

        {step === 1 && (
          <>
            <label>Case Type</label>
            <input
              value={form.caseType}
              onChange={(e) => setForm((current) => ({ ...current, caseType: e.target.value }))}
            />
            <label>Location / CHPS Site</label>
            <input
              value={form.location}
              onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))}
            />
            <button disabled={!canNextStep1} onClick={() => setStep(2)}>
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <label>Symptoms</label>
            <textarea
              value={form.symptoms}
              onChange={(e) => setForm((current) => ({ ...current, symptoms: e.target.value }))}
              placeholder="e.g. vomiting, diarrhea, fever"
            />
            <label>Severity</label>
            <select
              value={form.severity}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  severity: e.target.value as "low" | "medium" | "high" | "urgent",
                }))
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <div className="actions">
              <button className="secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button disabled={!canNextStep2} onClick={() => setStep(3)}>
                Continue
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <label>Patient Group</label>
            <select
              value={form.patientGroup}
              onChange={(e) => setForm((current) => ({ ...current, patientGroup: e.target.value }))}
            >
              <option value="child">Child</option>
              <option value="adult">Adult</option>
              <option value="elderly">Elderly</option>
            </select>
            <label>Risk Signals (optional)</label>
            <input
              value={form.riskSignals}
              onChange={(e) => setForm((current) => ({ ...current, riskSignals: e.target.value }))}
              placeholder="e.g. cluster in same household"
            />
            <div className="actions">
              <button className="secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button onClick={() => setStep(4)}>Continue</button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h3>Review</h3>
            <p><strong>Case:</strong> {form.caseType}</p>
            <p><strong>Severity:</strong> {form.severity}</p>
            <p><strong>Location:</strong> {form.location}</p>
            <p><strong>Symptoms:</strong> {form.symptoms}</p>
            <div className="actions">
              <button className="secondary" onClick={() => setStep(3)}>
                Back
              </button>
              <button onClick={addOfflineReport}>Save Offline</button>
            </div>
          </>
        )}

        <div className="actions">
          <button onClick={syncReports}>Sync Queued Reports</button>
        </div>

        <h3>Queue Status</h3>
        <p>Queued reports: {queuedCount}</p>
        <p className="status">{status}</p>
        <h3>Sync Timeline</h3>
        <ul className="timeline">
          {syncTimeline.length === 0 && <li>No sync activity yet.</li>}
          {syncTimeline.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
