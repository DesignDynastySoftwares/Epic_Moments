import React from "react";
import "./ParallaxBanner.css"; // Ensure this CSS file exists
import { assets } from "../assets/assets.js"; 

const ParallaxBanner = () => {
  return (
    <div
      id="parallaxcmsblock"
      className="block parallax"
      style={{ backgroundImage: `url(${assets.Personalised_Gifts_for_Exclusive_Personalities})` }} // ✅ Corrected
    >

<div className="parallax-content">
  <h2 className="banner-heading">Find the Perfect Gift</h2>

  <h3 className="banner-subheading">
    Shop beautiful and special accessories<br />
    made just for your loved ones.
  </h3>

  <div className="banner-btn">
    <a href="/collection" className="shop-now-btn">Shop Now</a>
  </div>
</div>

    </div>
  );
};

export default ParallaxBanner;
