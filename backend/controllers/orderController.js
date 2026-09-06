// controllers/orderController.js
import crypto from "crypto";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import {
  sendEmail,
  buildOrderConfirmationEmail,
  buildAdminOrderEmail,
  buildOrderStatusEmail,
} from "../utils/sendEmail.js";

// Best-effort order emails: confirmation to customer + notification to admin
const sendOrderConfirmation = async (order) => {
  const name = `${order?.address?.firstName || ""} ${order?.address?.lastName || ""}`.trim();

  // 1) Customer confirmation
  const to = order?.address?.email;
  if (to) {
    sendEmail({
      to,
      subject: "Your Epic Moments order is confirmed 🎉",
      html: buildOrderConfirmationEmail({
        name,
        orderId: order._id,
        items: order.items,
        amount: order.amount,
        paymentMethod: order.paymentMethod,
      }),
    }).catch((e) => console.error("Customer order email failed:", e.message));
  }

  // 2) Admin notification (new order received)
  const adminEmail = process.env.EMAIL_USER;
  if (adminEmail) {
    sendEmail({
      to: adminEmail,
      subject: `New order received — ₹${order.amount} (${order.paymentMethod})`,
      html: buildAdminOrderEmail({
        orderId: order._id,
        items: order.items,
        amount: order.amount,
        paymentMethod: order.paymentMethod,
        address: order.address,
      }),
    }).catch((e) => console.error("Admin order email failed:", e.message));
  }
};

const currency = 'inr';
const deliveryCharge = 10;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// COD / UPI Order
const placeOrder = async (req, res) => {
  try {
    const { items, amount, address, payment_method } = req.body;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ success: false, message: "User not authorized" });

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: payment_method.toUpperCase(),
      payment: payment_method === "cod" ? false : true,
      date: Date.now()
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Clear cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Send confirmation email (best-effort)
    sendOrderConfirmation(newOrder);

    res.json({ success: true, message: "Order placed", orderId: newOrder._id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Stripe Order
const placeOrderStripe = async (req, res) => {
  try {
    const { items, amount, address } = req.body;
    const userId = req.userId;
    const { origin } = req.headers;

    if (!userId) return res.status(401).json({ success: false, message: "User not authorized" });

    const orderData = { userId, items, address, amount, paymentMethod: "Stripe", payment: false, date: Date.now() };
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = items.map(item => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: item.price * 100
      },
      quantity: item.quantity
    }));

    line_items.push({
      price_data: { currency, product_data: { name: 'Delivery Charges' }, unit_amount: deliveryCharge * 100 },
      quantity: 1
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: 'payment'
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Stripe
const verifyStripe = async (req, res) => {
  try {
    const { orderId, success } = req.body;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ success: false, message: "User not authorized" });

    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Razorpay Order
const placeOrderRazorpay = async (req, res) => {
  try {
    const { items, amount, address } = req.body;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ success: false, message: "User not authorized" });

    const orderData = { userId, items, address, amount, paymentMethod: "Razorpay", payment: false, date: Date.now() };
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const options = { amount: amount * 100, currency: currency.toUpperCase(), receipt: newOrder._id.toString() };
    razorpayInstance.orders.create(options, (error, order) => {
      if (error) return res.json({ success: false, message: error });
      res.json({ success: true, order });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Razorpay — validates the payment signature AND the paid amount
const verifyRazorpay = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ success: false, message: "User not authorized" });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.json({ success: false, message: "Missing payment details" });
    }

    // 1) Verify the signature — proves the callback is genuinely from Razorpay
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.json({ success: false, message: "Payment verification failed (invalid signature)" });
    }

    // 2) Fetch the order + payment from Razorpay and confirm it's actually PAID
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
    const paymentInfo = await razorpayInstance.payments.fetch(razorpay_payment_id);

    const localOrder = await orderModel.findById(orderInfo.receipt);
    if (!localOrder) {
      return res.json({ success: false, message: "Order not found" });
    }

    // 3) Confirm the CAPTURED amount matches the order amount (correct amount received)
    const paidAmount = paymentInfo.amount;                 // in paise
    const expectedAmount = Math.round(localOrder.amount * 100);

    const isPaid = paymentInfo.status === "captured" || orderInfo.status === "paid";

    if (isPaid && paidAmount === expectedAmount) {
      await orderModel.findByIdAndUpdate(localOrder._id, {
        payment: true,
        status: "Order Placed",
      });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });

      // Send confirmation email (best-effort)
      sendOrderConfirmation(localOrder);

      return res.json({ success: true, message: "Payment verified successfully" });
    }

    // Payment not completed / amount mismatch → do NOT confirm the order
    return res.json({ success: false, message: "Payment not completed or amount mismatch" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Routes
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const userOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });

    // Notify the customer of the status change (best-effort)
    const to = order?.address?.email;
    if (to) {
      const name = `${order.address.firstName || ""} ${order.address.lastName || ""}`.trim();
      sendEmail({
        to,
        subject: `Your Epic Moments order is now "${status}"`,
        html: buildOrderStatusEmail({ name, orderId: order._id, status }),
      }).catch((e) => console.error("Status email failed:", e.message));
    }

    res.json({ success: true, message: 'Status Updated' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: delete an order
const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }
    await orderModel.findByIdAndDelete(orderId);
    res.json({ success: true, message: "Order deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
  deleteOrder,
  verifyStripe,
  verifyRazorpay
};
