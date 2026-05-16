const DB_NAME = "afyametrix-offline-db";
const DB_VERSION = 1;
const CASE_STORE = "queued-case-reports";

export type CaseReportDraft = {
  clientRef: string;
  caseType: string;
  severity: "low" | "medium" | "high" | "urgent";
  symptoms: string;
  location: string;
  occurredAt: string;
};

export type OfflineQueuedCase = CaseReportDraft & {
  id: number;
  queuedAt: string;
  syncStatus: "queued" | "synced";
  syncedAt?: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(CASE_STORE)) {
        db.createObjectStore(CASE_STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function queueOfflineCaseReport(payload: CaseReportDraft): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(CASE_STORE, "readwrite");
    const store = tx.objectStore(CASE_STORE);
    store.add({
      ...payload,
      queuedAt: new Date().toISOString(),
      syncStatus: "queued",
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function readQueuedCount(): Promise<number> {
  const db = await openDb();
  return await new Promise<number>((resolve, reject) => {
    const tx = db.transaction(CASE_STORE, "readonly");
    const store = tx.objectStore(CASE_STORE);
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function listQueuedCaseReports(): Promise<OfflineQueuedCase[]> {
  const db = await openDb();
  return await new Promise<OfflineQueuedCase[]>((resolve, reject) => {
    const tx = db.transaction(CASE_STORE, "readonly");
    const store = tx.objectStore(CASE_STORE);
    const req = store.getAll();
    req.onsuccess = () => {
      const all = (req.result as OfflineQueuedCase[]) ?? [];
      resolve(all.filter((r) => r.syncStatus === "queued"));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function markReportsSynced(ids: number[]): Promise<void> {
  if (ids.length === 0) {
    return;
  }
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(CASE_STORE, "readwrite");
    const store = tx.objectStore(CASE_STORE);
    ids.forEach((id) => {
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const value = getReq.result as OfflineQueuedCase | undefined;
        if (!value) {
          return;
        }
        store.put({
          ...value,
          syncStatus: "synced",
          syncedAt: new Date().toISOString(),
        });
      };
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
