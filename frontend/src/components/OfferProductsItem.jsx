import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import "./offerProducts.css";

const OfferProductsItem = ({
  id, name, media, category,
  originalPrice, offerPrice, discount,
  isBestseller, rating, tagline, itemData,
}) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useContext(ShopContext);

  const favorited = isFavorite(id);
  const mainMedia = media || null;

  const handleClick = () => {
    navigate(`/collections?category=${encodeURIComponent(category || "")}`);
  };

  const handleHeart = (e) => {
    e.stopPropagation();
    toggleFavorite(itemData || { _id: id, name, media: { url: media }, category, originalPrice, offerPrice, isBestseller, rating, tagline });
  };

  return (
    <div
      className="opc"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >

      {/* ── IMAGE AREA ── */}
      <div className="opc__media">
        {mainMedia ? (
          /\.(mp4|mov|webm)$/i.test(mainMedia) ? (
            <video src={mainMedia} className="opc__img" autoPlay loop muted playsInline />
          ) : (
            <img src={mainMedia} alt={name} className="opc__img" loading="lazy" />
          )
        ) : (
          <div className="opc__no-media">No Image</div>
        )}

        {/* top-left: BESTSELLER pill */}
        {isBestseller && (
          <span className="opc__bestseller">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#e8157e" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            BESTSELLER
          </span>
        )}

        {/* top-right: heart / favorite button */}
        <button
          className={`opc__heart${favorited ? " opc__heart--active" : ""}`}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          onClick={handleHeart}
        >
          <svg
            width="16" height="16"
            viewBox="0 0 24 24"
            fill={favorited ? "#e8157e" : "none"}
            stroke="#e8157e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="opc__heart-svg"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      {/* ── BODY ── */}
      <div className="opc__body">

        {/* name */}
        <h3 className="opc__name">{name}</h3>

        {/* rating row */}
        <div className="opc__rating-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#e8157e" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span className="opc__rating-val">{rating ?? 4.9}</span>
          <span className="opc__rating-sep">|</span>
          <span className="opc__rating-label">{tagline || "Personalized with love"}</span>
          {/* outline heart beside tagline */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e8157e" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {/* mobile-only discount beside rating (3rd line) */}
          {discount && <span className="opc__disc-pill opc__disc-pill--mobile">{discount}% OFF</span>}
        </div>

        {/* price row */}
        <div className="opc__price-row">
          {offerPrice   && <span className="opc__price">₹{Number(offerPrice).toLocaleString("en-IN")}</span>}
          {originalPrice && <span className="opc__original">₹{Number(originalPrice).toLocaleString("en-IN")}</span>}
          {discount     && <span className="opc__disc-pill">{discount}% OFF</span>}
        </div>

        {/* CTA */}
        <button className="opc__cta" onClick={handleClick}>
          Customize Now &nbsp;→
        </button>

      </div>
    </div>
  );
};

export default OfferProductsItem;
