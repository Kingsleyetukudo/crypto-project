import mongoose from "mongoose";

const investmentPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    roi: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    minAmount: { type: Number, default: 0 },
    maxAmount: { type: Number, default: 0 },
    details: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length <= 6,
        message: "Investment details can be up to 6 items.",
      },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("InvestmentPlan", investmentPlanSchema);
