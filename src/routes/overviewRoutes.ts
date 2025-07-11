// routes/overviewRoutes.ts
import express from "express";
import { getOverview } from "../controllers/overviewController";

const router = express.Router();

// @route   GET /api/overview
// @desc    Get full overview for dashboard
// @access  Private
router.get("/", getOverview);

export default router;
