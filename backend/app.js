import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./src/routes/authRoutes.js";
import sequelize from "./src/config/db.js";
import doctorRoutes from "./src/routes/doctorRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS (Next.js on localhost:3000)
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

app.use(express.json());

// Test route
app.get("/api/test", (req, res) => {
  res.json({ msg: "Backend is running!" });
});

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);


// Sync DB
sequelize
  .sync({ alter: true })
  .then(() => console.log("✅ All models synced"))
  .catch((err) => console.error("❌ Sync error:", err));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
