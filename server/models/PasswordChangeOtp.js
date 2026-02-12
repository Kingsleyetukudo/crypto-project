import mongoose from "mongoose";

const passwordChangeOtpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    newPasswordHash: { type: String, required: true },
  },
  { timestamps: true },
);

passwordChangeOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("PasswordChangeOtp", passwordChangeOtpSchema);
