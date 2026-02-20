import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InvestmentPlan",
    },
    planName: { type: String, required: true },
    amount: { type: Number, required: true },
    roi: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    endDate: { type: Date, required: true },
    totalInterestAccrued: { type: Number, default: 0 },
    totalInterestWithdrawn: { type: Number, default: 0 },
    lastInterestAccrualAt: { type: Date },
    lastInterestWithdrawalAt: { type: Date },
    referralCountAtLastWithdrawal: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Investment", investmentSchema);
