import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";

const adminEmail = process.env.ADMIN_EMAIL || "admin@cryptoinvest.com";
const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";

const demoEmail = process.env.DEMO_USER_EMAIL || "user@cryptoinvest.com";
const demoPassword = process.env.DEMO_USER_PASSWORD || "User@123456";

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

const backfillReferralCodes = async () => {
  const users = await User.find({
    $or: [{ referralCode: { $exists: false } }, { referralCode: null }, { referralCode: "" }],
  }).select("_id firstName lastName email referralCode");

  if (users.length === 0) {
    return;
  }

  for (const user of users) {
    user.referralCode = await generateUniqueReferralCode({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
    await user.save();
  }

  console.log(`Backfilled referral codes for ${users.length} user(s).`);
};

export const seedDefaultUsers = async () => {
  const adminExists = await User.findOne({ email: adminEmail });
  const userExists = await User.findOne({ email: demoEmail });

  if (!adminExists) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await User.create({
      name: "System Admin",
      firstName: "System",
      lastName: "Admin",
      email: adminEmail,
      password: hashed,
      role: "admin",
      referralCode: await generateUniqueReferralCode({
        firstName: "System",
        lastName: "Admin",
        email: adminEmail,
      }),
      balance: 0,
      country: "United States",
      currency: "USD",
    });
    console.log("Seeded admin account:");
    console.log(`  email: ${adminEmail}`);
    console.log(`  password: ${adminPassword}`);
  }

  if (!userExists) {
    const hashed = await bcrypt.hash(demoPassword, 10);
    await User.create({
      name: "Demo User",
      firstName: "Demo",
      lastName: "User",
      email: demoEmail,
      password: hashed,
      role: "user",
      referralCode: await generateUniqueReferralCode({
        firstName: "Demo",
        lastName: "User",
        email: demoEmail,
      }),
      balance: 0,
      country: "United States",
      currency: "USD",
    });
    console.log("Seeded user account:");
    console.log(`  email: ${demoEmail}`);
    console.log(`  password: ${demoPassword}`);
  }

  await backfillReferralCodes();
};
