import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import http from "http";
import { Server } from "socket.io";

import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';

import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import manageRoute from './routes/manageRoute.js';
import catagereRouter from './routes/catagereRoute.js';
import slideRouter from './routes/slideRoute.js';
import enquiryRoute from "./routes/enquiryRoute.js";
import keywordRouter from './routes/keywordRoute.js';
import popularProductRoute from "./routes/popularproductsRoute.js";
import OfferProductRoute from './routes/OfferProductRoute.js'; 
import DeskDecorativesRoute from "./routes/DeskDecorativesRoute.js";
import WallDecorativesRoute from "./routes/WallDecorativesRoute.js";
import CarDecorativesRoute from "./routes/CarDecorativesRoute.js";
import BusinessNeedsRoute from "./routes/BusinessNeedsRoute.js";
import googleReviewRoutes from "./routes/GoogleReviewsRoute.js";
import adminRoute from './routes/adminRoute.js';
import shopCategoryRoute from './routes/ShopCategoryRoute.js';
import offerBannerRoute from './routes/offerBannerRoute.js';


// 🔐 Security
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

// 🔥 User model
import User from "./models/userModel.js";

// 🛒 Abandoned-cart reminder scheduler
import { startCartReminderScheduler } from "./utils/cartReminder.js";

// ── Keep the server alive: log crashes instead of exiting ──
process.on("uncaughtException", (err) => {
  console.error("⚠️ Uncaught Exception (server kept alive):", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("⚠️ Unhandled Rejection (server kept alive):", reason);
});

const app = express();
const port = process.env.PORT || 4000;

// HTTP + Socket Server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Connect DB & Cloudinary
connectDB();
connectCloudinary();

// Middleware
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,                 // generous — the storefront fires ~13 GETs per page load
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "GET", // never rate-limit read/data-fetch requests
});
app.use('/api', limiter);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// API Routes
app.use("/api/user", userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/category', manageRoute);
app.use('/api/catagere', catagereRouter);
app.use('/api/slides', slideRouter);
app.use('/api/enquiries', enquiryRoute);
app.use('/api/keyword', keywordRouter);
app.use("/api/popular", popularProductRoute);
app.use("/api/offer", OfferProductRoute);
app.use("/api/deskdecoratives", DeskDecorativesRoute);
app.use("/api/walldecoratives", WallDecorativesRoute);
app.use("/api/cardecoratives", CarDecorativesRoute);
app.use("/api/businessneeds", BusinessNeedsRoute);
app.use("/api/googlereviews", googleReviewRoutes);
app.use("/api/admin", adminRoute);
app.use("/api/shopcategory", shopCategoryRoute);
app.use("/api/offerbanner", offerBannerRoute);




// Health Check
app.get('/', (req, res) => {
  res.send('API Working Securely ✅');
});


// ================================
// 🔴 SOCKET.IO ACTIVE USER TRACKING
// ================================
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("user_online", async (userId) => {
    socket.userId = userId;

    await User.findByIdAndUpdate(userId, {
      isActive: true,
      lastSeen: new Date()
    });
  });

  socket.on("disconnect", async () => {
    if (socket.userId) {
      await User.findByIdAndUpdate(socket.userId, {
        isActive: false,
        lastSeen: new Date()
      });
    }
    console.log("User disconnected:", socket.id);
  });
});

// START SERVER
server.listen(port, () =>
  console.log(`🚀 Server running on PORT ${port}`)
);

// Start background jobs
startCartReminderScheduler();
