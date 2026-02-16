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

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

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

    await RegistrationOtp.findOneAndUpdate(
      { email: normalizedEmail },
      { otpHash, expiresAt },
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
      if (isProduction) {
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
    const { firstName, lastName, email, password, country, currency, otp } = req.body;
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

    const user = await User.create({
      name,
      firstName,
      lastName,
      email: normalizedEmail,
      password: hashed,
      country,
      currency,
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

    const token = signToken(user);
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
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
      activeInvestments,
      totalProfit,
      totalDeposits,
      totalActiveInvestment,
      totalAssets,
      apy: avgApy,
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
