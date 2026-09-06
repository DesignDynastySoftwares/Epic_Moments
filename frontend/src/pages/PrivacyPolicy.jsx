import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FaShieldAlt } from 'react-icons/fa';
import './PrivacyPolicy.css';

const sections = [
  {
    title: "Collection of Personal Information",
    body: <p>We collect personal details during registration or order placement:</p>,
    list: [
      "Name, phone number, email, and delivery address",
      "Uploaded photos and custom messages",
      "Payment information (handled by Razorpay or Stripe)",
    ],
  },
  {
    title: "Updating Your Personal Information",
    body: <p>You may update most of your personal data in the "My Profile" section. For critical changes or data deletion, contact us at <strong>epicmoments27@gmail.com</strong>.</p>,
  },
  {
    title: "How We Use Your Information",
    list: [
      "To process and deliver your customized orders",
      "To communicate order status and respond to queries",
      "To improve our products, website, and customer experience",
      "To send you service or promotional updates (you may opt out)",
      "To comply with legal obligations",
    ],
  },
  {
    title: "Uploaded Photos",
    body: <p>Your uploaded photos are used only to create your ordered products. We do not share, promote, or reuse your images. They are deleted after order fulfillment.</p>,
  },
  {
    title: "Data Security",
    body: <p>We use industry-standard encryption and secure servers to protect your data. However, no method of internet transmission is 100% secure. Please use strong passwords and contact us if you notice suspicious activity.</p>,
  },
  {
    title: "Sharing with Third-Party Services",
    body: <p>We only share necessary data with trusted partners like payment processors and logistics providers. We never sell or rent your data to marketers.</p>,
  },
  {
    title: "Data Retention",
    body: <p>Your data is retained as long as needed for services or legal reasons. You may request deletion at any time by emailing us.</p>,
  },
  {
    title: "Email Preferences",
    body: <p>You may unsubscribe from promotional emails at any time. However, we'll still send essential communications like order confirmations.</p>,
  },
  {
    title: "Legal Disclosure",
    body: <p>We may disclose personal data if required by law or to protect our business, customers, or others from harm or fraud.</p>,
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="pp">
      <Helmet>
        <title>Privacy Policy | Epic Moments</title>
      </Helmet>

      {/* ── Hero ── */}
      <div className="pp-hero">
        <span className="pp-hero__glow pp-hero__glow--1" aria-hidden="true" />
        <span className="pp-hero__glow pp-hero__glow--2" aria-hidden="true" />
        <div className="pp-hero__inner">
          <div className="pp-hero__icon"><FaShieldAlt /></div>
          <h1>Privacy Policy</h1>
          <p>
            How Epic Moments collects, uses, and protects your personal information.
            By using our website, you agree to the terms outlined here.
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
            {s.list && (
              <ul>
                {s.list.map((item, j) => <li key={j}>{item}</li>)}
              </ul>
            )}
          </div>
        ))}

      </div>
    </div>
  );
};

export default PrivacyPolicy;
