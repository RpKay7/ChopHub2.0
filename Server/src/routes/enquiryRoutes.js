
import express from "express";

import {
  createEnquiry,
  getAdminEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
} from "../controllers/enquiryController.js";

import {
  authenticateUser,
  optionalAuthenticateUser,
  requireAdmin,
} from "../middleware/auth.js";

const router = express.Router();

// Allow both guests and authenticated customers to submit enquiries.
router.post("/", optionalAuthenticateUser, createEnquiry);

// Protect all admin enquiry operations.
router.use(authenticateUser, requireAdmin);

// Admin enquiry management.
router.get("/", getAdminEnquiries);
router.patch("/:id/status", updateEnquiryStatus);
router.delete("/:id", deleteEnquiry);

export default router;
