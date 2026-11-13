import express from "express";

import {
  getCustomerFavourites,
  addCustomerFavourite,
  removeCustomerFavourite,
} from "../controllers/favouriteController.js";

import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// All favourites endpoints require authentication.
router.use(authenticateUser);

// Retrieve the customer's favourites.
router.get("/", getCustomerFavourites);

// Add a meal to favourites.
router.post("/", addCustomerFavourite);

// Remove a meal from favourites.
router.delete("/:menuItemId", removeCustomerFavourite);

export default router;