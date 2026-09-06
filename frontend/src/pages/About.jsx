import React, { useEffect, useState } from "react";
import "./About.css";
import { motion } from "framer-motion";
import {
  FaMagic, FaCrown, FaClock, FaSmile, FaShieldAlt,
  FaPaintBrush, FaGift, FaHandshake, FaCamera, FaHeart,
  FaArrowRight,
} from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { assets } from "../assets/assets";

const About = () => {
  const [keywords, setKeywords] = useState([]);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/keywords`);
        if (res.data.success) setKeywords(res.data.keywords);
      } catch (err) {
        console.error("Keyword fetch failed", err);
      }
    };
    fetchKeywords();
  }, [backendUrl]);

  const stats = [
    { num: "20,000+", label: "Happy Customers" },
    { num: "25,000+", label: "Gifts Delivered" },
    { num: "4.9★", label: "Average Rating" },
    { num: "8+", label: "Years of Trust" },
  ];

  const features = [
    { icon: <FaMagic />, title: "Creative Designs", text: "We blend emotion and artistry to craft magical gifts that leave a lasting impression." },
    { icon: <FaCrown />, title: "Premium Quality", text: "Every product is built with top-notch materials and meticulous attention to detail." },
    { icon: <FaClock />, title: "Timely Delivery", text: "Fast, reliable shipping to make every celebration perfect and hassle-free." },
    { icon: <FaSmile />, title: "Customer First", text: "Your happiness is our priority — we promise to always deliver our very best." },
    { icon: <FaCamera />, title: "Photography & Albums", text: "Professional shoots and handcrafted albums that preserve your memories forever." },
    { icon: <FaPaintBrush />, title: "Full Customization", text: "Add your photos, names, dates or messages to design something truly one-of-a-kind." },
  ];

  const strip = [
    { icon: <FaShieldAlt />, h: "Top-Grade Materials", p: "Long-lasting quality you can trust" },
    { icon: <FaPaintBrush />, h: "Fully Customizable", p: "Add your personal touch easily" },
    { icon: <FaGift />, h: "Any Occasion", p: "Birthdays, weddings & more" },
    { icon: <FaHandshake />, h: "Partnerships", p: "Grow with Epic Moments" },
  ];

  return (
    <div className="ab">
      <Helmet>
        <title>About | Epic Moments</title>
        <meta name="description" content="Epic Moments offers personalized photo gifts, photography and album design to celebrate life's most special occasions." />
        <meta property="og:title" content="About | Epic Moments" />
        <meta property="og:url" content="https://myepicmoments.com/about" />
      </Helmet>

      {/* ── HERO ── */}
      <section className="ab-hero">
        <span className="ab-hero__glow ab-hero__glow--1" aria-hidden="true" />
        <span className="ab-hero__glow ab-hero__glow--2" aria-hidden="true" />

        <div className="ab-hero__inner">
          <motion.div
            className="ab-hero__text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="ab-hero__eyebrow">
              <FaHeart /> OUR STORY
            </span>
            <h1 className="ab-hero__title">
              Turning Moments Into <span>Timeless Memories</span>
            </h1>
            <p className="ab-hero__tagline">
              Thoughtful gifts. Cherished memories. Crafted just for you.
            </p>
            <div className="ab-hero__btns">
              <button className="ab-hero__btn ab-hero__btn--pink" onClick={() => navigate("/collections")}>
                Explore Collection <FaArrowRight />
              </button>
              <button className="ab-hero__btn ab-hero__btn--ghost" onClick={() => navigate("/contact")}>
                Get in Touch
              </button>
            </div>
          </motion.div>

          <motion.div
            className="ab-hero__media"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <img src={assets.about_giftBox} alt="Epic Moments" />
          </motion.div>
        </div>

        {/* stats bar */}
        <div className="ab-stats">
          {stats.map((s) => (
            <div key={s.label} className="ab-stat">
              <strong>{s.num}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="ab-story">
        <motion.div
          className="ab-story__text"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="ab-eyebrow"><span className="ab-eyebrow__bar" /> ABOUT US</span>
          <h2 className="ab-story__title">
            Gifts That Speak <span>from the Heart</span>
          </h2>
          <p>
            Founded in <strong>2018</strong>, <strong>Epic Moments</strong> is a premium brand
            dedicated to transforming your memories into beautifully personalized gifts —
            handcrafted LED photo lamps, custom frames, sublimation pillows, and waterproof
            photo stickers.
          </p>
          <p>
            Beyond gifting, we're also a <strong>professional photography &amp; album design</strong>
            {" "}studio — wedding shoots, pre-wedding sessions, event coverage, and premium
            handmade albums that preserve your memories forever.
          </p>
          <p>
            Built with <strong>top-grade materials</strong> and a commitment to quality,
            creativity &amp; timely delivery — Epic Moments is your trusted destination for
            meaningful, one-of-a-kind gifts.
          </p>
          <div className="ab-story__quote">
            <FaGift />
            <span>Create. Personalize. Celebrate. <strong>Only with Epic Moments.</strong></span>
          </div>
        </motion.div>

        <motion.div
          className="ab-story__img"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <img src={assets.about_giftBox} alt="Personalized gifts" />
          <div className="ab-story__badge">
            <strong>100%</strong>
            <span>Handcrafted</span>
          </div>
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section className="ab-features">
        <div className="ab-features__head">
          <span className="ab-eyebrow ab-eyebrow--center"><span className="ab-eyebrow__bar" /> WHY CHOOSE US <span className="ab-eyebrow__bar" /></span>
          <h2 className="ab-features__title">What Makes Us <span>Special</span></h2>
        </div>

        <div className="ab-features__grid">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="ab-fcard"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <div className="ab-fcard__icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HIGHLIGHT STRIP ── */}
      <section className="ab-strip">
        <div className="ab-strip__inner">
          {strip.map((s) => (
            <div key={s.h} className="ab-strip__item">
              <div className="ab-strip__icon">{s.icon}</div>
              <div>
                <h4>{s.h}</h4>
                <p>{s.p}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="ab-cta">
        <h2>Ready to create something <span>unforgettable?</span></h2>
        <p>Browse our collection or reach out to design your perfect personalized gift.</p>
        <div className="ab-cta__btns">
          <button className="ab-cta__btn ab-cta__btn--pink" onClick={() => navigate("/collections")}>Shop Now</button>
          <button className="ab-cta__btn ab-cta__btn--ghost" onClick={() => navigate("/contact")}>Contact Us</button>
        </div>
      </section>

      {/* ── KEYWORD LINKS ── */}
      {keywords.length > 0 && (
        <div className="ab-keywords">
          <h3>Explore More Topics</h3>
          <ul>
            {keywords.map((item, index) => (
              <li key={index}>
                <Link to={`/keyword/${item.slug}`} className="ab-keyword-link">{item.keyword}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default About;
