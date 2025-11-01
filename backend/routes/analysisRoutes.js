import express from "express";
import Analysis from "../models/Analysis.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const { category, cost, savings } = req.body;

    // Validation
    if (!category || isNaN(cost) || isNaN(savings)) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data. Please provide category, cost, and savings."
      });
    }

    const analysis = new Analysis({ category, cost, savings });
    await analysis.save();

    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error("❌ Error saving analysis:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
