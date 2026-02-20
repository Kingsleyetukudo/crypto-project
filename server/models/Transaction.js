import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ["deposit", "profit", "withdrawal"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "pending",
    },
    txHash: { type: String },
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: "DepositWallet" },
    walletName: { type: String },
    walletAddress: { type: String },
    asset: { type: String },
    destinationAddress: { type: String },
    destinationNetwork: { type: String },
    rejectionNote: { type: String },
    investmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Investment",
    },
    referralCountAtRequest: { type: Number, default: 0 },
    source: {
      type: String,
      enum: ["main", "referral", "investment_roi"],
      default: "main",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Transaction", transactionSchema);
