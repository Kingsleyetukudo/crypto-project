import mongoose from "mongoose";

const depositWalletSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    asset: { type: String, required: true },
    network: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("DepositWallet", depositWalletSchema);
