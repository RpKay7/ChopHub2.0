
import express from "express";

import {
  getAdminOverview,
  getAdminOrders,
  updateAdminOrderStatus,
  getAdminCustomers,
  updateAdminCustomerStatus,
} from "../controllers/adminController.js";

import {
  authenticateUser,
  requireAdmin,
} from "../middleware/auth.js";

const router = express.Router();

// Protect every admin endpoint.
router.use(authenticateUser, requireAdmin);

// Dashboard overview.
router.get("/overview", getAdminOverview);

// Orders.
router.get("/orders", getAdminOrders);
router.patch("/orders/:id/status", updateAdminOrderStatus);

// Customers.
router.get("/customers", getAdminCustomers);
router.patch("/customers/:id/status", updateAdminCustomerStatus);

export default router;
