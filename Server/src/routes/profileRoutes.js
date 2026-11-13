import express from "express";

import { updateProfile } from "../controllers/profileController.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Update the authenticated customer's profile
router.put("/", authenticateUser, updateProfile);

export default router;