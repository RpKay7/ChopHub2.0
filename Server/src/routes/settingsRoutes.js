
import express from "express";

import {
  getSettings,
  updateSettings,
} from "../controllers/settingsController.js";

import {
  authenticateUser,
  requireAdmin,
} from "../middleware/auth.js";

const router = express.Router();

// Protect all restaurant settings operations.
router.use(authenticateUser, requireAdmin);

// Retrieve restaurant settings.
router.get("/", getSettings);

// Save restaurant settings.
router.put("/", updateSettings);

export default router;
