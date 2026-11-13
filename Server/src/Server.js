
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import favouriteRoutes from "./routes/favouriteRoutes.js";
import notificationPreferenceRoutes from "./routes/notificationPreferenceRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

app.use((req, res, next) => {
  console.log("INCOMING REQUEST:", req.method, req.url);
  next();
});

console.log("CHOPHUB MENU DEBUG VERSION LOADED");

app.get("/api/menu-debug", (req, res) => {
  res.json({
    success: true,
    message: "This exact server.js file is responding!",
  });
});

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://chophub20.vercel.app",
  "https://chophub20-oq4od913g-rpkays-projects.vercel.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/favourites", favouriteRoutes);

app.use("/api/notification-preferences", notificationPreferenceRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/menu", (req, res) => {
  res.json({
    success: true,
    message: "Direct menu endpoint is working!",
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the ChopHub API!",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ChopHub backend is running successfully!",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`ChopHub server running on http://localhost:${PORT}`);
});
