import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import BusinessNeedsItem from "./BusinessNeedsItem";
import { Helmet } from "react-helmet-async";
import "./deskDecoratives.css";

const BusinessNeeds = () => {
  const { businessNeeds } = useContext(ShopContext);
  const [latestNeeds, setLatestNeeds] = useState([]);

  useEffect(() => {
    if (Array.isArray(businessNeeds) && businessNeeds.length > 0) {
      setLatestNeeds(businessNeeds.slice(0, 6));
    }
  }, [businessNeeds]);

  return (
    <section className="decor-section">
      <Helmet>
        <title>Business Needs - Epic Moments</title>
        <meta name="description" content="Business Solutions, branding, printing services, and corporate needs." />
      </Helmet>
      <div className="decor-main">
        {latestNeeds.length === 0 ? (
          <p className="decor-empty">No business needs available.</p>
        ) : (
          <div className="decor-grid">
            {latestNeeds.map((item) => (
              <div key={item._id} className="decor-grid__item">
                <BusinessNeedsItem
                  id={item._id}
                  title={item.name || item.title}
                  media={item.media?.url}
                  priority={item.startingPrice || item.priority}
                  category={item.category}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BusinessNeeds;
