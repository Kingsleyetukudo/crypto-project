import Transaction from "../models/Transaction.js";
import DepositWallet from "../models/DepositWallet.js";
import User from "../models/User.js";

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

    return res.status(201).json(transaction);
  } catch (error) {
    return res.status(500).json({ message: "Deposit request failed" });
  }
};

export const createWithdraw = async (req, res) => {
  try {
    const { amount, destinationAddress, txHash } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount required" });
    }
    if (!destinationAddress) {
      return res.status(400).json({ message: "Destination address required" });
    }

    const user = await User.findById(req.user._id);
    if (!user || user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      amount,
      type: "withdrawal",
      status: "pending",
      txHash,
      destinationAddress,
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
