import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import "./deskDecoratives.css";

const WallDecorativesItem = ({ id, name, media, category, originalPrice, offerPrice }) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useContext(ShopContext);
  const favorited = isFavorite ? isFavorite(id) : false;
  const isVideo = media && /\.(mp4|mov|webm)$/i.test(media);

  const handleClick = () => {
    navigate(`/collections?category=${encodeURIComponent(category || "")}`);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (toggleFavorite) toggleFavorite({ _id: id, name, media: [{ url: media }], price: offerPrice });
  };

  const discount = originalPrice && offerPrice
    ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
    : null;

  return (
    <div className="dc" onClick={handleClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}>
      <div className="dc__media">
        {media ? (
          isVideo
            ? <video src={media} className="dc__img" autoPlay loop muted playsInline />
            : <img src={media} className="dc__img" alt={name} loading="lazy" />
        ) : (
          <div className="dc__no-media">No Image</div>
        )}
        <div className="dc__overlay" />
        {discount && <span className="dc__badge">{discount}% OFF</span>}
        <button className={`dc__heart${favorited ? " dc__heart--active" : ""}`} onClick={handleWishlist} aria-label="Wishlist">
          <svg viewBox="0 0 24 24" width="14" height="14" fill={favorited ? "var(--pink)" : "none"} stroke="var(--pink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <div className="dc__hover-panel">
          <p className="dc__hover-name">{name}</p>
          <div className="dc__hover-row">
            <span className="dc__hover-price">₹{Number(offerPrice).toLocaleString("en-IN")}</span>
            <span className="dc__hover-btn">Customize →</span>
          </div>
        </div>
      </div>
      <div className="dc__body">
        <p className="dc__name">{name}</p>
        <div className="dc__price-row">
          <span className="dc__price">₹{Number(offerPrice).toLocaleString("en-IN")}</span>
          {originalPrice && <span className="dc__original">₹{Number(originalPrice).toLocaleString("en-IN")}</span>}
        </div>
      </div>
    </div>
  );
};

export default WallDecorativesItem;
