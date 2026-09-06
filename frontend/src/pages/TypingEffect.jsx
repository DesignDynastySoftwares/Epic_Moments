import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Typed from "typed.js";
import "./TypingEffect.css";

const TypingEffect = () => {
  const typedRef = useRef(null);
  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/category`);
        if (res.data.success) {
          setCategoryList(res.data.categories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categoryList.length === 0) return;

    const typed = new Typed(typedRef.current, {
      strings: categoryList.map((cat) => cat.name),
      typeSpeed: 80,
      backSpeed: 30,
      backDelay: 1000,
      loop: true,
      showCursor: true,
      cursorChar: "|",
    });

    return () => {
      typed.destroy();
    };
  }, [categoryList]);

  return (
    <section className="Typing_effect">
      <div className="Typing_effect_container">
        <div className="text_center cont_box">
          <h5>We Print Your Photo on</h5>
          <span className="wrap red_color">
            <span ref={typedRef} />
          </span>
        </div>
      </div>
    </section>
  );
};

export default TypingEffect;
