
import express from "express";

import {
  register,
  login,
  refreshCustomerSession,
  forgotPassword,
  getCurrentUser,
  resetPassword,
  changePassword,
  getActiveSessions,
  revokeActiveSession,
  deleteAccount,
} from "../controllers/authController.js";

import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Public authentication routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshCustomerSession);
router.post("/forgot-password", forgotPassword);

// Password recovery route
router.post("/reset-password", resetPassword);

// Protected authentication routes
router.get("/me", authenticateUser, getCurrentUser);
router.patch("/change-password", authenticateUser, changePassword);
router.get("/sessions", authenticateUser, getActiveSessions);

router.delete(
  "/sessions/:sessionId",
  authenticateUser,
  revokeActiveSession
);

// Permanently delete customer account
router.delete("/account", authenticateUser, deleteAccount);

export default router;
