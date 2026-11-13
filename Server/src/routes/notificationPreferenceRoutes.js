
import express from "express";

import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../controllers/notificationPreferenceController.js";

import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// All notification preference endpoints require authentication.
router.use(authenticateUser);

// Retrieve the customer's notification preferences.
router.get("/", getNotificationPreferences);

// Update the customer's notification preferences.
router.put("/", updateNotificationPreferences);

export default router;
