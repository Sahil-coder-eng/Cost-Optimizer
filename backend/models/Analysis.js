import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({
  category: { type: String, required: true },
  cost: { type: Number, required: true },
  savings: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis;
