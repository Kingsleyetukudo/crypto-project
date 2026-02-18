import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env"), override: true });

const parseArgs = () => {
  const args = process.argv.slice(2);
  const map = {};
  for (const arg of args) {
    if (!arg.startsWith("--")) continue;
    const [key, ...rest] = arg.slice(2).split("=");
    map[key] = rest.length ? rest.join("=") : "true";
  }
  return map;
};

const isObjectId = (value) => /^[a-fA-F0-9]{24}$/.test(String(value || "").trim());

const normalizeCode = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");

const usage = () => {
  console.log("Usage:");
  console.log("  npm run referrals:link -- --user=<email|id> --ref=<referralCode|email|id> [--force=true] [--applyBonus=true]");
};

const findUser = async (identifier) => {
  const value = String(identifier || "").trim();
  if (!value) return null;
  if (isObjectId(value)) {
    const byId = await User.findById(value);
    if (byId) return byId;
  }
  return User.findOne({ email: value.toLowerCase() });
};

const findReferrer = async (identifier) => {
  const value = String(identifier || "").trim();
  if (!value) return null;
  const candidates = Array.from(new Set([value, normalizeCode(value)].filter(Boolean)));
  if (isObjectId(value)) {
    const byId = await User.findById(value);
    if (byId) return byId;
  }
  return User.findOne({
    $or: [{ email: value.toLowerCase() }, { referralCode: { $in: candidates } }],
  });
};

const applyMissedBonuses = async (user, referrer) => {
  const deposits = await Transaction.find({
    userId: user._id,
    type: "deposit",
    status: "completed",
  }).select("_id amount asset");

  let totalBonus = 0;
  let created = 0;

  for (const deposit of deposits) {
    const txRef = `REFERRAL-${deposit._id}`;
    const exists = await Transaction.exists({
      userId: referrer._id,
      txHash: txRef,
      type: "profit",
    });
    if (exists) continue;

    const bonus = Number((Number(deposit.amount || 0) * 0.01).toFixed(2));
    if (bonus <= 0) continue;

    await Transaction.create({
      userId: referrer._id,
      amount: bonus,
      type: "profit",
      status: "completed",
      txHash: txRef,
      walletName: "Referral Bonus",
      asset: deposit.asset || "USD",
    });
    totalBonus += bonus;
    created += 1;
  }

  if (totalBonus > 0) {
    await User.findByIdAndUpdate(referrer._id, {
      $inc: { referralEarnings: totalBonus },
    });
  }

  return { created, totalBonus };
};

const run = async () => {
  const args = parseArgs();
  const userArg = args.user;
  const refArg = args.ref;
  const force = String(args.force || "false").toLowerCase() === "true";
  const applyBonus = String(args.applyBonus || "false").toLowerCase() === "true";

  if (!userArg || !refArg) {
    usage();
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  try {
    const user = await findUser(userArg);
    if (!user) {
      throw new Error(`User not found: ${userArg}`);
    }

    const referrer = await findReferrer(refArg);
    if (!referrer) {
      throw new Error(`Referrer not found: ${refArg}`);
    }

    if (String(user._id) === String(referrer._id)) {
      throw new Error("User cannot refer themselves");
    }

    if (user.referredBy && String(user.referredBy) !== String(referrer._id) && !force) {
      throw new Error("User already has a different referrer. Re-run with --force=true to overwrite.");
    }

    user.referredBy = referrer._id;
    await user.save();

    console.log(`Linked user ${user.email} -> referrer ${referrer.email} (${referrer.referralCode || "NO_CODE"})`);

    if (applyBonus) {
      const bonusResult = await applyMissedBonuses(user, referrer);
      console.log(
        `Applied missed bonuses: ${bonusResult.created} transaction(s), total $${bonusResult.totalBonus.toFixed(2)}`,
      );
    }
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error(error.message || "Failed to link referral");
  process.exit(1);
});
