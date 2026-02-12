import Investment from "../models/Investment.js";
import InvestmentPlan from "../models/InvestmentPlan.js";

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
    if (!planId || !amount) {
      return res.status(400).json({ message: "Plan and amount are required" });
    }

    const plan = await InvestmentPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(400).json({ message: "Invalid investment plan" });
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + Number(plan.durationDays));

    const investment = await Investment.create({
      userId: req.user._id,
      planId: plan._id,
      planName: plan.name,
      amount,
      roi: plan.roi,
      durationDays: plan.durationDays,
      endDate,
      status: "active",
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
