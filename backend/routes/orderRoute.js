// routes/orderRouter.js
import express from 'express';
import {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
  deleteOrder,
  verifyStripe,
  verifyRazorpay
} from '../controllers/orderController.js';

import authAdmin from '../middleware/authAdmin.js';
import authUser from '../middleware/authUser.js';

const router = express.Router();

// Admin routes
router.post('/list', authAdmin, allOrders);
router.post('/status', authAdmin, updateStatus);
router.post('/delete', authAdmin, deleteOrder);

// User routes
router.post('/place', authUser, placeOrder);
router.post('/stripe', authUser, placeOrderStripe);
router.post('/razorpay', authUser, placeOrderRazorpay);
router.post('/userorders', authUser, userOrders);

// Payment verification
router.post('/verifyStripe', authUser, verifyStripe);
router.post('/verifyRazorpay', authUser, verifyRazorpay);

export default router;
