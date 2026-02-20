import Transaction from "../models/Transaction.js";
import DepositWallet from "../models/DepositWallet.js";
import User from "../models/User.js";
import {
  sendAdminEventNotification,
  sendUserEventNotification,
} from "../utils/mailer.js";

export const createDeposit = async (req, res) => {
  try {
    const { amount, txHash, walletId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount required" });
    }

    let wallet = null;
    if (walletId) {
      wallet = await DepositWallet.findById(walletId);
      if (!wallet || !wallet.isActive) {
        return res.status(400).json({ message: "Invalid deposit wallet" });
      }
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      amount,
      type: "deposit",
      status: "pending",
      txHash,
      walletId: wallet?._id,
      walletName: wallet?.name,
      walletAddress: wallet?.address,
      asset: wallet?.asset,
    });

    void sendAdminEventNotification({
      subject: "New deposit request",
      title: "Deposit Request Submitted",
      intro: "A user submitted a new deposit request.",
      rows: [
        { label: "User", value: req.user.email },
        { label: "Amount", value: `${amount}` },
        { label: "Asset", value: wallet?.asset || "-" },
        { label: "Wallet", value: wallet?.name || "-" },
        { label: "Status", value: "pending" },
      ],
    });

    void sendUserEventNotification({
      to: req.user.email,
      subject: "Deposit request received",
      title: "Deposit Request Received",
      intro: "Your deposit request was received and is pending admin review.",
      rows: [
        { label: "Amount", value: `${amount}` },
        { label: "Asset", value: wallet?.asset || "-" },
        { label: "Wallet", value: wallet?.name || "-" },
        { label: "Status", value: "pending" },
      ],
    });

    return res.status(201).json(transaction);
  } catch (error) {
    return res.status(500).json({ message: "Deposit request failed" });
  }
};

export const createWithdraw = async (req, res) => {
  try {
    const { amount, destinationAddress, destinationNetwork, txHash } = req.body;
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Valid amount required" });
    }
    if (numericAmount < 100) {
      return res.status(400).json({ message: "Minimum withdrawal amount is $100" });
    }
    if (!destinationAddress) {
      return res.status(400).json({ message: "Destination address required" });
    }

    const user = await User.findById(req.user._id);
    if (!user || user.balance < numericAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      amount: numericAmount,
      type: "withdrawal",
      status: "pending",
      txHash,
      destinationAddress,
      destinationNetwork,
    });

    void sendAdminEventNotification({
      subject: "New withdrawal request",
      title: "Withdrawal Request Submitted",
      intro: "A user submitted a new withdrawal request.",
      rows: [
        { label: "User", value: req.user.email },
        { label: "Amount", value: `${numericAmount}` },
        { label: "Destination", value: destinationAddress },
        { label: "Network", value: destinationNetwork || "-" },
        { label: "Status", value: "pending" },
      ],
    });

    void sendUserEventNotification({
      to: req.user.email,
      subject: "Withdrawal request received",
      title: "Withdrawal Request Received",
      intro: "Your withdrawal request was received and is pending admin review.",
      rows: [
        { label: "Amount", value: `${numericAmount}` },
        { label: "Destination", value: destinationAddress },
        { label: "Network", value: destinationNetwork || "-" },
        { label: "Status", value: "pending" },
      ],
    });

    return res.status(201).json(transaction);
  } catch (error) {
    return res.status(500).json({ message: "Withdrawal request failed" });
  }
};

export const getMyHistory = async (req, res) => {
  try {
    const { page, limit } = req.pagination;
    const filter = { userId: req.user._id };
    if (req.query.type) {
      filter.type = req.query.type;
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({ items: transactions, total, page, limit });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch transactions" });
  }
};

export const getMyTransactions = async (req, res) => {
  try {
    const { page, limit } = req.pagination;
    const filter = { userId: req.user._id };

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({ items: transactions, total, page, limit });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch transactions" });
  }
};
