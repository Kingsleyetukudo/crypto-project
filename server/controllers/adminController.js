import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import DepositWallet from "../models/DepositWallet.js";
import Investment from "../models/Investment.js";
import InvestmentPlan from "../models/InvestmentPlan.js";
import {
  sendAdminEventNotification,
  sendUserEventNotification,
} from "../utils/mailer.js";

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
    if (transaction.type === "withdrawal") {
      const isReferralWithdrawal = transaction.source === "referral";
      const available = isReferralWithdrawal
        ? Number(user.referralEarnings || 0)
        : Number(user.balance || 0);
      if (available < transaction.amount) {
        return {
          code: 400,
          payload: {
            message: isReferralWithdrawal
              ? "Insufficient referral balance"
              : "Insufficient user balance",
          },
        };
      }
    }

    if (transaction.type === "withdrawal") {
      if (transaction.source === "referral") {
        await User.findByIdAndUpdate(transaction.userId, {
          $inc: { referralEarnings: -transaction.amount },
        });
      } else {
        await User.findByIdAndUpdate(transaction.userId, {
          $inc: { balance: -transaction.amount },
        });
      }
    } else {
      await User.findByIdAndUpdate(transaction.userId, {
        $inc: { balance: transaction.amount },
      });
    }

    if (transaction.type === "deposit" && user.referredBy) {
      const bonus = Number((Number(transaction.amount || 0) * 0.01).toFixed(2));
      if (bonus > 0) {
        await User.findByIdAndUpdate(user.referredBy, {
          $inc: { referralEarnings: bonus },
        });

        await Transaction.create({
          userId: user.referredBy,
          amount: bonus,
          type: "profit",
          status: "completed",
          txHash: `REFERRAL-${transaction._id}`,
          walletName: "Referral Bonus",
          asset: transaction.asset || "USD",
        });
      }
    }
  }

  transaction.status = status;
  await transaction.save();
  return { code: 200, payload: transaction };
};

export const approveTransaction = async (req, res) => {
  try {
    const result = await processTransactionStatusChange(req.params.id, req.body.status);
    if (result.code === 200 && result.payload?.userId) {
      const user = await User.findById(result.payload.userId).select("email");
      const tx = result.payload;
      const decision = tx.status === "completed" ? "approved" : "rejected";

      void sendAdminEventNotification({
        subject: `${tx.type} ${decision}`,
        title: "Transaction Status Updated",
        intro: `An admin ${decision} a ${tx.type} transaction.`,
        rows: [
          { label: "Type", value: tx.type },
          { label: "Amount", value: `${tx.amount}` },
          { label: "Status", value: tx.status },
          { label: "User", value: user?.email || String(tx.userId) },
        ],
      });

      if (user?.email) {
        void sendUserEventNotification({
          to: user.email,
          subject: `Your ${tx.type} was ${decision}`,
          title: `${tx.type === "deposit" ? "Deposit" : "Withdrawal"} ${decision}`,
          intro: `Your ${tx.type} request has been ${decision}.`,
          rows: [
            { label: "Amount", value: `${tx.amount}` },
            { label: "Status", value: tx.status },
            { label: "Reference", value: tx.txHash || tx._id },
          ],
        });
      }
    }
    return res.status(result.code).json(result.payload);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update transaction" });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const result = await processTransactionStatusChange(req.params.id, req.body.status);
    if (result.code === 200 && result.payload?.userId) {
      const user = await User.findById(result.payload.userId).select("email");
      const tx = result.payload;
      const decision = tx.status === "completed" ? "approved" : "rejected";

      void sendAdminEventNotification({
        subject: `${tx.type} ${decision}`,
        title: "Transaction Status Updated",
        intro: `An admin ${decision} a ${tx.type} transaction.`,
        rows: [
          { label: "Type", value: tx.type },
          { label: "Amount", value: `${tx.amount}` },
          { label: "Status", value: tx.status },
          { label: "User", value: user?.email || String(tx.userId) },
        ],
      });

      if (user?.email) {
        void sendUserEventNotification({
          to: user.email,
          subject: `Your ${tx.type} was ${decision}`,
          title: `${tx.type === "deposit" ? "Deposit" : "Withdrawal"} ${decision}`,
          intro: `Your ${tx.type} request has been ${decision}.`,
          rows: [
            { label: "Amount", value: `${tx.amount}` },
            { label: "Status", value: tx.status },
            { label: "Reference", value: tx.txHash || tx._id },
          ],
        });
      }
    }
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

    void sendAdminEventNotification({
      subject: "New deposit wallet added",
      title: "Wallet Added",
      intro: "An admin added a new deposit wallet.",
      rows: [
        { label: "Name", value: wallet.name },
        { label: "Asset", value: wallet.asset },
        { label: "Network", value: wallet.network || "-" },
        { label: "Address", value: wallet.address },
        { label: "Active", value: wallet.isActive ? "yes" : "no" },
      ],
    });

    return res.status(201).json(wallet);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create wallet" });
  }
};

export const updateAdminWallet = async (req, res) => {
  try {
    const current = await DepositWallet.findById(req.params.id);
    if (!current) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    const { name, address, asset, network, isActive } = req.body;
    const update = { name, address, asset, network, isActive };
    Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

    const wallet = await DepositWallet.findByIdAndUpdate(
      req.params.id,
      update,
      { returnDocument: "after" },
    );

    void sendAdminEventNotification({
      subject: "Deposit wallet updated",
      title: "Wallet Updated",
      intro: "An admin updated a deposit wallet.",
      rows: [
        { label: "Name", value: wallet.name },
        { label: "Asset", value: wallet.asset },
        { label: "Network", value: wallet.network || "-" },
        { label: "Address", value: wallet.address },
        { label: "Active", value: wallet.isActive ? "yes" : "no" },
        { label: "Previous Address", value: current.address },
      ],
    });

    return res.json(wallet);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update wallet" });
  }
};

export const deleteAdminWallet = async (req, res) => {
  try {
    const wallet = await DepositWallet.findByIdAndDelete(req.params.id);
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    void sendAdminEventNotification({
      subject: "Deposit wallet deleted",
      title: "Wallet Deleted",
      intro: "An admin deleted a deposit wallet.",
      rows: [
        { label: "Name", value: wallet.name },
        { label: "Asset", value: wallet.asset },
        { label: "Network", value: wallet.network || "-" },
        { label: "Address", value: wallet.address },
      ],
    });

    return res.json({ message: "Wallet deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete wallet" });
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
    const { name, roi, durationDays, minAmount, maxAmount, details } = req.body;
    if (!name || !roi || !durationDays) {
      return res.status(400).json({ message: "Missing plan details" });
    }
    const parsedMin = Number(minAmount || 0);
    const parsedMax = Number(maxAmount || 0);
    if (parsedMin < 0 || parsedMax < 0) {
      return res.status(400).json({ message: "Min and max amounts must be positive" });
    }
    if (parsedMax > 0 && parsedMax < parsedMin) {
      return res.status(400).json({ message: "Max amount must be greater than min amount" });
    }

    const normalizedDetails = Array.isArray(details)
      ? details.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 6)
      : [];

    const plan = await InvestmentPlan.create({
      name,
      roi,
      durationDays,
      minAmount: parsedMin,
      maxAmount: parsedMax,
      details: normalizedDetails,
      isActive: true,
    });

    void sendAdminEventNotification({
      subject: "Investment plan created",
      title: "Investment Plan Added",
      intro: "An admin added a new investment plan.",
      rows: [
        { label: "Name", value: plan.name },
        { label: "ROI", value: `${plan.roi}%` },
        { label: "Duration", value: `${plan.durationDays} days` },
        { label: "Min Amount", value: `${plan.minAmount}` },
        { label: "Max Amount", value: `${plan.maxAmount || "No limit"}` },
      ],
    });

    return res.status(201).json(plan);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create plan" });
  }
};

export const updateInvestmentPlan = async (req, res) => {
  try {
    const { name, roi, durationDays, minAmount, maxAmount, details, isActive } = req.body;
    const update = { name, roi, durationDays, minAmount, maxAmount, isActive };
    Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

    const existingPlan = await InvestmentPlan.findById(req.params.id);
    if (!existingPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    if (update.minAmount !== undefined) update.minAmount = Number(update.minAmount);
    if (update.maxAmount !== undefined) update.maxAmount = Number(update.maxAmount);
    if ((update.minAmount ?? 0) < 0 || (update.maxAmount ?? 0) < 0) {
      return res.status(400).json({ message: "Min and max amounts must be positive" });
    }
    const effectiveMin = update.minAmount ?? Number(existingPlan.minAmount || 0);
    const effectiveMax = update.maxAmount ?? Number(existingPlan.maxAmount || 0);
    if (effectiveMax > 0 && effectiveMax < effectiveMin) {
      return res.status(400).json({ message: "Max amount must be greater than min amount" });
    }

    if (details !== undefined) {
      update.details = Array.isArray(details)
        ? details.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 6)
        : [];
    }

    const plan = await InvestmentPlan.findByIdAndUpdate(req.params.id, update, {
      returnDocument: "after",
    });

    void sendAdminEventNotification({
      subject: "Investment plan updated",
      title: "Investment Plan Updated",
      intro: "An admin updated an investment plan.",
      rows: [
        { label: "Name", value: plan.name },
        { label: "ROI", value: `${plan.roi}%` },
        { label: "Duration", value: `${plan.durationDays} days` },
        { label: "Min Amount", value: `${plan.minAmount}` },
        { label: "Max Amount", value: `${plan.maxAmount || "No limit"}` },
      ],
    });

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

    void sendAdminEventNotification({
      subject: "Investment plan deleted",
      title: "Investment Plan Deleted",
      intro: "An admin deleted an investment plan.",
      rows: [
        { label: "Name", value: plan.name },
        { label: "ROI", value: `${plan.roi}%` },
        { label: "Duration", value: `${plan.durationDays} days` },
      ],
    });

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

    const user = await User.findById(userId).select("email");
    void sendAdminEventNotification({
      subject: "Admin investment created",
      title: "Investment Added By Admin",
      intro: "An admin created an investment entry.",
      rows: [
        { label: "User", value: user?.email || userId },
        { label: "Plan", value: planName },
        { label: "Amount", value: `${amount}` },
        { label: "ROI", value: `${roi}%` },
        { label: "Duration", value: `${durationDays} days` },
      ],
    });

    if (user?.email) {
      void sendUserEventNotification({
        to: user.email,
        subject: "A new investment was added to your account",
        title: "Investment Added",
        intro: "An investment was added to your account by admin.",
        rows: [
          { label: "Plan", value: planName },
          { label: "Amount", value: `${amount}` },
          { label: "ROI", value: `${roi}%` },
          { label: "Duration", value: `${durationDays} days` },
        ],
      });
    }

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

    const user = await User.findById(investment.userId).select("email");
    void sendAdminEventNotification({
      subject: "Admin investment updated",
      title: "Investment Updated By Admin",
      intro: "An admin updated an investment entry.",
      rows: [
        { label: "User", value: user?.email || String(investment.userId) },
        { label: "Plan", value: investment.planName },
        { label: "Amount", value: `${investment.amount}` },
        { label: "ROI", value: `${investment.roi}%` },
        { label: "Duration", value: `${investment.durationDays} days` },
        { label: "Status", value: investment.status },
      ],
    });

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

    const user = await User.findById(investment.userId).select("email");
    void sendAdminEventNotification({
      subject: "Admin investment deleted",
      title: "Investment Deleted By Admin",
      intro: "An admin deleted an investment entry.",
      rows: [
        { label: "User", value: user?.email || String(investment.userId) },
        { label: "Plan", value: investment.planName },
        { label: "Amount", value: `${investment.amount}` },
        { label: "ROI", value: `${investment.roi}%` },
        { label: "Duration", value: `${investment.durationDays} days` },
      ],
    });

    return res.json({ message: "Investment deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete investment" });
  }
};
