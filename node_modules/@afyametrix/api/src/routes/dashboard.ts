import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { requireRoles } from "../middleware/rbac.js";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/district/:districtId",
  authRequired,
  requireRoles(["DHIO", "DSNO", "REGIONAL", "MINISTRY", "DONOR"]),
  (req, res) => {
    const { districtId } = req.params;
    return res.json({
      districtId,
      snapshotDate: new Date().toISOString(),
      metrics: {
        caseCount7d: 38,
        urgentAlerts7d: 4,
        reportingCompletenessPct: 82,
      },
      message: "Stub district dashboard data for Sprint 0 integration",
    });
  },
);
