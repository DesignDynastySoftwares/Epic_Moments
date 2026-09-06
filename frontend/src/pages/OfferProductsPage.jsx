import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import "./OfferProductsPage.css";

const OfferProductsPage = () => {
  const { offerProducts, currency } = useContext(ShopContext);

  return (
    <div className="offer-page">
      <div className="offer-page__header">
        <h1>Combo Offers</h1>
        <p>Premium products, perfect combos & amazing savings</p>
      </div>

      <div className="offer-page__grid">
        {offerProducts.length === 0 ? (
          <p className="offer-page__empty">No combo offers available.</p>
        ) : (
          offerProducts.map((item, idx) => {
            const img = item.media?.url || null;
            const discount = item.originalPrice && item.offerPrice
              ? Math.round(((item.originalPrice - item.offerPrice) / item.originalPrice) * 100)
              : null;

            return (
              <Link
                to={`/collections?category=${encodeURIComponent(item.category || "")}`}
                key={item._id}
                className="offer-card"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="offer-card__img-wrap">
                  {img ? (
                    <img src={img} alt={item.name} className="offer-card__img" />
                  ) : (
                    <div className="offer-card__no-img">📷</div>
                  )}
                  {discount && <span className="offer-card__badge">{discount}% OFF</span>}
                  {item.isBestseller && <span className="offer-card__best">⭐ BESTSELLER</span>}
                </div>
                <div className="offer-card__info">
                  <h3>{item.name}</h3>
                  <div className="offer-card__price">
                    <span className="offer-card__offer">{currency}{Number(item.offerPrice).toLocaleString("en-IN")}</span>
                    {item.originalPrice && <span className="offer-card__orig">{currency}{Number(item.originalPrice).toLocaleString("en-IN")}</span>}
                  </div>
                  <button className="offer-card__cart" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    🛒
                  </button>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OfferProductsPage;
