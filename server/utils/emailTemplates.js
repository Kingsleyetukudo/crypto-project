const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderRows = (rows = []) =>
  rows
    .filter(
      (row) =>
        row && row.label && row.value !== undefined && row.value !== null,
    )
    .map(
      (row) => `
        <tr>
          <td style="padding:8px 0;color:#64748b;font-size:13px;width:40%;">${escapeHtml(row.label)}</td>
          <td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:600;">${escapeHtml(row.value)}</td>
        </tr>
      `,
    )
    .join("");

const renderBaseTemplate = ({
  preheader,
  title,
  intro,
  body,
  accent = "#0ea5e9",
}) => `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader || title)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="620" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg,${accent},#0f172a);padding:22px 24px;">
                <h1 style="margin:0;color:#ffffff;font-size:20px;line-height:1.3;">${escapeHtml(title)}</h1>
                <p style="margin:8px 0 0;color:#dbeafe;font-size:13px;line-height:1.5;">${escapeHtml(intro)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 20px;color:#64748b;font-size:12px;">
                This is an automated code from Gold Chain Investment.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export const renderOtpEmail = ({ otp, purpose, expiresMinutes = 10 }) => {
  const safePurpose = purpose || "verification";
  return renderBaseTemplate({
    preheader: `Your ${safePurpose} OTP is ${otp}`,
    title: `Your ${safePurpose} OTP`,
    intro: "Use this one-time passcode to continue securely.",
    accent: "#2563eb",
    body: `
      <p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.6;">
        Enter the code below to complete ${escapeHtml(safePurpose)}. This code expires in ${escapeHtml(expiresMinutes)} minutes.
      </p>
      <div style="margin:8px 0 16px;padding:16px;border:1px dashed #93c5fd;border-radius:10px;background:#eff6ff;text-align:center;">
        <span style="display:inline-block;font-size:32px;line-height:1;font-weight:800;letter-spacing:8px;color:#1d4ed8;">${escapeHtml(otp)}</span>
      </div>
      <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
        For security, do not share this code with anyone.
      </p>
    `,
  });
};

export const renderEventEmail = ({ title, intro, rows = [], footerNote }) =>
  renderBaseTemplate({
    preheader: title,
    title,
    intro: intro || "A new account event occurred.",
    accent: "#0ea5e9",
    body: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px;">
        ${renderRows(rows)}
      </table>
      ${
        footerNote
          ? `<p style="margin:14px 0 0;font-size:13px;color:#64748b;line-height:1.6;">${escapeHtml(footerNote)}</p>`
          : ""
      }
    `,
  });
