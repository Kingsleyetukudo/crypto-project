import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    referralEarnings: { type: Number, default: 0 },
    referralBalance: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    country: { type: String },
    currency: { type: String },
    resetOtpHash: { type: String },
    resetOtpExpiresAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
