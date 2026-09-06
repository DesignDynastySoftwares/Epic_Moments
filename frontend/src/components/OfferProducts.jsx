import React, { useContext, useEffect, useRef, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import OfferProductsItem from "./OfferProductsItem";
import { Helmet } from "react-helmet-async";
import "./offerProducts.css";

const OfferProducts = () => {
  const { offerProducts } = useContext(ShopContext);
  const [latestOffers, setLatestOffers] = useState([]);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (Array.isArray(offerProducts) && offerProducts.length > 0) {
      setLatestOffers(offerProducts.slice(0, 10));
    }
  }, [offerProducts]);

  const scrollRight = () => {
    if (sliderRef.current) sliderRef.current.scrollBy({ left: 280, behavior: "smooth" });
  };

  const scrollLeft = () => {
    if (sliderRef.current) sliderRef.current.scrollBy({ left: -280, behavior: "smooth" });
  };

  return (
    <div className="op-section">
      <Helmet>
        <title>Combo Offers - Epic Moments</title>
        <meta name="description" content="Grab the best combo deals on personalized gifts at Epic Moments." />
      </Helmet>

      <div className="op-slider-wrap">
        {/* Left arrow */}
        <button className="op-arrow op-arrow--left" onClick={scrollLeft} aria-label="Scroll left">
          &#8249;
        </button>

        {/* Scrollable track */}
        <div className="op-track" ref={sliderRef}>
          {latestOffers.length === 0 ? (
            <p className="op-empty">No combo offers available.</p>
          ) : (
            latestOffers.map((item) => {
              const disc = item.originalPrice && item.offerPrice
                ? Math.round(((item.originalPrice - item.offerPrice) / item.originalPrice) * 100)
                : null;
              return (
                <div key={item._id} className="op-track__item">
                  <OfferProductsItem
                    id={item._id}
                    name={item.name}
                    media={item.media?.url}
                    category={item.category}
                    originalPrice={item.originalPrice}
                    offerPrice={item.offerPrice}
                    discount={disc}
                    isBestseller={item.isBestseller}
                    rating={item.rating}
                    tagline={item.tagline}
                    itemData={item}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Right arrow */}
        <button className="op-arrow op-arrow--right" onClick={scrollRight} aria-label="Scroll right">
          &#8250;
        </button>
      </div>
    </div>
  );
};

export default OfferProducts;
