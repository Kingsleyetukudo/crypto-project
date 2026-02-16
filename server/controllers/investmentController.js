import Investment from "../models/Investment.js";
import InvestmentPlan from "../models/InvestmentPlan.js";
import User from "../models/User.js";
import {
  sendAdminEventNotification,
  sendUserEventNotification,
} from "../utils/mailer.js";

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
    return res.json({ items: investments, total, page, limit });
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
    return res.json({ items: investments, total, page, limit });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch active investments" });
  }
};
