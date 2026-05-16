import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth.js";
import { requireRoles } from "../middleware/rbac.js";
import { createOrGetCase, evaluateAlerts } from "../services/caseStore.js";

const casePayloadSchema = z.object({
  clientRef: z.string().min(8),
  caseType: z.string().min(3),
  severity: z.enum(["low", "medium", "high", "urgent"]),
  symptoms: z.string().min(3),
  location: z.string().min(2),
  occurredAt: z.string().datetime(),
});

const syncBatchSchema = z.object({
  cases: z.array(casePayloadSchema).min(1),
});

export const casesRouter = Router();

casesRouter.post("/cases", authRequired, requireRoles(["CHPS", "DHIO", "DSNO"]), (req, res) => {
  const parsed = casePayloadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid case payload", errors: parsed.error.flatten() });
  }

  const user = req.user!;
  const { caseReport, duplicate } = createOrGetCase({
    ...parsed.data,
    reporterId: user.id,
    districtId: user.districtId,
  });
  const alerts = evaluateAlerts(caseReport);

  return res.status(duplicate ? 200 : 201).json({
    duplicate,
    caseReport,
    alerts,
  });
});

casesRouter.post("/sync/batch", authRequired, requireRoles(["CHPS", "DHIO", "DSNO"]), (req, res) => {
  const parsed = syncBatchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid sync payload", errors: parsed.error.flatten() });
  }

  const user = req.user!;
  const results = parsed.data.cases.map((item) => {
    const { caseReport, duplicate } = createOrGetCase({
      ...item,
      reporterId: user.id,
      districtId: user.districtId,
    });
    return {
      clientRef: item.clientRef,
      serverId: caseReport.id,
      duplicate,
      alerts: evaluateAlerts(caseReport),
    };
  });

  const acceptedCount = results.filter((r) => !r.duplicate).length;
  const duplicateCount = results.length - acceptedCount;
  return res.json({
    received: results.length,
    accepted: acceptedCount,
    duplicates: duplicateCount,
    results,
  });
});
