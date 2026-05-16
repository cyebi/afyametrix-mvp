import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config.js";
import type { AppRole, AuthUser } from "../types.js";

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(["CHPS", "DHIO", "DSNO", "REGIONAL", "MINISTRY", "DONOR"]).optional(),
});

const mockUsers: Record<string, { id: string; password: string; role: AppRole }> = {
  chps: { id: "u-chps-001", password: "password123", role: "CHPS" },
  dhio: { id: "u-dhio-001", password: "password123", role: "DHIO" },
  dsno: { id: "u-dsno-001", password: "password123", role: "DSNO" },
};

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const { username, password, role } = parsed.data;
  const user = mockUsers[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const authUser: AuthUser = {
    id: user.id,
    role: role ?? user.role,
    districtId: "district-001",
    facilityId: "facility-001",
  };
  const token = jwt.sign(authUser, config.jwtSecret, { expiresIn: "12h" });

  return res.json({ token, user: authUser });
});
