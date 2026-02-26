import KycSubmission from "../models/KycSubmission.js";
import User from "../models/User.js";

const isBase64DataUrl = (value) => /^data:[^;]+;base64,[A-Za-z0-9+/=]+$/.test(String(value || "").trim());

const sanitizeForUser = (submission) => {
  if (!submission) return null;
  return {
    id: submission._id,
    status: submission.status,
    rejectionNote: submission.rejectionNote || "",
    idDocumentName: submission.idDocumentName,
    proofOfAddressName: submission.proofOfAddressName,
    reviewedAt: submission.reviewedAt,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
  };
};

export const getMyKycSubmission = async (req, res) => {
  try {
    const latest = await KycSubmission.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ item: sanitizeForUser(latest), kycStatus: req.user.kycStatus || "not_submitted" });
  } catch {
    return res.status(500).json({ message: "Failed to fetch KYC status" });
  }
};

export const submitKyc = async (req, res) => {
  try {
    const idDocumentName = String(req.body?.idDocumentName || "").trim();
    const idDocumentData = String(req.body?.idDocumentData || "").trim();
    const proofOfAddressName = String(req.body?.proofOfAddressName || "").trim();
    const proofOfAddressData = String(req.body?.proofOfAddressData || "").trim();

    if (!idDocumentName || !idDocumentData || !proofOfAddressName || !proofOfAddressData) {
      return res.status(400).json({ message: "Both documents are required" });
    }
    if (!isBase64DataUrl(idDocumentData) || !isBase64DataUrl(proofOfAddressData)) {
      return res.status(400).json({ message: "Invalid document format" });
    }

    const existingPending = await KycSubmission.findOne({
      userId: req.user._id,
      status: "pending",
    });
    if (existingPending) {
      return res.status(409).json({ message: "You already have a pending KYC submission" });
    }

    const submission = await KycSubmission.create({
      userId: req.user._id,
      idDocumentName,
      idDocumentData,
      proofOfAddressName,
      proofOfAddressData,
      status: "pending",
      rejectionNote: "",
    });

    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        kycStatus: "pending",
        kycReviewedAt: null,
        kycRejectionNote: "",
      },
    });

    return res.status(201).json({
      message: "KYC submitted successfully",
      item: sanitizeForUser(submission),
    });
  } catch {
    return res.status(500).json({ message: "Failed to submit KYC" });
  }
};

export const getPendingKycSubmissions = async (req, res) => {
  try {
    const submissions = await KycSubmission.find({ status: "pending" })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    return res.json({ items: submissions });
  } catch {
    return res.status(500).json({ message: "Failed to fetch pending KYC submissions" });
  }
};

export const reviewKycSubmission = async (req, res) => {
  try {
    const status = String(req.body?.status || "").trim().toLowerCase();
    const note = String(req.body?.note || "").trim();

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    if (status === "rejected" && !note) {
      return res.status(400).json({ message: "Rejection note is required" });
    }

    const submission = await KycSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: "KYC submission not found" });
    }
    if (submission.status !== "pending") {
      return res.status(400).json({ message: "KYC submission already reviewed" });
    }

    submission.status = status;
    submission.rejectionNote = status === "rejected" ? note : "";
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    await submission.save();

    await User.findByIdAndUpdate(submission.userId, {
      $set: {
        kycStatus: status,
        kycReviewedAt: submission.reviewedAt,
        kycRejectionNote: submission.rejectionNote || "",
      },
    });

    return res.json({
      message: `KYC ${status}`,
      item: submission,
    });
  } catch {
    return res.status(500).json({ message: "Failed to review KYC submission" });
  }
};
