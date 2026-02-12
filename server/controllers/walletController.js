import DepositWallet from "../models/DepositWallet.js";

export const getActiveWallets = async (req, res) => {
  try {
    const { page, limit } = req.pagination;
    const filter = { isActive: true };

    const total = await DepositWallet.countDocuments(filter);
    const wallets = await DepositWallet.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({ items: wallets, total, page, limit });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch wallets" });
  }
};
