import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Investment from "../models/Investment.js";
import Transaction from "../models/Transaction.js";
import RegistrationOtp from "../models/RegistrationOtp.js";
import PasswordChangeOtp from "../models/PasswordChangeOtp.js";
import { sendAdminEventNotification, sendOtpMail } from "../utils/mailer.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const isProduction = process.env.NODE_ENV === "production";
const buildReferrerMatch = (userId) => {
  const asString = String(userId || "").trim();
  return {
    $or: [{ referredBy: userId }, { referredBy: asString }],
  };
};

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const normalizeReferralCode = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");

const isMongoObjectId = (value) => /^[A-F0-9]{24}$/i.test(String(value || "").trim());

const parseReferralFromReferer = (referer) => {
  const raw = String(referer || "").trim();
  if (!raw) return "";

  try {
    const url = new URL(raw);
    const queryRef = String(url.searchParams.get("ref") || "").trim();
    if (queryRef) return queryRef;

    const segments = url.pathname.split("/").filter(Boolean);
    const refIndex = segments.findIndex((part) => part.toLowerCase() === "ref");
    if (refIndex >= 0 && segments[refIndex + 1]) {
      return String(segments[refIndex + 1]).trim();
    }
    return "";
  } catch {
    return "";
  }
};

const resolveIncomingReferral = ({ req, otpRecord }) => {
  const bodyRef = String(
    req.body?.referralCode || req.body?.ref || req.body?.referrer || "",
  ).trim();
  const otpRef = String(otpRecord?.referralCode || "").trim();
  const headerRef = parseReferralFromReferer(req.headers?.referer);
  return bodyRef || otpRef || headerRef || "";
};

const resolveReferrerByValue = async (value) => {
  const raw = String(value || "").trim();
  if (!raw) return null;

  if (isMongoObjectId(raw)) {
    const byId = await User.findById(raw).select("_id");
    if (byId) return byId;
  }

  const normalized = normalizeReferralCode(raw);
  if (!normalized) return null;

  return User.findOne({
    referralCode: { $in: Array.from(new Set([raw, normalized])) },
  }).select("_id");
};

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

const ensureReferralCode = async (user) => {
  if (!user || user.referralCode) {
    return user;
  }
  user.referralCode = await generateUniqueReferralCode({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });
  await user.save();
  return user;
};

export const sendRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    const normalizedReferralCode = normalizeReferralCode(
      resolveIncomingReferral({ req }),
    );

    await RegistrationOtp.findOneAndUpdate(
      { email: normalizedEmail },
      { otpHash, expiresAt, referralCode: normalizedReferralCode || undefined },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );

    try {
      await sendOtpMail({
        to: normalizedEmail,
        otp,
        purpose: "registration",
        expiresMinutes: 10,
      });
      return res.json({ message: "Registration OTP sent to email" });
    } catch (mailError) {
      console.error("[mail] registration otp send failed:", {
        message: mailError?.message,
        code: mailError?.code,
        command: mailError?.command,
        response: mailError?.response,
        responseCode: mailError?.responseCode,
        smtpContext: mailError?.smtpContext,
      });

      if (isProduction) {
        if (String(process.env.EXPOSE_SMTP_ERROR || "").toLowerCase() === "true") {
          return res.status(500).json({
            message: "Failed to send registration OTP",
            smtpError: mailError?.message || "Unknown SMTP error",
          });
        }
        return res.status(500).json({ message: "Failed to send registration OTP" });
      }
      return res.json({
        message: `SMTP is unavailable. Development OTP: ${otp}`,
        smtpError: mailError?.message || "Unknown SMTP error",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Failed to send registration OTP" });
  }
};

export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      country,
      currency,
      otp,
    } = req.body;
    const name = [firstName, lastName].filter(Boolean).join(" ").trim();

    if (!name || !email || !password || !otp) {
      return res
        .status(400)
        .json({ message: "First name, last name, email, password, and OTP required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const otpRecord = await RegistrationOtp.findOne({ email: normalizedEmail });
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      await RegistrationOtp.deleteOne({ email: normalizedEmail });
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const otpHash = crypto.createHash("sha256").update(String(otp)).digest("hex");
    if (otpHash !== otpRecord.otpHash) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const incomingReferralValue = resolveIncomingReferral({ req, otpRecord });
    let referredBy = null;
    if (incomingReferralValue) {
      const referrer = await resolveReferrerByValue(incomingReferralValue);
      if (!referrer) {
        return res.status(400).json({ message: "Invalid referral code" });
      }
      referredBy = referrer._id;
    }
    const userReferralCode = await generateUniqueReferralCode({
      firstName,
      lastName,
      email: normalizedEmail,
    });

    const user = await User.create({
      name,
      firstName,
      lastName,
      email: normalizedEmail,
      password: hashed,
      country,
      currency,
      referralCode: userReferralCode,
      referredBy,
    });
    const token = signToken(user);
    await RegistrationOtp.deleteOne({ email: normalizedEmail });

    await sendAdminEventNotification({
      subject: "New user signup",
      title: "New User Signup",
      intro: "A new user account has been created.",
      rows: [
        { label: "Name", value: user.name },
        { label: "Email", value: user.email },
        { label: "Country", value: user.country || "-" },
        { label: "Currency", value: user.currency || "-" },
      ],
    });

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        country: user.country,
        currency: user.currency,
        referralCode: user.referralCode,
        referralEarnings: user.referralEarnings,
        referredBy: user.referredBy,
        referralBalance: user.referralBalance,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    await ensureReferralCode(user);

    const token = signToken(user);
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        referralCode: user.referralCode,
        referralEarnings: user.referralEarnings,
        referralBalance: user.referralBalance,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: "If the email exists, an OTP was sent" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.resetOtpHash = otpHash;
    user.resetOtpExpiresAt = expiresAt;
    await user.save();

    await sendOtpMail({
      to: user.email,
      otp,
      purpose: "password reset",
      expiresMinutes: 10,
    });

    return res.json({ message: "OTP sent to email" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetOtpHash || !user.resetOtpExpiresAt) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    if (otpHash !== user.resetOtpHash || user.resetOtpExpiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    return res.json({ message: "OTP verified" });
  } catch (error) {
    return res.status(500).json({ message: "OTP verification failed" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ message: "Email, OTP, and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetOtpHash || !user.resetOtpExpiresAt) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    if (otpHash !== user.resetOtpHash || user.resetOtpExpiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetOtpHash = undefined;
    user.resetOtpExpiresAt = undefined;
    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({ message: "Password reset failed" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await ensureReferralCode(user);

    const activeInvestments = await Investment.countDocuments({
      userId: req.user._id,
      status: "active",
    });
    const activeInvestmentRows = await Investment.find({
      userId: req.user._id,
      status: "active",
    }).select("amount roi");
    const totalActiveInvestment = activeInvestmentRows.reduce(
      (sum, row) => sum + (Number(row.amount) || 0),
      0,
    );
    const avgApy = activeInvestmentRows.length
      ? activeInvestmentRows.reduce((sum, row) => sum + (Number(row.roi) || 0), 0)
        / activeInvestmentRows.length
      : 0;
    const profitTx = await Transaction.find({
      userId: req.user._id,
      type: "profit",
      status: "completed",
    });
    const depositTx = await Transaction.find({
      userId: req.user._id,
      type: "deposit",
      status: "completed",
    }).select("amount");
    const totalProfit = profitTx.reduce(
      (sum, tx) => sum + (Number(tx.amount) || 0),
      0,
    );
    const totalDeposits = depositTx.reduce(
      (sum, tx) => sum + (Number(tx.amount) || 0),
      0,
    );
    const totalAssets = Number(user.balance || 0) + totalActiveInvestment;
    const totalReferrals = await User.countDocuments(buildReferrerMatch(req.user._id));

    return res.json({
      id: user._id,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      balance: user.balance,
      country: user.country,
      currency: user.currency,
      referralCode: user.referralCode,
      referralEarnings: user.referralEarnings,
      referredBy: user.referredBy,
      referralBalance: user.referralBalance,
      activeInvestments,
      totalProfit,
      totalDeposits,
      totalActiveInvestment,
      totalAssets,
      apy: avgApy,
      totalReferrals,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, country, currency } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const nextFirstName = typeof firstName === "string" ? firstName.trim() : user.firstName || "";
    const nextLastName = typeof lastName === "string" ? lastName.trim() : user.lastName || "";
    const nextName = [nextFirstName, nextLastName].filter(Boolean).join(" ").trim();

    user.firstName = nextFirstName;
    user.lastName = nextLastName;
    user.name = nextName || user.name;

    if (typeof country === "string") {
      user.country = country.trim();
    }

    if (typeof currency === "string") {
      user.currency = currency.trim().toUpperCase();
    }

    await user.save();

    return res.json({
      id: user._id,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      balance: user.balance,
      country: user.country,
      currency: user.currency,
      referralCode: user.referralCode,
      referralEarnings: user.referralEarnings,
      referralBalance: user.referralBalance,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const userId = String(req.user._id);
    const record = await PasswordChangeOtp.findOne({ userId });
    if (!record || record.expiresAt < new Date()) {
      await PasswordChangeOtp.deleteOne({ userId });
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const otpHash = crypto.createHash("sha256").update(String(otp)).digest("hex");
    if (otpHash !== record.otpHash) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = record.newPasswordHash;
    await user.save();
    await PasswordChangeOtp.deleteOne({ userId });

    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to change password" });
  }
};

export const requestPasswordChangeOtp = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const sameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (sameAsCurrent) {
      return res
        .status(400)
        .json({ message: "New password must be different from current password" });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await PasswordChangeOtp.findOneAndUpdate(
      { userId: user._id },
      { otpHash, expiresAt, newPasswordHash },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );

    await sendOtpMail({
      to: user.email,
      otp,
      purpose: "password change",
      expiresMinutes: 10,
    });

    return res.json({ message: "Password change OTP sent to email" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send password change OTP" });
  }
};
