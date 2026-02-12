import mongoose from "mongoose";

const investmentPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    roi: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("InvestmentPlan", investmentPlanSchema);
