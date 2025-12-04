// backend/src/routes/dashboard.routes.ts
import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboard.controller";

const router = Router();

// GET /api/admin/dashboard/summary
router.get("/summary", getDashboardSummary);

export default router;
