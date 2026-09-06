import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaMinus } from "react-icons/fa";
import "./Accordion.css";
import { assets } from "../assets/assets.js";

const FAQs = [
  { question: "What is EPIC MOMENTS?", answer: "EPIC MOMENTS is a custom photo gift shop where you can create personalized gifts with your favorite memories." },
  { question: "How long does shipping take?", answer: "Shipping usually takes 5-7 business days, depending on your location." },
  { question: "Can I return a customized product?", answer: "Since all products are custom-made, returns are only accepted if there is a defect." },
  { question: "Do you offer bulk discounts?", answer: "Yes! We offer discounts for bulk orders. Contact us for more details." },
  { question: "Which payment methods do you accept?", answer: "We accept credit/debit cards, PayPal, and UPI payments." },
  { question: "Can I preview my design before ordering?", answer: "Yes, you will see a preview before finalizing your order." },
  { question: "Do you ship internationally?", answer: "Yes, we offer international shipping with different delivery timelines." },
  { question: "What materials do you use for prints?", answer: "We use high-quality canvas, acrylic, and premium paper for prints." },
  { question: "Are there customization options available?", answer: "Yes! You can add text, change colors, and choose frame styles." },
  { question: "How can I contact customer support?", answer: "You can contact us via email or through our live chat support." },
];

const FAQItem = ({ faq, isOpen, onClick }) => (
  <div className="faq-item">
    <motion.div
      className="faq-question"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      <span>{faq.question}</span>
      {isOpen ? <FaMinus className="faq-icon" /> : <FaPlus className="faq-icon" />}
    </motion.div>
    <motion.div
      className="faq-answer"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <p>{faq.answer}</p>
    </motion.div>
  </div>
);

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  // Toggle FAQ item instead of just opening new one
  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
     
      <div className="faq">
        <div  className="faq-background">
        <img src={assets.qustionmarks} alt="FAQ Background"/>
      </div>
<div>
  <div className="faq_title-image">
    <div className="faq_title-image-in">
 <h5 className="faq-title-1">Frequently Asked Questions</h5>
      <div className="faq-background-1">
             <img src={assets.qustionmarks} alt="FAQ Background"/>
    </div>
      
   
      </div>
  </div>
  
 <h5 className="faq-title">Frequently Asked Questions</h5>

     <div className="faq-grid">
        <div className="faq-column">
          {FAQs.slice(0, 5).map((faq, index) => (
            <FAQItem key={index} faq={faq} isOpen={openIndex === index} onClick={() => handleToggle(index)} />
          ))}
        </div>
        <div className="faq-column">
          {FAQs.slice(5, 10).map((faq, index) => (
            <FAQItem key={index + 5} faq={faq} isOpen={openIndex === index + 5} onClick={() => handleToggle(index + 5)} />
          ))}
        </div>
      </div>

</div>
    
      </div>
    </div>
    
  );
};

export default FAQSection;
