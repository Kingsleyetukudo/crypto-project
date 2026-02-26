import mongoose from "mongoose";

const kycSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    idDocumentName: { type: String, required: true },
    idDocumentData: { type: String, required: true },
    proofOfAddressName: { type: String, required: true },
    proofOfAddressData: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    rejectionNote: { type: String, default: "" },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("KycSubmission", kycSubmissionSchema);
