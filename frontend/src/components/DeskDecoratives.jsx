import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import DeskDecorativesItem from "./DeskDecorativesItem";
import { Helmet } from "react-helmet-async";
import "./deskDecoratives.css";

const DeskDecoratives = () => {
  const { deskDecoratives } = useContext(ShopContext);
  const [latestDeskDecor, setLatestDeskDecor] = useState([]);

  useEffect(() => {
    if (Array.isArray(deskDecoratives) && deskDecoratives.length > 0) {
      setLatestDeskDecor(deskDecoratives.slice(0, 6));
    }
  }, [deskDecoratives]);

  return (
    <section className="decor-section">
      <Helmet>
        <title>Desk Decoratives - Epic Moments</title>
        <meta name="description" content="Beautiful desk decoratives including name plates, acrylic frames, desk gifts and more." />
      </Helmet>
      <div className="decor-main">
        {latestDeskDecor.length === 0 ? (
          <p className="decor-empty">No desk decoratives available.</p>
        ) : (
          <div className="decor-grid">
            {latestDeskDecor.map((item) => (
              <div key={item._id} className="decor-grid__item">
                <DeskDecorativesItem
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

export default DeskDecoratives;
