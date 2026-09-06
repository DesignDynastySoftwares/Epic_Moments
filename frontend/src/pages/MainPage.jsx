import React, { useState } from 'react';
import './MainPage.css';
import Slider from "./Slider.jsx";
import { assets } from "../assets/assets.js";
import LatestCollection from "../components/LatestCollection.jsx";
import ParallaxBanner from './ParallaxBanner.jsx';
import CatagereCards from './CatagereCards.jsx';
import ProductSnicks from "./ProductSnicks.jsx";
import BestSeller from "../components/BestSeller.jsx";
import FAQ_Section from './FAQ_Section.jsx';
import Slider_Comments from "./Slider_Comments.jsx";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  FaShieldAlt, FaTruck, FaLock, FaUndo,
  FaCheckCircle, FaUsers, FaStar, FaBoxOpen,
  FaClipboardList, FaEnvelope, FaCheckSquare,
} from "react-icons/fa";

function MainPage() {
  const [email, setEmail] = useState('');

  return (
    <div className="main-page">
      <Helmet>
        <title>Epic Moments | Personalized Gifts & Photography</title>
        <meta name="description" content="Discover custom gifts, LED photo lamps, baby & wedding photography, and more. Epic Moments brings creativity to every celebration." />
        <meta name="keywords" content="custom gifts, photo lamps, baby photography, wedding photography, epic moments, personalized gifts India" />
        <meta name="author" content="Epic Moments" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Epic Moments | Personalized Gifts & Photography" />
        <meta property="og:description" content="Premium custom gifts and photography services. Shop personalized photo lamps, cushions, frames & more at Epic Moments." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://myepicmoments.com" />
        <meta property="og:image" content="https://myepicmoments.com/assets/epicmoments-preview.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Epic Moments | Personalized Gifts & Photography" />
        <meta name="twitter:description" content="Celebrate moments with our custom-made gifts and photography services." />
        <meta name="twitter:image" content="https://myepicmoments.com/assets/epicmoments-preview.jpg" />
        <script type="application/ld+json">{`{
          "@context": "https://schema.org",
          "@type": "Store",
          "name": "Epic Moments",
          "url": "https://myepicmoments.com",
          "logo": "https://myepicmoments.com/assets/logo_epicmoments.png",
          "description": "Epic Moments specializes in customized gifts like photo lamps, frames, and cushions.",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Near Mudu Gullu, Opp. 3 Temples, Main Road",
            "addressLocality": "Gullapalli",
            "addressRegion": "Andhra Pradesh",
            "postalCode": "522309",
            "addressCountry": "IN"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91 7989466939",
            "contactType": "Customer Service"
          }
        }`}</script>
      </Helmet>

      {/* 1 ── ANNOUNCEMENT BAR ── */}
      <div className="mp-announce-bar">
        <span>⭐ Loved by 10,000+ Customers</span>
        <span className="mp-announce-bar__div">|</span>
        <span>✦ Premium Quality</span>
        <span className="mp-announce-bar__div">|</span>
        <span>🚚 Fast Delivery</span>
        <span className="mp-announce-bar__div">|</span>
        <span>✅ 100% Satisfaction</span>
      </div>

      {/* 2 ── HERO BANNER (Turn Your Memories) ── */}
      <section className="mp-hero-banner">
        <img src={assets.left_leaf}  alt="" className="mp-hero-banner__leaf mp-hero-banner__leaf--l" aria-hidden="true" />
        <img src={assets.right_leaf} alt="" className="mp-hero-banner__leaf mp-hero-banner__leaf--r" aria-hidden="true" />
        
        <div className="mp-hero-banner__content">
          <div className="mp-hero-banner__text">
            <p className="mp-hero-banner__eyebrow">PERSONALIZED WITH LOVE</p>
            <h1 className="mp-hero-banner__title">
              Turn Your Memories<br />
              Into <span>Something Special</span>
            </h1>
            <p className="mp-hero-banner__sub">
              Personalized gifts that make every occasion<br />
              truly unforgettable.
            </p>
            <div className="mp-hero-banner__actions">
              <Link to="/collection" className="mp-btn mp-btn--pink">Shop Now</Link>
              <Link to="/collection" className="mp-btn mp-btn--outline-white">Explore Collections</Link>
            </div>
          </div>
          
          <div className="mp-hero-banner__image">
            <img src={assets.Special_2} alt="Epic Moments Personalized Gift" />
          </div>
        </div>
      </section>

      {/* 3 ── TRUST BADGES ── */}
     

      {/* 4 ── SHOP BY CATEGORIES ── */}
      <section className="mp-section mp-section--white screen-6" data-aos="fade-up">
        <div className="mp-section__hd">
          <h2>Shop by Categories</h2>
          <Link to="/collection" className="mp-section__viewall">View All →</Link>
        </div>
        <CatagereCards />
      </section>

      {/* 5 ── POPULAR PRODUCTS ── */}
      <section className="mp-section mp-section--softpink" data-aos="fade-up">
        <div className="mp-section__hd">
          <h2>Popular Products</h2>
          <Link to="/collection" className="mp-section__viewall">View All →</Link>
        </div>
        <ProductSnicks />
      </section>

      {/* 6 ── BEST SELLERS / COMBO OFFERS ── */}
      <section className="mp-section mp-section--white bg-pattern" data-aos="fade-up">
        <div className="mp-section__hd">
          <h2>Combo Offers</h2>
          <Link to="/collection" className="mp-section__viewall">View All →</Link>
        </div>
        <BestSeller />
      </section>

      {/* 7 ── LATEST COLLECTIONS ── */}
      <section className="mp-section mp-section--softpink" data-aos="fade-up">
        <div className="mp-section__hd">
          <h2>Latest Collections</h2>
          <Link to="/collection" className="mp-section__viewall">View All →</Link>
        </div>
        <div className="Latest_div">
          <LatestCollection />
        </div>
      </section>

      {/* 8 ── PARALLAX / FREE DELIVERY BANNER ── */}
      <ParallaxBanner />

      {/* 9 ── CTA BANNER ── */}
      <div className="mp-cta-banner">
        <img src={assets.left_leaf}  alt="" className="mp-cta-banner__leaf mp-cta-banner__leaf--l" aria-hidden="true" />
        <img src={assets.right_leaf} alt="" className="mp-cta-banner__leaf mp-cta-banner__leaf--r" aria-hidden="true" />
        <div className="mp-cta-banner__copy">
          <p className="mp-cta-banner__eyebrow">Personalized with Love</p>
          <h2 className="mp-cta-banner__heading">
            Turn Your Memories<br />
            Into <span>Something Special</span>
          </h2>
          <p className="mp-cta-banner__sub">
            Personalized gifts that make every occasion truly unforgettable.
          </p>
          <div className="mp-cta-banner__actions">
            <Link to="/collection" className="mp-btn mp-btn--pink">Shop Now</Link>
            <Link to="/collection" className="mp-btn mp-btn--outline">Explore Collection</Link>
          </div>
          <div className="mp-cta-banner__badges">
            <span><FaCheckCircle /> Premium Quality</span>
            <span><FaTruck /> Fast Delivery</span>
            <span><FaLock /> 100% Secure</span>
          </div>
        </div>
        <div className="mp-cta-banner__image">
          <img src={assets.Special_2} alt="Special personalized gifts at Epic Moments" />
        </div>
      </div>

      {/* 10 ── WHAT CUSTOMERS SAY ── */}
      <section className="mp-section mp-section--white" data-aos="fade-up">
        <div className="mp-section__hd">
          <h2>What Our Customers Say</h2>
        </div>
        <div className="Slide_comments_main">
          <div className="Comments_box">
            <Slider_Comments />
          </div>
        </div>
      </section>

      {/* 11 ── BOTTOM TRUST ROW ── */}
      <div className="mp-trust mp-trust--bottom">
        <div className="mp-trust__inner">
          {[
            { icon: <FaUndo />,      title: "Easy Returns",        sub: "7 days return policy" },
            { icon: <FaLock />,      title: "Secure Payments",     sub: "100% secure & encrypted" },
            { icon: <FaTruck />,     title: "On-time Delivery",    sub: "Free & flexible shipping" },
            { icon: <FaShieldAlt />, title: "Best Quality",        sub: "100% authentic materials used" },
          ].map(({ icon, title, sub }) => (
            <div className="mp-trust__item" key={title}>
              <span className="mp-trust__icon">{icon}</span>
              <div className="mp-trust__text">
                <strong>{title}</strong>
                <span>{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 12 ── OUR VISION + WE ARE HOMEGROWN ── */}
      <section className="mp-vision-row">
        {/* Left — Our Vision */}
        <div className="mp-vision">
          <h3 className="mp-vision__title">OUR VISION</h3>
          <p className="mp-vision__body">
            To create meaningful products that help people celebrate life's special moments.
          </p>
          <Link to="/about" className="mp-btn mp-btn--outline mp-btn--sm">Read More</Link>
        </div>

        {/* Centre — We Are Homegrown */}
        <div className="mp-homegrown">
          <h3 className="mp-homegrown__title">WE ARE HOMEGROWN</h3>
          <ul className="mp-homegrown__list">
            {[
              "Proudly made in India",
              "Supporting local artisans",
              "Trusted by thousands",
              "For every emotion & occasion",
            ].map((item) => (
              <li key={item}><FaCheckSquare className="mp-homegrown__icon" />{item}</li>
            ))}
          </ul>
        </div>

        {/* Right — gift image + stats */}
        <div className="mp-homegrown__right">
          <img src={assets.Special_2} alt="Epic Moments gift" className="mp-homegrown__img" />
          <div className="mp-homegrown__stats">
            <div className="mp-mini-stat"><span className="mp-mini-stat__num">24K+</span><span>Happy Customers</span></div>
            <div className="mp-mini-stat"><span className="mp-mini-stat__num">6264+</span><span>5-Star Reviews</span></div>
            <div className="mp-mini-stat"><span className="mp-mini-stat__num">3000+</span><span>Products</span></div>
            <div className="mp-mini-stat"><span className="mp-mini-stat__num">30K+</span><span>Orders</span></div>
          </div>
        </div>
      </section>

      {/* 13 ── FAQ ── */}
      <section className="mp-section mp-section--softpink" data-aos="fade-up">
        <div className="mp-section__hd">
          <h2>Frequently Asked Questions</h2>
        </div>
        <FAQ_Section />
      </section>

      {/* 14 ── NEWSLETTER STRIP ── */}
      <div className="mp-newsletter">
        <div className="mp-newsletter__inner">
          <div className="mp-newsletter__copy">
            <FaEnvelope className="mp-newsletter__icon" />
            <div>
              <h3>Stay Updated with Epic Moments</h3>
              <p>Get exclusive offers, new arrivals &amp; exciting discounts!</p>
            </div>
          </div>
          <form className="mp-newsletter__form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mp-newsletter__input"
            />
            <button type="submit" className="mp-newsletter__btn">Subscribe</button>
          </form>
        </div>
      </div>

    </div>
  );
}

export default MainPage;
