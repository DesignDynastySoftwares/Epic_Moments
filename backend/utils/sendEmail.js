import nodemailer from "nodemailer";

// ── Gmail transporter (same style as previous project) ──────────────────
// Uses Gmail service with EMAIL_USER + EMAIL_PASS (a Gmail App Password).
// Spaces in the App Password are auto-stripped so "abcd efgh ijkl mnop" works.
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Verify SMTP connection on startup and log the result
if (EMAIL_USER && EMAIL_PASS) {
  transporter.verify((err) => {
    if (err) {
      console.error("❌ Email transporter error:", err.message);
    } else {
      console.log("✅ Email transporter ready");
    }
  });
} else {
  console.warn("⚠️ EMAIL_USER / EMAIL_PASS not set — emails will not be sent (dev OTP fallback used)");
}

/**
 * Send an email.
 * @param {Object} opts
 * @param {string} opts.to      recipient email
 * @param {string} opts.subject email subject
 * @param {string} opts.html    email body (HTML)
 * @returns {Promise<boolean>}  true if sent, false otherwise
 */
export const sendEmail = async ({ to, subject, html }) => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn("⚠️ Email not configured — set EMAIL_USER / EMAIL_PASS in .env");
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"Epic Moments" <${EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    return false;
  }
};

/**
 * Builds a branded OTP email body.
 * @param {string} otp  the 6-digit code
 */
export const buildOtpEmail = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #f0e0ea; border-radius: 12px;">
    <h2 style="color: #e8157e; margin: 0 0 8px;">Epic Moments</h2>
    <p style="color: #333; font-size: 15px;">You requested to reset your password. Use the code below:</p>
    <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #3d0066; background: #fce4f0; padding: 16px; text-align: center; border-radius: 8px; margin: 16px 0;">
      ${otp}
    </div>
    <p style="color: #777; font-size: 13px;">This code is valid for 10 minutes. If you didn't request this, please ignore this email.</p>
  </div>
`;

// Shared wrapper for branded emails
const shell = (inner) => `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #f0e0ea; border-radius: 14px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #3d0066, #7b1fa2); padding: 22px 24px;">
      <h1 style="color: #fff; margin: 0; font-size: 22px;">Epic Moments</h1>
    </div>
    <div style="padding: 24px;">${inner}</div>
    <div style="background: #fdf5fa; padding: 14px 24px; font-size: 12px; color: #9a8a94; text-align: center;">
      Epic Moments · Personalized gifts &amp; photography · myepicmoments.com
    </div>
  </div>
`;

const itemsTable = (items = []) => {
  if (!items.length) return "";
  const rows = items
    .map(
      (it) => `
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #f2e6ee; color:#4a2540;">${it.name || "Item"}${it.size ? ` <span style="color:#9a8a94;">(${it.size})</span>` : ""}</td>
        <td style="padding:8px 0; border-bottom:1px solid #f2e6ee; text-align:center; color:#4a2540;">x${it.quantity || 1}</td>
        <td style="padding:8px 0; border-bottom:1px solid #f2e6ee; text-align:right; color:#4a2540;">${it.price ? "₹" + it.price : ""}</td>
      </tr>`
    )
    .join("");
  return `
    <table style="width:100%; border-collapse:collapse; margin:14px 0; font-size:14px;">
      <thead>
        <tr>
          <th style="text-align:left; padding:6px 0; color:#7b1fa2; border-bottom:2px solid #e8bcd6;">Item</th>
          <th style="text-align:center; padding:6px 0; color:#7b1fa2; border-bottom:2px solid #e8bcd6;">Qty</th>
          <th style="text-align:right; padding:6px 0; color:#7b1fa2; border-bottom:2px solid #e8bcd6;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
};

/** Order confirmation email (sent to customer when an order is placed) */
export const buildOrderConfirmationEmail = ({ name, orderId, items, amount, paymentMethod }) =>
  shell(`
    <h2 style="color:#e8157e; margin:0 0 6px;">Thank you for your order! 🎉</h2>
    <p style="color:#4a2540; font-size:15px;">Hi ${name || "there"}, we've received your order and are getting it ready.</p>
    <p style="color:#77617a; font-size:13px; margin:4px 0;">Order ID: <strong style="color:#3d0066;">${orderId}</strong></p>
    ${itemsTable(items)}
    <div style="display:flex; justify-content:space-between; padding-top:8px; font-size:15px; font-weight:700; color:#3d0066;">
      <span>Total</span><span>₹${amount}</span>
    </div>
    <p style="color:#77617a; font-size:13px; margin-top:10px;">Payment: ${paymentMethod || "—"}</p>
    <p style="color:#4a2540; font-size:14px; margin-top:16px;">We'll email you again when your order status changes. 💝</p>
  `);

/** New-order notification email (sent to the store admin) */
export const buildAdminOrderEmail = ({ orderId, items, amount, paymentMethod, address }) =>
  shell(`
    <h2 style="color:#e8157e; margin:0 0 6px;">New Order Received 🛎️</h2>
    <p style="color:#77617a; font-size:13px; margin:4px 0;">Order ID: <strong style="color:#3d0066;">${orderId}</strong></p>
    ${itemsTable(items)}
    <div style="display:flex; justify-content:space-between; padding-top:8px; font-size:15px; font-weight:700; color:#3d0066;">
      <span>Total</span><span>₹${amount}</span>
    </div>
    <p style="color:#77617a; font-size:13px; margin-top:6px;">Payment: ${paymentMethod || "—"}</p>
    <h3 style="color:#7b1fa2; font-size:15px; margin:18px 0 6px;">Customer &amp; Delivery</h3>
    <p style="color:#4a2540; font-size:14px; margin:2px 0;">
      ${address?.firstName || ""} ${address?.lastName || ""}<br/>
      ${address?.email ? `✉️ ${address.email}<br/>` : ""}
      ${address?.phone ? `📞 ${address.phone}<br/>` : ""}
      ${address?.street || ""}, ${address?.city || ""}, ${address?.state || ""}<br/>
      ${address?.country || ""} - ${address?.zipcode || ""}
    </p>
  `);

/** Order status update email */
export const buildOrderStatusEmail = ({ name, orderId, status }) =>
  shell(`
    <h2 style="color:#e8157e; margin:0 0 6px;">Order Update</h2>
    <p style="color:#4a2540; font-size:15px;">Hi ${name || "there"}, your order status has been updated.</p>
    <p style="color:#77617a; font-size:13px; margin:4px 0;">Order ID: <strong style="color:#3d0066;">${orderId}</strong></p>
    <div style="background:#fce4f0; color:#3d0066; font-weight:700; font-size:17px; padding:14px; border-radius:8px; text-align:center; margin:16px 0;">
      ${status}
    </div>
    <p style="color:#4a2540; font-size:14px;">Thank you for shopping with Epic Moments. 💝</p>
  `);

/** Cart / favorites reminder email (30-min abandoned cart) */
export const buildCartReminderEmail = ({ name, items }) =>
  shell(`
    <h2 style="color:#e8157e; margin:0 0 6px;">You left something behind 🛍️</h2>
    <p style="color:#4a2540; font-size:15px;">Hi ${name || "there"}, your picks are still waiting for you!</p>
    ${itemsTable(items)}
    <a href="https://myepicmoments.com/cart" style="display:inline-block; margin-top:14px; background:linear-gradient(135deg,#e8157e,#b3106b); color:#fff; text-decoration:none; padding:12px 26px; border-radius:8px; font-weight:700;">
      Complete Your Order →
    </a>
    <p style="color:#77617a; font-size:12px; margin-top:16px;">Handcrafted with love, just for you. 💝</p>
  `);
