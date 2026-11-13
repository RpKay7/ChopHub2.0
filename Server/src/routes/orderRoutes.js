
import express from "express";

import {
  createCustomerOrder,
  getCustomerOrders,
  initializeOrderPayment,
  verifyOrderPayment,
} from "../controllers/orderController.js";

import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Create a new order.
router.post("/", authenticateUser, createCustomerOrder);

// Retrieve orders belonging to the authenticated customer.
router.get("/", authenticateUser, getCustomerOrders);

// Initialize Paystack payment for an order.
router.post(
  "/:orderId/payment",
  authenticateUser,
  initializeOrderPayment
);

// Verify a Paystack transaction.
router.post(
  "/verify-payment",
  authenticateUser,
  verifyOrderPayment
);

export default router;
