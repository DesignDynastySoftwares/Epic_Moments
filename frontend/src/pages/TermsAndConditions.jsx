import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FaFileContract } from 'react-icons/fa';
import './PrivacyPolicy.css';

const sections = [
  {
    title: "Order Process",
    body: <p>Orders are confirmed once payment is completed. Since our products are customized, orders cannot be changed or canceled once confirmed.</p>,
  },
  {
    title: "Product Customization",
    body: <p>We rely on the photos, text, and instructions you provide. Please ensure they are accurate, appropriate, and of good quality.</p>,
  },
  {
    title: "Delivery",
    body: <p>We strive to deliver orders on time. However, delays due to courier partners, natural calamities, or local restrictions are beyond our control.</p>,
  },
  {
    title: "Return & Refund",
    body: <p>Customized products are non-returnable unless they arrive damaged or incorrect. In such cases, contact us within 48 hours of delivery for resolution.</p>,
  },
  {
    title: "Intellectual Property",
    body: <p>By uploading photos or content, you confirm that you own the rights to use them. We are not responsible for any copyright issues arising from unauthorized uploads.</p>,
  },
  {
    title: "Payment",
    body: <p>All transactions are securely processed via Razorpay or Stripe. We do not store your card or banking details.</p>,
  },
  {
    title: "Changes to Terms",
    body: <p>Epic Moments may update these terms at any time without prior notice. Please check this page regularly for changes.</p>,
  },
];

const TermsAndConditions = () => (
  <div className="pp">
    <Helmet>
      <title>Terms &amp; Conditions | Epic Moments</title>
    </Helmet>

    {/* ── Hero ── */}
    <div className="pp-hero">
      <span className="pp-hero__glow pp-hero__glow--1" aria-hidden="true" />
      <span className="pp-hero__glow pp-hero__glow--2" aria-hidden="true" />
      <div className="pp-hero__inner">
        <div className="pp-hero__icon"><FaFileContract /></div>
        <h1>Terms &amp; Conditions</h1>
        <p>
          Welcome to Epic Moments. By using our website and placing an order,
          you agree to the following terms.
        </p>
        <span className="pp-hero__updated">Last updated: July 2025</span>
      </div>
    </div>

    {/* ── Content ── */}
    <div className="pp-body">
      {sections.map((s, i) => (
        <div key={i} className="pp-card">
          <div className="pp-card__head">
            <span className="pp-card__num">{i + 1}</span>
            <h3>{s.title}</h3>
          </div>
          {s.body}
        </div>
      ))}
    </div>
  </div>
);

export default TermsAndConditions;
