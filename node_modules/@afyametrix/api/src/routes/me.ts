import { Router } from "express";
import { authRequired } from "../middleware/auth.js";

export const meRouter = Router();

meRouter.get("/me", authRequired, (req, res) => {
  return res.json({ user: req.user });
});
