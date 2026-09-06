import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import CatagereItem from "./ProductCatagere";
import { Helmet } from "react-helmet-async";
import "./MainPage.css";

const CatagereCards = () => {
  const { catagere } = useContext(ShopContext);
  const [latestCatagere, setLatestCatagere] = useState([]);

  useEffect(() => {
    if (Array.isArray(catagere) && catagere.length > 0) {
      setLatestCatagere(catagere.slice(0, 10));
    }
  }, [catagere]);

  // Dynamic keywords from category names
  const keywords = latestCatagere.map((cat) => cat.name).join(", ");

  return (
    <section className="Catagery_slide">
      {/* SEO META TAGS */}
      <Helmet>
        <title>Shop by Categories - Epic Moments</title>
        <meta
          name="description"
          content="Browse our premium personalized gift categories including LED lamps, custom photo frames, sublimation pillows, and more."
        />
        <meta
          name="keywords"
          content={`custom gifts, photo gifts, personalized items, ${keywords}`}
        />
      </Helmet>

      <h2 className="section-title">Shop by Categories</h2>

      {latestCatagere.length === 0 ? (
        <p className="no-data">No categories available.</p>
      ) : (
        <div className="Gift_catagery">
          {latestCatagere.map((item) => (
            <CatagereItem
              key={item._id}
              id={item._id}
              image={item.image}
              name={item.name}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CatagereCards;
