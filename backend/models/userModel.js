import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    phone: { type: String, default: "" },
    password: String,

    cartData: { type: Object, default: {} },

    // Abandoned-cart reminder tracking
    cartUpdatedAt: { type: Date, default: null },
    cartReminderSent: { type: Boolean, default: false },

    isActive: { type: Boolean, default: false },
    lastSeen: { type: Date, default: null },

    // Password reset (OTP based)
    resetOtp: { type: String, default: null },
    resetOtpExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("user", userSchema);
