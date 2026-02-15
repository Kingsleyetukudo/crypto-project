import nodemailer from "nodemailer";

const cleanEnv = (value = "") =>
  String(value)
    .trim()
    .replace(/^['"]|['"]$/g, "");

const emailHost = cleanEnv(process.env.EMAIL_HOST);
const emailUser = cleanEnv(process.env.EMAIL_USER);
const emailPass = cleanEnv(process.env.EMAIL_PASS);
const emailFrom = cleanEnv(process.env.EMAIL_FROM) || emailUser;

const transporter = nodemailer.createTransport({
  host: emailHost,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export const sendMail = async ({ to, subject, text, html }) => {
  return transporter.sendMail({
    from: emailFrom,
    to,
    subject,
    text,
    html,
  });
};
