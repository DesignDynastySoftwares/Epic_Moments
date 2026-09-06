import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import "./NewArrivalsPage.css";

const NewArrivalsPage = () => {
  const { products, currency } = useContext(ShopContext);

  const newArrivals = [...products]
    .sort((a, b) => (b.date || 0) - (a.date || 0))
    .slice(0, 20);

  return (
    <div className="arrivals-page">
      <div className="arrivals-page__grid">
        {newArrivals.length === 0 ? (
          <p className="arrivals-page__empty">No new arrivals yet.</p>
        ) : (
          newArrivals.map((item, idx) => {
            const img = item.image?.[0] || item.media?.[0]?.url || null;

            return (
              <Link
                to={`/product/${item._id}`}
                key={item._id}
                className="arrival-card"
                style={{ animationDelay: `${idx * 0.06}s` }}
                onClick={() => window.scrollTo(0, 0)}
              >
                <div className="arrival-card__img-wrap">
                  {img ? (
                    <img src={img} alt={item.name} className="arrival-card__img" />
                  ) : (
                    <div className="arrival-card__no-img">📷</div>
                  )}
                  <div className="arrival-card__overlay">
                    <span>View Product</span>
                  </div>
                </div>
                <div className="arrival-card__info">
                  <h3>{item.name}</h3>
                  <div className="arrival-card__bottom">
                    <span className="arrival-card__price">{currency}{Number(item.price).toLocaleString("en-IN")}</span>
                    <button className="arrival-card__cart" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                      🛒
                    </button>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NewArrivalsPage;
