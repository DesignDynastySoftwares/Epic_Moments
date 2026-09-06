import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import WallDecorativesItem from "./WallDecorativesItem";
import { Helmet } from "react-helmet-async";
import "./deskDecoratives.css";

const WallDecoratives = () => {
  const { wallDecoratives } = useContext(ShopContext);
  const [latestWallDecor, setLatestWallDecor] = useState([]);

  useEffect(() => {
    if (Array.isArray(wallDecoratives) && wallDecoratives.length > 0) {
      setLatestWallDecor(wallDecoratives.slice(0, 6));
    }
  }, [wallDecoratives]);

  return (
    <section className="decor-section">
      <Helmet>
        <title>Wall Decoratives - Epic Moments</title>
        <meta name="description" content="Premium wall decoratives including acrylic wall frames, name boards, and wall gifts." />
      </Helmet>
      <div className="decor-main">
        {latestWallDecor.length === 0 ? (
          <p className="decor-empty">No wall decoratives available.</p>
        ) : (
          <div className="decor-grid">
            {latestWallDecor.map((item) => (
              <div key={item._id} className="decor-grid__item">
                <WallDecorativesItem
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

export default WallDecoratives;
