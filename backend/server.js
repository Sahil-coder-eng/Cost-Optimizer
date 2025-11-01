// ✅ server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import analysisRoutes from "./routes/analysisRoutes.js";

dotenv.config();
const app = express();

// ✅ Middleware
app.use(cors({ origin: "http://localhost:5173" })); // Allow React frontend
app.use(express.json());

// ✅ Routes
app.use("/api/analysis", analysisRoutes);

// ✅ MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
connectDB();

// ✅ Root Test Route
app.get("/", (req, res) => {
  res.send("✅ Cost Optimization Analyzer Backend is running 🚀");
});

// ✅ AI Analyzer Route (for quick test)
app.post("/api/analysis", (req, res) => {
  try {
    const { cost } = req.body;
    if (!cost || cost <= 0)
      return res.status(400).json({ message: "⚠ Invalid cost input!" });

    const optimized = cost * 0.8;
    const saved = cost - optimized;

    let suggestion = "";
    if (cost > 100000) {
      suggestion =
        "Use reserved or spot instances to reduce compute costs up to 70%.";
    } else if (cost > 50000) {
      suggestion =
        "Enable auto-scaling and shut down idle resources during off-hours.";
    } else if (cost > 10000) {
      suggestion =
        "Optimize storage & database usage. Consider caching or serverless options.";
    } else {
      suggestion =
        "Your cost is under control! Keep tracking and maintain efficiency.";
    }

    res.json({
      success: true,
      original: cost,
      optimized,
      saved,
      suggestion,
      message: `You can save ₹${saved.toFixed(
        2
      )} by optimizing your cloud usage.`,
    });
  } catch (error) {
    console.error("Error in /api/analysis:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
