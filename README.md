# Epic Moments — Personalized Gifts, Printing & Photography

Epic Moments is a full-stack e-commerce platform for personalized photo gifts
(LED lamps, custom frames, sublimation pillows, waterproof stickers), decoratives
(desk / wall / car), business/corporate gifting, and professional photography &
album design.

**Live site:** https://myepicmoments.com

The project is a monorepo with three applications:

| App | Path | Tech | Purpose |
|-----|------|------|---------|
| **Frontend** | `frontend/` | React 18 + Vite | Customer storefront |
| **Admin** | `admin/` | React 18 + Vite | Admin dashboard (products, orders, content) |
| **Backend** | `backend/` | Node.js + Express + MongoDB | REST API, auth, payments, email |

> A `mobile/` folder also exists in the repo but is **not part of the active web
> deployment** and can be ignored for the web app.

---

## Tech Stack

**Frontend**
- React 18, Vite, React Router
- Axios, react-toastify, react-helmet-async (SEO)
- framer-motion, AOS (animations), react-slick (carousels)
- Firebase (push notifications), Razorpay checkout

**Admin**
- React 18, Vite, React Router, Axios, react-toastify

**Backend**
- Express, Mongoose (MongoDB)
- JWT auth, bcryptjs
- Razorpay + Stripe (payments)
- Nodemailer (order/enquiry emails), Cloudinary (media), Multer (uploads)
- helmet, express-rate-limit, express-mongo-sanitize, xss-clean (security)

---

## Prerequisites

- **Node.js** 18+ and npm
- A **MongoDB** database (Atlas or local)
- Accounts / keys for: **Cloudinary**, **Razorpay** (live), a **Gmail app password**
  (for Nodemailer)

---

## Project Structure

```
Epic_Latest-main/
├── frontend/        # Customer storefront (Vite React)
│   ├── src/
│   │   ├── components/   # Navbar, Footer, NewLandingPage, ProductItem, Loader, ...
│   │   ├── pages/        # Home, Collection, Product, Cart, PlaceOrder, About, ...
│   │   ├── context/      # ShopContext (cart, wishlist, products)
│   │   └── assets/
│   └── public/           # sitemap.xml, robots.txt, Google verification, sounds
├── admin/           # Admin dashboard (Vite React)
│   └── src/
│       ├── components/   # Navbar, Sidebar, Login
│       └── pages/        # Add, List, Orders, Decoratives, Categories, Users, ...
├── backend/         # Express API
│   ├── controllers/  # order, product, cart, user, enquiry, ...
│   ├── models/       # Mongoose schemas
│   ├── routes/
│   ├── utils/        # sendEmail, cartReminder
│   └── server.js
└── README.md
```

---

## Environment Variables

Create a `.env` file in each app. **Never commit `.env`** (already in `.gitignore`).

### `backend/.env`
```
MONGODB_URI=<your-mongodb-connection-string>
DB_NAME=epicmomentsdb

JWT_SECRET=<random-secret>
ADMIN_EMAIL=<admin-login-email>
ADMIN_PASSWORD=<admin-login-password>

CLOUDINARY_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_SECRET_KEY=<cloudinary-api-secret>

RAZORPAY_KEY_ID=<rzp_live_...>
RAZORPAY_KEY_SECRET=<razorpay-key-secret>

EMAIL_USER=<gmail-address>
EMAIL_PASS=<gmail-app-password>   # 16-char app password (2FA required)
```

### `frontend/.env`
```
VITE_BACKEND_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=<rzp_live_...>
```

### `admin/.env`
```
VITE_BACKEND_URL=http://localhost:4000
```

> On the live site, set these as **hosting environment variables** — `.env` files
> are not deployed.

---

## Getting Started (local)

Open three terminals (one per app).

### 1. Backend
```bash
cd backend
npm install
npm run server      # nodemon (dev)  — or: npm start
```
Runs on **http://localhost:4000**

### 2. Frontend (storefront)
```bash
cd frontend
npm install
npm run dev
```
Runs on **http://localhost:5173**

### 3. Admin (dashboard)
```bash
cd admin
npm install
npm run dev
```
Runs on **http://localhost:5174** (Vite picks the next free port)

---

## Build (production)

```bash
# Frontend
cd frontend && npm run build      # output: frontend/dist

# Admin
cd admin && npm run build         # output: admin/dist

# Backend runs directly
cd backend && npm start
```

Deploy the `dist/` folders (frontend & admin) to your static host, and run the
backend on a Node host. Configure the environment variables on each host.

---

## Key Features

**Storefront**
- Product catalog with categories, best sellers, combo offers, new arrivals
- Cart, wishlist, product detail pages
- Razorpay online payments + Cash on Delivery
- Order placement + order history
- Contact / enquiry form (emails the admin)
- Google reviews, photography & album showcase
- Fully responsive (desktop / tablet / mobile) with a premium splash loader
- SEO: per-page meta tags, sitemap, structured data (Product schema)

**Admin**
- Add / edit / delete products across all sections
- Order management with status updates + delete
- **Global new-order notification sound** (plays on any admin page)
- Manage categories, shop categories, decoratives, business needs
- Google reviews, offer banner, keyword manager, enquiries, admin users
- Responsive layout with a slide-in sidebar drawer on mobile

**Backend**
- JWT-based user + admin auth
- Razorpay order creation + signature/amount verification
- Order confirmation, status-update, and 30-min cart-reminder emails
- Cloudinary media uploads, rate limiting, input sanitization

---

## Payments (Razorpay)

- Uses **live** keys in production (`rzp_live_...`).
- Backend verifies the payment **signature** and the **captured amount** before
  confirming an order.
- Test mode uses a test card (`4111 1111 1111 1111`, any future expiry, any CVV);
  test QR codes do not complete real payments.

---

## SEO / Go-Live Checklist

1. Deploy frontend, admin, and backend; set env variables on each host.
2. Verify the site in **Google Search Console** (HTML verification file is in
   `frontend/public/`).
3. Submit the sitemap: `https://myepicmoments.com/sitemap.xml`.
4. Request indexing for key pages.
5. Set up **Google Business Profile** and social channels for traffic.

---

## Notes

- The `mobile/` folder is not maintained as part of the web deployment.
- Admin must re-login after a backend restart (JWT).
- Keep all secrets in `.env` / host env vars — never in source control.
