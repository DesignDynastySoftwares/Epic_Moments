import React, { useContext, useState, useEffect } from "react";
import "./NewLandingPage.css";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext.jsx";
import BannerCanvas from "./BannerCanvas.jsx";

// Components
import PopularProducts from "../components/PopularProducts";
import OfferProducts from "../components/OfferProducts";
import LatestCollection from "../components/LatestCollection.jsx";
import DeskDecoratives from "../components/DeskDecoratives.jsx";
import WallDecoratives from "../components/WallDecoratives.jsx";
import CarDecoratives from "../components/CarDecoratives.jsx";
import BusinessNeeds from "../components/BusinessNeeds.jsx";
import GoogleReviews from "./GoogleReviews.jsx";

// Assets
import epic_banner from "../assets/free_delivary.png";
import birthday_album from "../assets/birthday_album.jpg";
import wedding_album from "../assets/wedding_album.jpg";
import { assets } from "../assets/assets.js";

// Icons
import {
  FaTruck, FaUndoAlt, FaMedal, FaLock, FaCheckCircle,
  FaShieldAlt, FaEnvelope, FaStar, FaFire,
  FaBoxOpen, FaTag, FaPaintBrush, FaCar, FaBook,
  FaGift, FaBriefcase, FaImages, FaPhotoVideo,
} from "react-icons/fa";
import { MdOutlineRocketLaunch } from "react-icons/md";

/* ── countdown helper ── counts down to a fixed future date ── */
// Target: 2 days + 14 hours + 25 mins + 36 secs from the first time this runs.
// We pin the target in sessionStorage so it survives re-renders but resets per tab.
const OFFER_TARGET_KEY = "epic_offer_target";

// Counts down to `targetDateInput` (a Date/ISO string from admin).
// If none provided, falls back to a rolling 2d14h target stored per-tab.
const useCountdown = (targetDateInput) => {
  const getTarget = () => {
    if (targetDateInput) {
      const t = new Date(targetDateInput).getTime();
      if (!Number.isNaN(t)) return t;
    }
    try {
      const saved = sessionStorage.getItem(OFFER_TARGET_KEY);
      if (saved) return Number(saved);
    } catch {}
    const target = Date.now() + (2 * 86400 + 14 * 3600 + 25 * 60 + 36) * 1000;
    try { sessionStorage.setItem(OFFER_TARGET_KEY, String(target)); } catch {}
    return target;
  };

  const [target, setTarget] = useState(getTarget);
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.floor((target - Date.now()) / 1000)));

  // Recompute target when admin value arrives/changes
  useEffect(() => {
    if (targetDateInput) {
      const t = new Date(targetDateInput).getTime();
      if (!Number.isNaN(t)) setTarget(t);
    }
  }, [targetDateInput]);

  useEffect(() => {
    const t = setInterval(() => {
      const secs = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setRemaining(secs);
      if (secs === 0) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [target]);

  const d = Math.floor(remaining / 86400);
  const h = Math.floor((remaining % 86400) / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  return { d, h, m, s };
};

/* ── icon map for shop categories ── */
const CATEGORY_ICONS = {
  desk: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8157e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  wedding: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8157e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  gift: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8157e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </svg>
  ),
  album: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8157e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  photo: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8157e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  ),
  wall: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8157e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  car: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8157e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  ),
  business: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8157e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  ),
  custom: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8157e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
};

const NewLandingPage = () => {
  const { shopCategories, offerBanner } = useContext(ShopContext);
  const navigate = useNavigate();
  const countdown = useCountdown(offerBanner?.targetDate);

  /* category pills */
  const categories = [
    { icon: <FaImages />,     label: "Photo Frames" },
    { icon: <FaBoxOpen />,    label: "Desk Decor" },
    { icon: <FaPaintBrush />, label: "Wall Decor" },
    { icon: <FaCar />,        label: "Car Decor" },
    { icon: <FaBook />,       label: "Albums" },
    { icon: <FaGift />,       label: "Personalized Gifts" },
    { icon: <FaBriefcase />,  label: "Corporate Gifts" },
    { icon: <FaTag />,        label: "All Categories" },
  ];

  return (
    <div className="nlp">

      {/* ── 1. ANNOUNCE BAR ── */}
      <div className="nlp-announce">
        <div className="nlp-announce__scroll">
          <span className="nlp-announce__rocket"><MdOutlineRocketLaunch /></span>
          <span>
            Free Delivery on orders above ₹499! &nbsp;|&nbsp;
            <strong>Premium Quality</strong> &nbsp;|&nbsp;
            Easy Returns &nbsp;|&nbsp;
            <strong>Loved by 1,00,000+ Customers</strong> &nbsp;|&nbsp;
            Trusted Quality Since 2021
          </span>
        </div>
      </div>

      {/* ── 2. HERO BANNER ── */}
      <section className="nlp-hero">
        <img src={assets.left_leaf}  alt="" className="nlp-hero__leaf nlp-hero__leaf--l" aria-hidden="true" loading="lazy" decoding="async" />
        <img src={assets.right_leaf} alt="" className="nlp-hero__leaf nlp-hero__leaf--r" aria-hidden="true" loading="lazy" decoding="async" />

        <div className="nlp-hero__inner">
          {/* left text — 45% */}
          <div className="nlp-hero__text">
            <span className="nlp-hero__eyebrow">Personalized with Love</span>
            <h1 className="nlp-hero__title">
              Turn Your Memories<br />Into <span>Something Special</span>
            </h1>
            <p className="nlp-hero__sub" spellCheck={false}>
              Personalized gifts that make every occasion<br />
              truly unforgettable.
            </p>
            <div className="nlp-hero__btns">
              <button onClick={() => navigate("/collections")} className="nlp-btn nlp-btn--pink">
                SHOP NOW →
              </button>
              <button onClick={() => navigate("/collections")} className="nlp-btn nlp-btn--ghost">
                EXPLORE COLLECTION
              </button>
            </div>

            {/* trust row — inside hero, below buttons */}
            <div className="nlp-hero__trust">
              <div className="nlp-hero__trust-item">
                <span className="nlp-hero__trust-icon"><FaShieldAlt /></span>
                <div>
                  <strong>Premium Quality</strong>
                  <span>Made with care</span>
                </div>
              </div>
              <div className="nlp-hero__trust-item">
                <span className="nlp-hero__trust-icon"><FaTruck /></span>
                <div>
                  <strong>Fast Delivery</strong>
                  <span>At your doorstep</span>
                </div>
              </div>
              <div className="nlp-hero__trust-item">
                <span className="nlp-hero__trust-icon"><FaLock /></span>
                <div>
                  <strong>100% Secure</strong>
                  <span>Safe Payments</span>
                </div>
              </div>
            </div>
          </div>

          {/* right image — 55% */}
          <div className="nlp-hero__img-wrap">
            <img
              src={assets.Hero_page_centerImage || assets.Special_2}
              alt="Personalized Gift"
              className="nlp-hero__img"
              width="600"
              height="600"
              fetchpriority="high"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* ── 3. CATEGORY PILLS ── */}
      <div className="nlp-cats">
        <div className="nlp-cats__inner">
          {categories.map(({ icon, label }) => (
            <button
              key={label}
              className="nlp-cat-pill"
              onClick={() => navigate("/collections")}
            >
              <span className="nlp-cat-pill__icon">{icon}</span>
              <span className="nlp-cat-pill__label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. BEST SELLERS ── */}
      <section className="op-wrapper">
        {/* top-right leaf decoration */}
        <img src={assets.right_leaf} alt="" className="op-wrapper__leaf" aria-hidden="true" loading="lazy" decoding="async" />

        <div className="op-wrapper__hd">
          <div className="op-wrapper__hd-left">
            <div className="op-wrapper__eyebrow">
              <span>MOST LOVED PICKS</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#e8157e" aria-hidden="true">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h2 className="op-wrapper__title op-wrapper__title--sm">
              Best <span>Sellers</span>
            </h2>
            <p className="op-wrapper__sub">Our most loved products, trusted by thousands of happy customers</p>
          </div>
          <button onClick={() => navigate("/collections")} className="op-wrapper__viewall">
            View All &nbsp;→
          </button>
        </div>

        <PopularProducts />
      </section>

      {/* ── 5. COMBO OFFERS ── */}
      <section className="op-wrapper">
        {/* top-right leaf decoration */}
        <img src={assets.right_leaf} alt="" className="op-wrapper__leaf" aria-hidden="true" loading="lazy" decoding="async" />

        <div className="op-wrapper__hd">
          <div className="op-wrapper__hd-left">
            <div className="op-wrapper__eyebrow">
              <span>BEST VALUE PACKS</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#e8157e" aria-hidden="true">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h2 className="op-wrapper__title">
              Combo <span>Offers</span>
            </h2>
            <p className="op-wrapper__sub">Premium products, perfect combos &amp; amazing savings</p>
          </div>
          <button onClick={() => navigate("/collections")} className="op-wrapper__viewall">
            View All &nbsp;→
          </button>
        </div>

        <OfferProducts />

        {/* bottom trust row */}
        <div className="op-wrapper__trust">
          {[
            { icon: "🏅", t: "Best Quality",   s: "Premium materials" },
            { icon: "🚚", t: "Fast Delivery",  s: "At your doorstep" },
            { icon: "🏷️", t: "Great Savings",  s: "Best combo deals" },
            { icon: "🔒", t: "Secure Payment", s: "100% safe & secure" },
          ].map(({ icon, t, s }) => (
            <div className="op-trust-item" key={t}>
              <span className="op-trust-item__icon">{icon}</span>
              <div>
                <strong>{t}</strong>
                <span>{s}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
 {/* ── 6. OFFER COUNTDOWN BANNER ──
       Only shows when the admin has set an ACTIVE banner with content
       from the backend. No server / no banner / inactive → hidden.
       On mobile it's re-ordered to sit right below the hero. */}
  {offerBanner &&
   offerBanner.isActive !== false &&
   offerBanner?.elements?.length > 0 ? (
    <div className="nlp-offer-order">
      <BannerCanvas banner={offerBanner} />
    </div>
  ) : null}

      {/* ── 7. SHOP BY CATEGORY ── */}
      <section className="sbc-section">

        {/* header */}
        <div className="sbc-hd">
          <div className="sbc-hd__left">
          
            <div>
              <div className="sbc-hd__eyebrow">
                <span>FIND YOUR GIFT</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#e8157e" aria-hidden="true">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <h2 className="sbc-hd__title">
                Shop by <span>Category</span>
              </h2>
              <p className="sbc-hd__sub">
                Find the perfect gift for every occasion
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#e8157e" style={{marginLeft:6,verticalAlign:"middle"}} aria-hidden="true">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </p>
            </div>
          </div>
          <button onClick={() => navigate("/collections")} className="sbc-hd__viewall">
            View All &nbsp;→
          </button>
        </div>

        {/* cards grid */}
        <div className="sbc-grid">
          {shopCategories && shopCategories.length > 0 ? (
            shopCategories.map((cat) => (
              <div
                className="sbc-card"
                key={cat._id}
                onClick={() => navigate(cat.navigateTo || "/collections")}
              >
                <div className="sbc-card__img">
                  <img src={cat.image?.url} alt={cat.name} loading="lazy" />
                </div>
                <div className="sbc-card__body">
                  <span className="sbc-card__icon">
                    {CATEGORY_ICONS[cat.iconType] || CATEGORY_ICONS.custom}
                  </span>
                  <div className="sbc-card__info">
                    <span className="sbc-card__label">{cat.name}</span>
                    <button className="sbc-card__explore">Explore Now →</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 col-span-5 text-center py-8">
              No categories available.
            </p>
          )}
        </div>
      </section>

      {/* ── 8. NEW ARRIVALS (Latest Collection) ── */}
      <section className="na-wrapper">

        {/* top-right leaf decoration */}
        <img src={assets.right_leaf} alt="" className="na-wrapper__leaf" aria-hidden="true" loading="lazy" decoding="async" />

        <div className="na-wrapper__hd">
          <div className="na-wrapper__hd-left">
            <div className="na-wrapper__eyebrow">
              <span>JUST LANDED</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#e8157e" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h2 className="na-wrapper__title">
              New <span>Arrivals</span>
            </h2>
            <p className="na-wrapper__sub">Fresh designs crafted with love &amp; delivered to your heart</p>
          </div>
          <button onClick={() => navigate("/collections")} className="na-wrapper__viewall">
            View All &nbsp;→
          </button>
        </div>

        <LatestCollection />

      </section>

      {/* ── 9. EPIC BANNER ── */}
      <div className="nlp-banner">
        <img src={epic_banner} alt="Epic Moments Banner" loading="lazy" decoding="async" />
      </div>

      {/* ── 10. DESK DECORATIVES ── */}
      <section className="sec-wrapper sec-wrapper--white">

        <img src={assets.left_leaf} alt="" className="sec-wrapper__leaf sec-wrapper__leaf--l" aria-hidden="true" loading="lazy" decoding="async" />

        <div className="sec-wrapper__hd">
          <div className="sec-wrapper__hd-left">
            <div className="sec-wrapper__eyebrow">
              <span>HANDCRAFTED FOR YOU</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#e8157e" aria-hidden="true">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <h2 className="sec-wrapper__title">
              Desk <span>Decoratives</span>
            </h2>
            <p className="sec-wrapper__sub">Personalized pieces that make your workspace feel like home</p>
          </div>
          <button onClick={() => navigate("/collections")} className="sec-wrapper__viewall">
            View All &nbsp;→
          </button>
        </div>

        <DeskDecoratives />

      </section>

      {/* ── 11. WALL DECORATIVES ── */}
      <section className="sec-wrapper sec-wrapper--pink">

        <img src={assets.right_leaf} alt="" className="sec-wrapper__leaf sec-wrapper__leaf--r" aria-hidden="true" loading="lazy" decoding="async" />

        <div className="sec-wrapper__hd">
          <div className="sec-wrapper__hd-left">
            <div className="sec-wrapper__eyebrow">
              <span>ELEVATE YOUR SPACE</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#e8157e" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <h2 className="sec-wrapper__title">
              Wall <span>Decoratives</span>
            </h2>
            <p className="sec-wrapper__sub">Turn your blank walls into a gallery of memories</p>
          </div>
          <button onClick={() => navigate("/collections")} className="sec-wrapper__viewall">
            View All &nbsp;→
          </button>
        </div>

        <WallDecoratives />

      </section>

      {/* ── 12. PHOTOGRAPHY & ALBUM DESIGN ── */}
      <section className="pa-section">
        {/* soft glow accents */}
        <span className="pa-section__glow pa-section__glow--l" aria-hidden="true" />
        <span className="pa-section__glow pa-section__glow--r" aria-hidden="true" />

        {/* header */}
        <div className="pa-hd">
          <div className="pa-hd__eyebrow">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e8157e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
            </svg>
            <span>CAPTURE • DESIGN • CHERISH</span>
          </div>
          <h2 className="pa-hd__title">
            Photography &amp; <span>Album Design</span>
          </h2>
          <p className="pa-hd__sub">
            From candid moments to timeless keepsakes — professional shoots and
            handcrafted albums that preserve your memories forever.
          </p>
        </div>

        {/* feature cards */}
        <div className="pa-grid">
          {/* Big featured card — Wedding */}
          <div className="pa-card pa-card--feature" onClick={() => navigate("/collections")}>
            <img src={wedding_album} alt="Wedding Photography & Albums" loading="lazy" />
            <div className="pa-card__body">
              <span className="pa-card__tag">Signature</span>
              <h3 className="pa-card__title">Wedding Photography &amp; Albums</h3>
              <p className="pa-card__text">
                Cinematic candid shoots &amp; luxury handmade wedding albums that tell your love story.
              </p>
              <span className="pa-card__cta">Explore Collection →</span>
            </div>
          </div>

          {/* Right column — stacked cards */}
          <div className="pa-col">
            <div className="pa-card pa-card--sm" onClick={() => navigate("/collections")}>
              <img src={birthday_album} alt="Birthday & Baby Albums" loading="lazy" />
              <div className="pa-card__body">
                <h3 className="pa-card__title pa-card__title--sm">Birthday &amp; Baby Albums</h3>
                <span className="pa-card__cta">View →</span>
              </div>
            </div>

            <div className="pa-services">
              <div className="pa-service">
                <span className="pa-service__ic">📸</span>
                <div>
                  <strong>Pre-Wedding Shoots</strong>
                  <span>Outdoor &amp; themed sessions</span>
                </div>
              </div>
              <div className="pa-service">
                <span className="pa-service__ic">📖</span>
                <div>
                  <strong>Custom Album Design</strong>
                  <span>Premium prints &amp; binding</span>
                </div>
              </div>
              <div className="pa-service">
                <span className="pa-service__ic">🎞️</span>
                <div>
                  <strong>Event Coverage</strong>
                  <span>Photo &amp; cinematic video</span>
                </div>
              </div>
              <div className="pa-service">
                <span className="pa-service__ic">🖼️</span>
                <div>
                  <strong>Framed Memories</strong>
                  <span>Wall frames &amp; canvas prints</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA row */}
        <div className="pa-cta-row">
          <div className="pa-cta-row__text">
            <strong>Ready to capture your special moments?</strong>
            <span>Book a photography session or design your dream album with us.</span>
          </div>
          <button className="pa-cta-row__btn" onClick={() => navigate("/contact")}>
            Book a Session
          </button>
        </div>
      </section>

      {/* ── 13. CAR DECORATIVES ── */}
      <section className="sec-wrapper sec-wrapper--pink">

        <img src={assets.right_leaf} alt="" className="sec-wrapper__leaf sec-wrapper__leaf--r" aria-hidden="true" loading="lazy" decoding="async" />

        <div className="sec-wrapper__hd">
          <div className="sec-wrapper__hd-left">
            <div className="sec-wrapper__eyebrow">
              <span>RIDE IN STYLE</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#e8157e" aria-hidden="true">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/>
                <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
              </svg>
            </div>
            <h2 className="sec-wrapper__title">
              Car <span>Decoratives</span>
            </h2>
            <p className="sec-wrapper__sub">Make every drive special with personalized car décor</p>
          </div>
          <button onClick={() => navigate("/collections")} className="sec-wrapper__viewall">
            View All &nbsp;→
          </button>
        </div>

        <CarDecoratives />

      </section>

      {/* ── 14. BUSINESS NEEDS ── */}
      <section className="sec-wrapper sec-wrapper--white">

        <img src={assets.left_leaf} alt="" className="sec-wrapper__leaf sec-wrapper__leaf--l" aria-hidden="true" loading="lazy" decoding="async" />

        <div className="sec-wrapper__hd">
          <div className="sec-wrapper__hd-left">
            <div className="sec-wrapper__eyebrow">
              <span>CORPORATE GIFTING</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#e8157e" aria-hidden="true">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
            </div>
            <h2 className="sec-wrapper__title">
              Business <span>Needs</span>
            </h2>
            <p className="sec-wrapper__sub">Premium branded gifts that leave a lasting impression</p>
          </div>
          <button onClick={() => navigate("/collections")} className="sec-wrapper__viewall">
            View All &nbsp;→
          </button>
        </div>

        <BusinessNeeds />

      </section>

      {/* ── 15 ── */}
    <div className="onebar-container">
  <img src={assets.onebar} alt="Stats Banner" className="onebar-img" loading="lazy" decoding="async" />
</div>

      {/* ── 16. CUSTOMER REVIEWS ── */}
      <section className="sec-wrapper sec-wrapper--pink">
        <img src={assets.left_leaf} alt="" className="sec-wrapper__leaf sec-wrapper__leaf--l" aria-hidden="true" loading="lazy" decoding="async" />

        <div className="sec-wrapper__hd">
          <div className="sec-wrapper__hd-left">
            <div className="sec-wrapper__eyebrow">
              <span>LOVED BY 20,000+ CUSTOMERS</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#e8157e" aria-hidden="true">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h2 className="sec-wrapper__title">
              What Our <span>Customers Say</span>
            </h2>
            <p className="sec-wrapper__sub">Real stories from customers who gifted a little happiness with us</p>
          </div>
          <button onClick={() => navigate("/reviews")} className="sec-wrapper__viewall">
            View All &nbsp;→
          </button>
        </div>

        <GoogleReviews />
      </section>

    

    </div>
  );
};

export default NewLandingPage;
   