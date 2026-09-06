import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import { sendEmail, buildCartReminderEmail } from "./sendEmail.js";

const REMINDER_DELAY_MS = 30 * 60 * 1000; // 30 minutes
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // run every 5 minutes

// Resolve a cartData object into a flat list of { name, size, quantity, price }
const resolveCartItems = async (cartData) => {
  const items = [];
  const ids = Object.keys(cartData || {});
  if (ids.length === 0) return items;

  const products = await productModel.find({ _id: { $in: ids } });
  const byId = {};
  products.forEach((p) => (byId[p._id.toString()] = p));

  for (const id of ids) {
    const sizes = cartData[id] || {};
    const product = byId[id];
    for (const size in sizes) {
      const qty = sizes[size];
      if (qty > 0) {
        items.push({
          name: product?.name || "Product",
          size,
          quantity: qty,
          price: product?.price,
        });
      }
    }
  }
  return items;
};

const hasCartItems = (cartData) => {
  if (!cartData) return false;
  for (const id in cartData) {
    for (const size in cartData[id]) {
      if (cartData[id][size] > 0) return true;
    }
  }
  return false;
};

const runCheck = async () => {
  try {
    const cutoff = new Date(Date.now() - REMINDER_DELAY_MS);

    // Candidates: cart updated > 30 min ago, reminder not yet sent
    const users = await userModel.find({
      cartReminderSent: { $ne: true },
      cartUpdatedAt: { $ne: null, $lte: cutoff },
    });

    for (const user of users) {
      if (!user.email || !hasCartItems(user.cartData)) continue;

      const items = await resolveCartItems(user.cartData);
      if (items.length === 0) continue;

      const sent = await sendEmail({
        to: user.email,
        subject: "Still thinking it over? Your Epic Moments cart is waiting 🛍️",
        html: buildCartReminderEmail({ name: user.name, items }),
      });

      // Mark as sent regardless, so we don't spam on every cycle
      user.cartReminderSent = true;
      await user.save();

      if (sent) console.log(`🛒 Cart reminder sent to ${user.email}`);
    }
  } catch (err) {
    console.error("Cart reminder check failed:", err.message);
  }
};

/** Start the abandoned-cart reminder scheduler. */
export const startCartReminderScheduler = () => {
  // First run after a short delay so the server finishes booting
  setTimeout(runCheck, 60 * 1000);
  setInterval(runCheck, CHECK_INTERVAL_MS);
  console.log("🛒 Cart reminder scheduler started (checks every 5 min, 30-min delay)");
};
