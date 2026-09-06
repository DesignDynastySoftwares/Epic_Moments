import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import CarDecorativesItem from "./CarDecorativesItem";
import { Helmet } from "react-helmet-async";
import "./deskDecoratives.css";

const CarDecoratives = () => {
  const { carDecoratives } = useContext(ShopContext);
  const [latestCarDecor, setLatestCarDecor] = useState([]);

  useEffect(() => {
    if (Array.isArray(carDecoratives) && carDecoratives.length > 0) {
      setLatestCarDecor(carDecoratives.slice(0, 6));
    }
  }, [carDecoratives]);

  return (
    <section className="decor-section">
      <Helmet>
        <title>Car Decoratives - Epic Moments</title>
        <meta name="description" content="Best Car Hanging Frames, Car Dashboard Gifts, Car Interior Décor items at Epic Moments." />
      </Helmet>
      <div className="decor-main">
        {latestCarDecor.length === 0 ? (
          <p className="decor-empty">No car decoratives available.</p>
        ) : (
          <div className="decor-grid">
            {latestCarDecor.map((item) => (
              <div key={item._id} className="decor-grid__item">
                <CarDecorativesItem
                  id={item._id}
                  name={item.name}
                  media={item.media?.url}
                  category={item.category}
                  originalPrice={item.originalPrice}
                  offerPrice={item.offerPrice}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CarDecoratives;
