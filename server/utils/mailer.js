import nodemailer from "nodemailer";
import { renderEventEmail, renderOtpEmail } from "./emailTemplates.js";

const cleanEnv = (value = "") =>
  String(value)
    .trim()
    .replace(/^['"]|['"]$/g, "");

const looksLikeEmail = (value = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

let transporter;
let mailConfig;
let resendConfig;

const getMailConfig = () => {
  if (mailConfig) return mailConfig;

  const host = cleanEnv(process.env.EMAIL_HOST);
  const port = Number(cleanEnv(process.env.EMAIL_PORT) || 587);
  const user = cleanEnv(process.env.EMAIL_USER);
  const pass = cleanEnv(process.env.EMAIL_PASS);
  const configuredFrom = cleanEnv(process.env.EMAIL_FROM);
  const from = looksLikeEmail(configuredFrom)
    ? configuredFrom
    : configuredFrom
      ? `"${configuredFrom.replace(/"/g, "")}" <${user}>`
      : user;
  const secure = cleanEnv(process.env.EMAIL_SECURE).toLowerCase() === "true" || port === 465;

  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS.");
  }

  mailConfig = { host, port, user, pass, from, secure };
  return mailConfig;
};

const getTransporter = () => {
  if (transporter) return transporter;

  const config = getMailConfig();
  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
  return transporter;
};

const getResendConfig = () => {
  if (resendConfig) return resendConfig;

  const apiKey = cleanEnv(process.env.RESEND_API_KEY);
  const provider = cleanEnv(process.env.EMAIL_PROVIDER).toLowerCase();
  const enabled = Boolean(apiKey) && (!provider || provider === "resend");
  if (!enabled) return null;

  const configuredFrom = cleanEnv(process.env.RESEND_FROM) || cleanEnv(process.env.EMAIL_FROM);
  const fallbackFrom = cleanEnv(process.env.EMAIL_USER);
  const from = looksLikeEmail(configuredFrom)
    ? configuredFrom
    : looksLikeEmail(fallbackFrom)
      ? fallbackFrom
      : "";

  if (!from) {
    throw new Error("Resend is enabled but RESEND_FROM is missing or invalid.");
  }

  resendConfig = { apiKey, from };
  return resendConfig;
};

const sendMailWithResend = async ({ to, subject, text, html }) => {
  const config = getResendConfig();
  if (!config) return null;

  const recipients = Array.isArray(to) ? to : [to];
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: recipients,
      subject,
      html,
      text,
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body?.message || `Resend failed with status ${response.status}`);
    error.code = "RESEND_ERROR";
    error.responseCode = response.status;
    error.response = body;
    error.smtpContext = {
      provider: "resend",
      from: config.from,
    };
    throw error;
  }

  return body;
};

export const sendMail = async ({ to, subject, text, html }) => {
  const resend = getResendConfig();
  if (resend) {
    return sendMailWithResend({ to, subject, text, html });
  }

  const config = getMailConfig();
  const smtp = getTransporter();

  try {
    return await smtp.sendMail({
      from: config.from,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    error.smtpContext = {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.user,
      from: config.from,
    };
    throw error;
  }
};

const toAdminRecipients = () => {
  const configured = cleanEnv(
    process.env.ADMIN_NOTIFICATION_EMAILS
      || process.env.ADMIN_NOTIFICATION_EMAIL
      || process.env.ADMIN_EMAIL
      || "",
  );

  if (configured) {
    return configured
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
  }

  const fallback = cleanEnv(process.env.EMAIL_USER);
  return fallback ? [fallback] : [];
};

const sendNotificationMail = async ({ to, subject, title, intro, rows, footerNote }) => {
  if (!to || (Array.isArray(to) && to.length === 0)) {
    return;
  }

  const details = (rows || [])
    .filter((row) => row?.label && row?.value !== undefined && row?.value !== null)
    .map((row) => `${row.label}: ${row.value}`)
    .join("\n");

  const textParts = [intro, details, footerNote].filter(Boolean);
  await sendMail({
    to,
    subject,
    text: textParts.join("\n\n"),
    html: renderEventEmail({ title, intro, rows, footerNote }),
  });
};

export const sendOtpMail = async ({ to, otp, purpose = "verification", expiresMinutes = 10 }) => {
  await sendMail({
    to,
    subject: `Your ${purpose} OTP`,
    text: `Your OTP code is ${otp}. It expires in ${expiresMinutes} minutes.`,
    html: renderOtpEmail({ otp, purpose, expiresMinutes }),
  });
};

export const sendAdminEventNotification = async ({ subject, title, intro, rows, footerNote }) => {
  const to = toAdminRecipients();
  if (to.length === 0) return;

  try {
    await sendNotificationMail({ to, subject, title, intro, rows, footerNote });
  } catch (error) {
    console.error("[mail] admin notification failed:", error?.message || error);
  }
};

export const sendUserEventNotification = async ({
  to,
  subject,
  title,
  intro,
  rows,
  footerNote,
}) => {
  if (!to) return;

  try {
    await sendNotificationMail({ to, subject, title, intro, rows, footerNote });
  } catch (error) {
    console.error("[mail] user notification failed:", error?.message || error);
  }
};
