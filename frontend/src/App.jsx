import React, { useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./index.css";

// Eagerly loaded: shell + landing page (needed on first paint)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Loader from "./components/Loader";
import Home from "./pages/Home";

// Lazily loaded routes — split out of the main bundle so the
// homepage doesn't download every page's code up front.
const Collection = lazy(() => import("./pages/Collection"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Product = lazy(() => import("./pages/Product"));
const Cart = lazy(() => import("./pages/Cart"));
const Login = lazy(() => import("./pages/Login"));
const PlaceOrder = lazy(() => import("./pages/PlaceOrder"));
const MainPage = lazy(() => import("./pages/MainPage"));
const Orders = lazy(() => import("./pages/Orders"));
const Verify = lazy(() => import("./pages/Verify"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const KeywordList = lazy(() => import("./pages/KeywordList"));
const KeywordPage = lazy(() => import("./pages/KeywordPage"));
const GoogleReviews = lazy(() => import("./components/GoogleReviews"));
const SendOrderMail = lazy(() => import("./components/sendOrderMail"));
const NewLandingPage = lazy(() => import("./components/NewLandingPage"));
const PopularProducts = lazy(() => import("./components/PopularProducts"));
const OfferProducts = lazy(() => import("./components/OfferProducts"));
const DeskDecoratives = lazy(() => import("./components/DeskDecoratives"));
const WallDecoratives = lazy(() => import("./components/WallDecoratives"));
const CarDecoratives = lazy(() => import("./components/CarDecoratives"));
const BusinessNeeds = lazy(() => import("./components/BusinessNeeds"));
const OfferProductsPage = lazy(() => import("./pages/OfferProductsPage"));
const NewArrivalsPage = lazy(() => import("./pages/NewArrivalsPage"));
const AllReviews = lazy(() => import("./pages/AllReviews"));
const Wishlist = lazy(() => import("./pages/Wishlist"));

// Libraries
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Bootstrap CSS is imported once in main.jsx.
// Bootstrap's JS bundle was imported but never used (no data-bs-* components),
// so it has been removed to trim the initial bundle.

import AOS from "aos";
import "aos/dist/aos.css";
import { HelmetProvider } from "react-helmet-async";

const App = () => {
  const location = useLocation();

  // Routes where the footer should be hidden
  const hideFooter = location.pathname === "/login";

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
      easing: "ease-in-out",
    });
  }, []);

  return (
    <HelmetProvider>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        newestOnTop
        style={{ zIndex: 100000, top: "76px" }}
      />
      <Navbar />

      <main className="app-content" id="main-content">
        <ScrollToTop />

        <Suspense fallback={<Loader />}>
          <Routes>
            {/* ---------- Main Pages ---------- */}
            <Route path="/" element={<Home />} />
            <Route path="/collections" element={<Collection />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* ---------- Product Pages ---------- */}
            <Route path="/product/:productId" element={<Product />} />
            <Route path="/cart" element={<Cart />} />

            {/* ---------- Auth ---------- */}
            <Route path="/login" element={<Login />} />
            <Route path="/verify" element={<Verify />} />

            {/* ---------- Orders ---------- */}
            <Route path="/place-order" element={<PlaceOrder />} />
            <Route path="/orders" element={<Orders />} />

            {/* ---------- Extra Features ---------- */}
            <Route path="/mainpage" element={<MainPage />} />
            <Route path="/sendOrderMail" element={<SendOrderMail />} />

            {/* ---------- Legal ---------- */}
            <Route path="/privacypolicy" element={<PrivacyPolicy />} />
            <Route path="/termsandconditions" element={<TermsAndConditions />} />

            {/* ---------- Keyword SEO Pages ---------- */}
            <Route path="/keywords" element={<KeywordList />} />
            <Route path="/keyword/:slug" element={<KeywordPage />} />

            {/* ---------- Section Pages ---------- */}
            <Route path="/newlandingpage" element={<NewLandingPage />} />
            <Route path="/popular-products" element={<NewArrivalsPage />} />
            <Route path="/offer-products" element={<OfferProductsPage />} />
            <Route path="/desk-decoratives" element={<DeskDecoratives />} />
            <Route path="/wall-decoratives" element={<WallDecoratives />} />
            <Route path="/car-decoratives" element={<CarDecoratives />} />
            <Route path="/business-needs" element={<BusinessNeeds />} />
            <Route path="/google-reviews" element={<GoogleReviews />} />
            <Route path="/reviews" element={<AllReviews />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Routes>
        </Suspense>
      </main>

      {!hideFooter && <Footer />}
    </HelmetProvider>
  );
};

export default App;
