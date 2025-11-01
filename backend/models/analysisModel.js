// backend/models/analysisModel.js
import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
    },
    costBefore: {
      type: Number,
      required: true,
    },
    costAfter: {
      type: Number,
      required: true,
    },
    savings: {
      type: Number,
      required: true,
    },
    recommendation: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

const Analysis = mongoose.model("Analysis", analysisSchema);
export default Analysis;
