import React, { useRef, useState } from "react";
import axios from "axios";
import "./Contact.css";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock3, Sparkles } from "lucide-react";
import { FaInstagram, FaFacebook } from "react-icons/fa";
import { Helmet } from "react-helmet-async";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Contact = () => {
  const formRef = useRef(null);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus("Sending...");

    const form = formRef.current;
    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setStatus("❌ Please fill name, email and message");
      setSending(false);
      return;
    }

    try {
      const res = await axios.post(`${backendUrl}/api/enquiries`, payload);
      if (res.data?.success !== false) {
        setStatus("✅ Message sent successfully!");
        form.reset();
      } else {
        setStatus("❌ " + (res.data.message || "Failed to send message"));
      }
    } catch (error) {
      console.error("Enquiry send error:", error);
      setStatus("❌ Failed to send message. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="contact-page">
      <Helmet>
        <title>Contact | Epic Moments</title>
        <meta
          name="description"
          content="Contact Epic Moments for personalized gifts and custom photo products."
        />
      </Helmet>

      <motion.div
        className="contact-hero"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="contact-hero__copy">
          <p className="contact-eyebrow">Contact Us</p>
          <h1>
            Let’s make your next gift <span className="highlight">truly unforgettable</span>
          </h1>
          <p>
            Need help with a custom order, product selection, or delivery plan? We are happy to assist you every step of the way.
          </p>
        </div>
      </motion.div>

      <div className="contact-grid">
        <motion.div
          className="contact-panel contact-details"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Reach out anytime</h2>
          <div className="contact-item">
            <FaInstagram />
            <a href="https://www.instagram.com/epicmoments007" target="_blank" rel="noreferrer">
              @epicmoments007
            </a>
          </div>
          <div className="contact-item">
            <FaFacebook />
            <a href="https://www.facebook.com/share/1BuBjAUYk6/" target="_blank" rel="noreferrer">
              Epic Moments
            </a>
          </div>
          <div className="contact-item">
            <Mail />
            <a href="mailto:epicmoments27@gmail.com">epicmoments27@gmail.com</a>
          </div>
          <div className="contact-item">
            <Phone />
            <a href="tel:+917989466939">+91 7989466939</a>
          </div>
          <div className="contact-item">
            <MapPin />
            <span>Gullapalli, Andhra Pradesh – 522309</span>
          </div>
          <div className="contact-item">
            <Clock3 />
            <span>Open for custom orders and support</span>
          </div>
        </motion.div>

        <motion.div
          className="contact-panel contact-map"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <iframe
            title="Epic Moments Location"
            src="https://www.google.com/maps?q=Gullapalli,Andhra%20Pradesh&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>
      </div>

      <div className="contact-grid contact-grid--stacked">
        <motion.div
          className="contact-panel contact-form-panel"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2>Send a message</h2>
          <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Your Name" required />
            <input type="email" name="email" placeholder="Your Email" required />
            <input type="tel" name="phone" placeholder="Contact Number" />
            <input type="text" name="subject" placeholder="Subject" />
            <textarea name="message" rows="5" placeholder="Your Message" required />
            <button type="submit" disabled={sending}>
              {sending ? "Sending..." : "Submit Request"}
            </button>
            {status && <p className="form-status">{status}</p>}
          </form>
        </motion.div>

        <motion.div
          className="contact-panel contact-note"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="contact-note__icon">
            <Sparkles />
          </div>
          <h3>What happens next?</h3>
          <ul>
            <li>We review your request within hours.</li>
            <li>We recommend the best custom gift options.</li>
            <li>We help make your order memorable and easy.</li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
