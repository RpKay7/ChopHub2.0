
import express from "express";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearNotifications,
} from "../controllers/notificationController.js";

import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// All notification endpoints require authentication.
router.use(authenticateUser);

// Retrieve all notifications.
router.get("/", getNotifications);

// Mark all notifications as read.
router.patch("/read-all", markAllNotificationsAsRead);

// Mark one notification as read.
router.patch("/:id/read", markNotificationAsRead);

// Delete all notifications.
router.delete("/", clearNotifications);

// Delete one notification.
router.delete("/:id", deleteNotification);

export default router;
