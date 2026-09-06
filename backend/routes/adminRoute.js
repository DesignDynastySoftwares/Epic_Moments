import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import authAdmin from "../middleware/authAdmin.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid admin credentials",
    });
  }

  let admin = await User.findOne({ email });

  if (!admin) {
    admin = await User.create({
      email,
      password: "admin",
      isAdmin: true,
    });
  }

  const token = jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    success: true,
    token,
    message: "Admin login successful",
  });
});

// GET all registered users (admin only)
router.get("/users", authAdmin, async (req, res) => {
  try {
    // Exclude the admin account and sensitive fields
    const users = await User.find(
      { email: { $ne: process.env.ADMIN_EMAIL } },
      "name email phone isActive lastSeen createdAt"
    ).sort({ createdAt: -1 });

    // For users without a phone on their profile, try to pull it from
    // their most recent order's delivery address.
    const enriched = await Promise.all(
      users.map(async (u) => {
        let phone = u.phone;
        if (!phone) {
          const lastOrder = await orderModel
            .findOne({ userId: u._id })
            .sort({ date: -1 });
          phone = lastOrder?.address?.phone || "";
        }
        return {
          _id: u._id,
          name: u.name || "",
          email: u.email || "",
          phone,
          isActive: u.isActive,
          lastSeen: u.lastSeen,
          createdAt: u.createdAt,
        };
      })
    );

    res.json({ success: true, users: enriched });
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

export default router;
