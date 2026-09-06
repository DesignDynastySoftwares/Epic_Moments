import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { sendEmail, buildOtpEmail } from "../utils/sendEmail.js";

const createToken = (id) =>
  jwt.sign({ id, role: "user" }, process.env.JWT_SECRET, { expiresIn: "7d" });

// REGISTER
export const registerUser = async (req, res) => {
  const { name, email, phone, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.json({ success: false, message: "User exists" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    phone: phone || "",
    password: hashed,
  });

  const token = createToken(user._id);
  res.json({ success: true, token });
};

// LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ success: false, message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.json({ success: false, message: "Invalid password" });

  const token = createToken(user._id);
  res.json({ success: true, token });
};

// FORGOT PASSWORD — generate a 6-digit OTP valid for 10 minutes
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    // Do not reveal whether the account exists (avoids user enumeration)
    if (!user) {
      return res.json({
        success: true,
        message: "If an account exists, an OTP has been sent.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    // Send OTP via email
    const emailSent = await sendEmail({
      to: user.email,
      subject: "Your Epic Moments password reset code",
      html: buildOtpEmail(otp),
    });

    if (!emailSent) {
      // Email couldn't be sent — never expose the OTP in the response
      return res.json({
        success: false,
        message: "Could not send OTP email. Please try again later.",
      });
    }

    return res.json({
      success: true,
      message: "OTP sent to your email.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// RESET PASSWORD — verify OTP and set a new password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.json({ success: false, message: "All fields are required" });
    }
    if (newPassword.length < 6) {
      return res.json({ success: false, message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    if (user.resetOtpExpiry < new Date()) {
      return res.json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    if (user.resetOtp !== String(otp)) {
      return res.json({ success: false, message: "Incorrect OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    return res.json({ success: true, message: "Password reset successful. Please log in." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
