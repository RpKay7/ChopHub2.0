import express from "express";

import {
  getMenuItems,
  getMenuCategories,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menuController.js";

import {
  authenticateUser,
  requireAdmin,
} from "../middleware/auth.js";

const router = express.Router();

// Public menu endpoints
router.get("/", getMenuItems);
router.get("/categories", getMenuCategories);

// Admin-only menu management endpoints
router.post(
  "/",
  authenticateUser,
  requireAdmin,
  createMenuItem
);

router.put(
  "/:id",
  authenticateUser,
  requireAdmin,
  updateMenuItem
);

router.delete(
  "/:id",
  authenticateUser,
  requireAdmin,
  deleteMenuItem
);

export default router;