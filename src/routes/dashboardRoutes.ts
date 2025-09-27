// routes/dashboardRoutes.ts
import express from "express";
import { getDashboard, getQuote } from "../controllers/dashboardController";

const router = express.Router();

router.get("/", getDashboard);

router.get("/quote", getQuote);

export default router;
