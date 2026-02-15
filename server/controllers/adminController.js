import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import DepositWallet from "../models/DepositWallet.js";
import Investment from "../models/Investment.js";
import InvestmentPlan from "../models/InvestmentPlan.js";

export const getPendingTransactions = async (req, res) => {
  try {
    const { page, limit } = req.pagination;
    const filter = { status: "pending" };

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return res.json({ items: transactions, total, page, limit });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch pending transactions" });
  }
};

export const getPendingByType = async (req, res) => {
  try {
    const { page, limit } = req.pagination;
    const filter = { status: "pending" };
    if (req.query.type) {
      filter.type = req.query.type;
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return res.json({ items: transactions, total, page, limit });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch pending transactions" });
  }
};

const processTransactionStatusChange = async (transactionId, status) => {
  if (!["completed", "rejected"].includes(status)) {
    return { code: 400, payload: { message: "Invalid status" } };
  }

  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    return { code: 404, payload: { message: "Transaction not found" } };
  }

  if (transaction.status !== "pending") {
    return { code: 400, payload: { message: "Transaction already processed" } };
  }

  if (status === "completed") {
    const user = await User.findById(transaction.userId);
    if (!user) {
      return { code: 404, payload: { message: "User not found" } };
    }
    if (transaction.type === "withdrawal" && user.balance < transaction.amount) {
      return { code: 400, payload: { message: "Insufficient user balance" } };
    }

    const delta = transaction.type === "withdrawal"
      ? -transaction.amount
      : transaction.amount;

    await User.findByIdAndUpdate(transaction.userId, {
      $inc: { balance: delta },
    });
  }

  transaction.status = status;
  await transaction.save();
  return { code: 200, payload: transaction };
};

export const approveTransaction = async (req, res) => {
  try {
    const result = await processTransactionStatusChange(req.params.id, req.body.status);
    return res.status(result.code).json(result.payload);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update transaction" });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const result = await processTransactionStatusChange(req.params.id, req.body.status);
    return res.status(result.code).json(result.payload);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update transaction" });
  }
};

export const getAdminWallets = async (req, res) => {
  try {
    const { page, limit } = req.pagination;
    const total = await DepositWallet.countDocuments();
    const wallets = await DepositWallet.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return res.json({ items: wallets, total, page, limit });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch wallets" });
  }
};

export const createAdminWallet = async (req, res) => {
  try {
    const { name, address, asset, network } = req.body;
    if (!name || !address || !asset) {
      return res.status(400).json({ message: "Name, address, and asset required" });
    }

    const wallet = await DepositWallet.create({
      name,
      address,
      asset,
      network,
      isActive: true,
    });
    return res.status(201).json(wallet);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create wallet" });
  }
};

export const updateAdminWallet = async (req, res) => {
  try {
    const { isActive } = req.body;
    const wallet = await DepositWallet.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { returnDocument: "after" },
    );
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    return res.json(wallet);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update wallet" });
  }
};

export const getAdminInvestments = async (req, res) => {
  try {
    const { page, limit } = req.pagination;
    const total = await Investment.countDocuments();
    const investments = await Investment.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return res.json({ items: investments, total, page, limit });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch investments" });
  }
};

export const getInvestmentPlans = async (req, res) => {
  try {
    const { page, limit } = req.pagination;
    const total = await InvestmentPlan.countDocuments();
    const plans = await InvestmentPlan.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return res.json({ items: plans, total, page, limit });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch plans" });
  }
};

export const createInvestmentPlan = async (req, res) => {
  try {
    const { name, roi, durationDays } = req.body;
    if (!name || !roi || !durationDays) {
      return res.status(400).json({ message: "Missing plan details" });
    }
    const plan = await InvestmentPlan.create({
      name,
      roi,
      durationDays,
      isActive: true,
    });
    return res.status(201).json(plan);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create plan" });
  }
};

export const updateInvestmentPlan = async (req, res) => {
  try {
    const { name, roi, durationDays, isActive } = req.body;
    const update = { name, roi, durationDays, isActive };
    Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

    const plan = await InvestmentPlan.findByIdAndUpdate(req.params.id, update, {
      returnDocument: "after",
    });
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    return res.json(plan);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update plan" });
  }
};

export const deleteInvestmentPlan = async (req, res) => {
  try {
    const plan = await InvestmentPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    return res.json({ message: "Plan deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete plan" });
  }
};

export const getUserInvestments = async (req, res) => {
  try {
    const { page, limit } = req.pagination;
    const total = await Investment.countDocuments();
    const investments = await Investment.find()
      .populate("userId", "name email")
      .populate("planId", "name roi durationDays")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return res.json({ items: investments, total, page, limit });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user investments" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { page, limit } = req.pagination;
    const filter = { role: "user" };

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return res.json({ items: users, total, page, limit });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getAdminHistory = async (req, res) => {
  try {
    const { page, limit } = req.pagination;
    const filter = {};
    if (req.query.type) {
      filter.type = req.query.type;
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return res.json({ items: transactions, total, page, limit });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch history" });
  }
};

export const createAdminInvestment = async (req, res) => {
  try {
    const { userId, planName, amount, roi, durationDays } = req.body;
    if (!userId || !planName || !amount || !roi || !durationDays) {
      return res.status(400).json({ message: "Missing investment details" });
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + Number(durationDays));

    const investment = await Investment.create({
      userId,
      planName,
      amount,
      roi,
      durationDays,
      endDate,
      status: "active",
    });
    return res.status(201).json(investment);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create investment" });
  }
};

export const updateAdminInvestment = async (req, res) => {
  try {
    const { planName, amount, roi, durationDays, status } = req.body;
    const update = { planName, amount, roi, durationDays, status };
    Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

    if (update.durationDays) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + Number(update.durationDays));
      update.endDate = endDate;
    }

    const investment = await Investment.findByIdAndUpdate(req.params.id, update, {
      returnDocument: "after",
    });
    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }
    return res.json(investment);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update investment" });
  }
};

export const deleteAdminInvestment = async (req, res) => {
  try {
    const investment = await Investment.findByIdAndDelete(req.params.id);
    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }
    return res.json({ message: "Investment deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete investment" });
  }
};
