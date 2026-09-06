import React, { useContext, useEffect, useRef, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import PopularProductsItem from "./PopularProductsItem";
import { Helmet } from "react-helmet-async";
import "./popularProducts.css";

const PopularProducts = () => {
  const { popularProducts } = useContext(ShopContext);
  const [latestPopular, setLatestPopular] = useState([]);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (Array.isArray(popularProducts)) {
      setLatestPopular(popularProducts.slice(0, 10));
    }
  }, [popularProducts]);

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  return (
    <section className="pp-section">
      <Helmet>
        <title>Popular Products - Epic Moments</title>
        <meta name="description" content="Explore our most loved and trending personalized gift products." />
      </Helmet>

      <div className="pp-slider-wrap">
        {/* Left arrow */}
        <button className="pp-arrow pp-arrow--left" onClick={scrollLeft} aria-label="Scroll left">
          &#8249;
        </button>

        {/* Scrollable track */}
        <div className="pp-track" ref={sliderRef}>
          {latestPopular.length === 0 ? (
            <p className="pp-empty">No popular products available.</p>
          ) : (
            latestPopular.map((item) => (
              <div key={item._id} className="pp-track__item">
                <PopularProductsItem
                  id={item._id}
                  image={item.image}
                  name={item.name}
                  category={item.category}
                  rating={item.rating || 4.8}
                  ratingCount={item.ratingCount || 0}
                  purchases={item.purchases || 0}
                  badge={item.isBestseller ? "BEST\nSELLER" : null}
                />
              </div>
            ))
          )}
        </div>

        {/* Right arrow */}
        <button className="pp-arrow pp-arrow--right" onClick={scrollRight} aria-label="Scroll right">
          &#8250;
        </button>
      </div>
    </section>
  );
};

export default PopularProducts;
