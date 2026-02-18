import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import crypto from "crypto";

const REFERRAL_ACTION_MIN = 100;

const buildReferrerMatch = (userId) => {
  const asString = String(userId || "").trim();
  return {
    $or: [{ referredBy: userId }, { referredBy: asString }],
  };
};

const buildReferralCodeBase = ({ firstName, lastName, email }) => {
  const full = `${firstName || ""}${lastName || ""}`.trim();
  const source = full || String(email || "").split("@")[0] || "USER";
  const cleaned = source.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return cleaned.slice(0, 12) || "USER";
};

const generateUniqueReferralCode = async ({ firstName, lastName, email }) => {
  const base = buildReferralCodeBase({ firstName, lastName, email });
  let candidate = base;
  let attempt = 0;

  while (attempt < 30) {
    const exists = await User.exists({ referralCode: candidate });
    if (!exists) {
      return candidate;
    }
    const suffix = crypto.randomBytes(2).toString("hex").toUpperCase();
    candidate = `${base}${suffix}`.slice(0, 16);
    attempt += 1;
  }

  return `${base}${Date.now().toString(36).toUpperCase()}`.slice(0, 16);
};

export const getMyReferrals = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "firstName lastName email referralCode referralEarnings",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.referralCode) {
      user.referralCode = await generateUniqueReferralCode({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
      await user.save();
    }

    const referredUsers = await User.find(buildReferrerMatch(req.user._id))
      .select("name email createdAt")
      .sort({ createdAt: -1 });

    const referredIds = referredUsers.map((item) => item._id);
    let depositsByUser = {};

    if (referredIds.length > 0) {
      const totals = await Transaction.aggregate([
        {
          $match: {
            userId: { $in: referredIds },
            type: "deposit",
            status: "completed",
          },
        },
        {
          $group: {
            _id: "$userId",
            totalDeposits: { $sum: "$amount" },
          },
        },
      ]);
      depositsByUser = totals.reduce((acc, row) => {
        acc[String(row._id)] = Number(row.totalDeposits) || 0;
        return acc;
      }, {});
    }

    const items = referredUsers.map((item) => ({
      id: item._id,
      name: item.name,
      email: item.email,
      joinedAt: item.createdAt,
      totalDeposits: depositsByUser[String(item._id)] || 0,
    }));

    return res.json({
      referralCode: user.referralCode || "",
      referralEarnings: Number(user.referralEarnings) || 0,
      totalReferrals: items.length,
      items,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load referrals" });
  }
};

export const transferReferralToMainBalance = async (req, res) => {
  try {
    const amount = Number(req.body?.amount);
    if (!Number.isFinite(amount) || amount < REFERRAL_ACTION_MIN) {
      return res.status(400).json({
        message: `Minimum transfer amount is $${REFERRAL_ACTION_MIN}`,
      });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.user._id, referralEarnings: { $gte: amount } },
      { $inc: { referralEarnings: -amount, balance: amount } },
      { returnDocument: "after" },
    ).select("balance referralEarnings");

    if (!user) {
      return res.status(400).json({ message: "Insufficient referral earnings" });
    }

    await Transaction.create({
      userId: req.user._id,
      amount,
      type: "profit",
      status: "completed",
      walletName: "Referral Transfer",
      source: "referral",
    });

    return res.json({
      message: "Referral earnings transferred to main balance",
      balance: Number(user.balance) || 0,
      referralEarnings: Number(user.referralEarnings) || 0,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to transfer referral balance" });
  }
};

export const createReferralWithdrawal = async (req, res) => {
  try {
    const amount = Number(req.body?.amount);
    const destinationAddress = String(req.body?.destinationAddress || "").trim();
    const destinationNetwork = String(req.body?.destinationNetwork || "").trim();

    if (!Number.isFinite(amount) || amount < REFERRAL_ACTION_MIN) {
      return res.status(400).json({
        message: `Minimum withdrawal amount is $${REFERRAL_ACTION_MIN}`,
      });
    }
    if (!destinationAddress) {
      return res.status(400).json({ message: "Destination address required" });
    }

    const user = await User.findById(req.user._id).select("referralEarnings");
    if (!user || Number(user.referralEarnings || 0) < amount) {
      return res.status(400).json({ message: "Insufficient referral earnings" });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      amount,
      type: "withdrawal",
      status: "pending",
      destinationAddress,
      destinationNetwork,
      source: "referral",
      walletName: "Referral Withdrawal",
    });

    return res.status(201).json({
      message: "Referral withdrawal request submitted",
      transaction,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to submit referral withdrawal" });
  }
};
