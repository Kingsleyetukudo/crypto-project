import Investment from "../models/Investment.js";
import InvestmentPlan from "../models/InvestmentPlan.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import {
  sendAdminEventNotification,
  sendUserEventNotification,
} from "../utils/mailer.js";

const ROI_WITHDRAWAL_MIN = 10;
const ROI_WITHDRAWAL_INTERVAL_DAYS = 10;
const ROI_WITHDRAWALS_PER_MONTH = 3;

const buildReferrerMatch = (userId) => {
  const asString = String(userId || "").trim();
  return {
    $or: [{ referredBy: userId }, { referredBy: asString }],
  };
};

const getDailyInterestAmount = (investment) => {
  const amount = Number(investment?.amount || 0);
  const roi = Number(investment?.roi || 0);
  const duration = Number(investment?.durationDays || 0);
  if (!amount || !roi || !duration) return 0;
  return (amount * (roi / 100)) / duration;
};

const mapInvestmentForClient = (investment) => {
  const accrued = Number(investment.totalInterestAccrued || 0);
  const withdrawn = Number(investment.totalInterestWithdrawn || 0);
  const available = Math.max(0, accrued - withdrawn);
  const dailyInterest = getDailyInterestAmount(investment);
  const nextEligibleAt = investment.lastInterestWithdrawalAt
    ? new Date(
      new Date(investment.lastInterestWithdrawalAt).getTime()
        + ROI_WITHDRAWAL_INTERVAL_DAYS * 24 * 60 * 60 * 1000,
    )
    : null;
  return {
    ...investment.toObject(),
    dailyInterest,
    availableInterest: available,
    nextRoiWithdrawalAt: nextEligibleAt,
    roiWithdrawalRules: {
      minAmount: ROI_WITHDRAWAL_MIN,
      intervalDays: ROI_WITHDRAWAL_INTERVAL_DAYS,
      perMonth: ROI_WITHDRAWALS_PER_MONTH,
    },
  };
};

export const getPlans = async (req, res) => {
  try {
    const { page, limit } = req.pagination;
    const filter = { isActive: true };

    const total = await InvestmentPlan.countDocuments(filter);
    const plans = await InvestmentPlan.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return res.json({ items: plans, total, page, limit });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch plans" });
  }
};

export const createInvestment = async (req, res) => {
  try {
    const { planId, amount } = req.body;
    const numericAmount = Number(amount);
    if (!planId || !numericAmount) {
      return res.status(400).json({ message: "Plan and amount are required" });
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Valid investment amount is required" });
    }

    const plan = await InvestmentPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(400).json({ message: "Invalid investment plan" });
    }
    if (Number(plan.minAmount || 0) > 0 && numericAmount < Number(plan.minAmount)) {
      return res.status(400).json({
        message: `Minimum amount for this plan is ${Number(plan.minAmount)}`,
      });
    }
    if (Number(plan.maxAmount || 0) > 0 && numericAmount > Number(plan.maxAmount)) {
      return res.status(400).json({
        message: `Maximum amount for this plan is ${Number(plan.maxAmount)}`,
      });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.user._id, balance: { $gte: numericAmount } },
      { $inc: { balance: -numericAmount } },
      { returnDocument: "after" },
    );
    if (!user) {
      return res.status(400).json({ message: "Insufficient wallet balance for this investment" });
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + Number(plan.durationDays));

    const investment = await Investment.create({
      userId: req.user._id,
      planId: plan._id,
      planName: plan.name,
      amount: numericAmount,
      roi: plan.roi,
      durationDays: plan.durationDays,
      endDate,
      status: "active",
    });
    void sendAdminEventNotification({
      subject: "New investment created",
      title: "Investment Created",
      intro: "A user created a new investment.",
      rows: [
        { label: "User", value: req.user.email },
        { label: "Plan", value: plan.name },
        { label: "Amount", value: `${numericAmount}` },
        { label: "ROI", value: `${plan.roi}%` },
        { label: "Duration", value: `${plan.durationDays} days` },
      ],
    });

    void sendUserEventNotification({
      to: req.user.email,
      subject: "Investment started",
      title: "Your Investment Is Active",
      intro: "Your investment has been created successfully.",
      rows: [
        { label: "Plan", value: plan.name },
        { label: "Amount", value: `${numericAmount}` },
        { label: "ROI", value: `${plan.roi}%` },
        { label: "Duration", value: `${plan.durationDays} days` },
      ],
    });

    return res.status(201).json(investment);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create investment" });
  }
};

export const getMyInvestments = async (req, res) => {
  try {
    const { page, limit } = req.pagination;
    const filter = { userId: req.user._id };

    const total = await Investment.countDocuments(filter);
    const investments = await Investment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return res.json({
      items: investments.map((item) => mapInvestmentForClient(item)),
      total,
      page,
      limit,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch investments" });
  }
};

export const getActiveInvestments = async (req, res) => {
  try {
    const { page, limit } = req.pagination;
    const filter = { userId: req.user._id, status: "active" };

    const total = await Investment.countDocuments(filter);
    const investments = await Investment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return res.json({
      items: investments.map((item) => mapInvestmentForClient(item)),
      total,
      page,
      limit,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch active investments" });
  }
};

export const createRoiWithdrawal = async (req, res) => {
  try {
    const investmentId = String(req.body?.investmentId || "").trim();
    const amount = Number(req.body?.amount);

    if (!investmentId) {
      return res.status(400).json({ message: "Investment is required" });
    }
    if (!Number.isFinite(amount) || amount < ROI_WITHDRAWAL_MIN) {
      return res.status(400).json({
        message: `Minimum ROI withdrawal amount is $${ROI_WITHDRAWAL_MIN}`,
      });
    }

    const investment = await Investment.findOne({
      _id: investmentId,
      userId: req.user._id,
    });
    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    const pendingTotalAgg = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: "withdrawal",
          source: "investment_roi",
          investmentId: investment._id,
          status: "pending",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const pendingTotal = Number(pendingTotalAgg?.[0]?.total || 0);
    const available = Math.max(
      0,
      Number(investment.totalInterestAccrued || 0)
        - Number(investment.totalInterestWithdrawn || 0)
        - pendingTotal,
    );

    if (available < amount) {
      return res.status(400).json({ message: "Insufficient accrued ROI for this request" });
    }

    const now = new Date();
    const isCompleted = now >= new Date(investment.endDate) || investment.status === "completed";

    if (!isCompleted) {
      if (investment.lastInterestWithdrawalAt) {
        const nextAllowed = new Date(investment.lastInterestWithdrawalAt);
        nextAllowed.setDate(nextAllowed.getDate() + ROI_WITHDRAWAL_INTERVAL_DAYS);
        if (now < nextAllowed) {
          return res.status(400).json({
            message: `ROI withdrawal is allowed every ${ROI_WITHDRAWAL_INTERVAL_DAYS} days. Next available date: ${nextAllowed.toISOString()}`,
          });
        }
      }

      const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
      const monthlyCount = await Transaction.countDocuments({
        userId: req.user._id,
        type: "withdrawal",
        source: "investment_roi",
        investmentId: investment._id,
        status: { $in: ["pending", "completed"] },
        createdAt: { $gte: monthStart, $lt: monthEnd },
      });
      if (monthlyCount >= ROI_WITHDRAWALS_PER_MONTH) {
        return res.status(400).json({
          message: `ROI can be withdrawn only ${ROI_WITHDRAWALS_PER_MONTH} times per month`,
        });
      }

      const totalReferrals = await User.countDocuments(buildReferrerMatch(req.user._id));
      if (totalReferrals <= Number(investment.referralCountAtLastWithdrawal || 0)) {
        return res.status(400).json({
          message: "A new referral is required before the next 10-day ROI withdrawal",
        });
      }

      const transaction = await Transaction.create({
        userId: req.user._id,
        amount,
        type: "withdrawal",
        status: "pending",
        source: "investment_roi",
        investmentId: investment._id,
        referralCountAtRequest: totalReferrals,
      });

      return res.status(201).json({
        message: "ROI withdrawal request submitted",
        transaction,
      });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      amount,
      type: "withdrawal",
      status: "pending",
      source: "investment_roi",
      investmentId: investment._id,
      referralCountAtRequest: Number(investment.referralCountAtLastWithdrawal || 0),
    });

    return res.status(201).json({
      message: "ROI withdrawal request submitted",
      transaction,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to submit ROI withdrawal" });
  }
};
