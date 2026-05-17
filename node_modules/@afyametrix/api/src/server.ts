import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";
import { casesRouter } from "./routes/cases.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { healthRouter } from "./routes/health.js";
import { meRouter } from "./routes/me.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api", meRouter);
app.use("/api", casesRouter);
app.use("/api/dashboard", dashboardRouter);

app.use("/api", (_req, res) => {
  return res.status(404).json({ message: "Endpoint not found" });
});

app.listen(config.port, () => {
  console.log(`[afyametrix-api] running on port ${config.port}`);
});
