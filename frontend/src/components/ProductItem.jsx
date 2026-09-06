import React, { useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import "./ProductItem.css";

const ProductItem = ({ id, media = [], name, price, description, originalPrice, rating = 4.5, reviewCount = 0 }) => {
  const { currency, toggleFavorite, isFavorite, addToCart } = useContext(ShopContext);
  const videoRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const favorited = isFavorite ? isFavorite(id) : false;

  const handleVideoEnter = () => videoRef.current?.play().catch(() => {});
  const handleVideoLeave = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggleFavorite) toggleFavorite({ _id: id, name, media, price, description });
  };

  // show up to 3 media items as slides
  const slides = media.slice(0, 3);

  const renderSlide = (item, idx) => {
    if (!item) return null;
    if (item.type === "video") {
      return (
        <video
          key={idx}
          ref={idx === 0 ? videoRef : null}
          muted loop playsInline preload="metadata"
          className={`pic__slide${activeSlide === idx ? " pic__slide--active" : ""}`}
          onMouseEnter={handleVideoEnter}
          onMouseLeave={handleVideoLeave}
        >
          <source src={item.url} type="video/mp4" />
        </video>
      );
    }
    return (
      <img
        key={idx}
        src={item.url}
        alt={`${name} ${idx + 1}`}
        loading="lazy"
        className={`pic__slide${activeSlide === idx ? " pic__slide--active" : ""}`}
      />
    );
  };

  // star rendering
  const renderStars = () => {
    const full  = Math.floor(rating);
    const half  = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <>
        {Array(full).fill(0).map((_, i) => <span key={`f${i}`} className="pic__star pic__star--full">★</span>)}
        {half && <span className="pic__star pic__star--half">★</span>}
        {Array(empty).fill(0).map((_, i) => <span key={`e${i}`} className="pic__star pic__star--empty">★</span>)}
      </>
    );
  };

  return (
    <article className="pic">
      <Link to={`/product/${id}`} className="pic__card" onClick={() => window.scrollTo(0, 0)}>

        {/* ── IMAGE AREA ── */}
        <div className="pic__media">

          {slides.length > 0 ? (
            slides.map((item, idx) => renderSlide(item, idx))
          ) : (
            <div className="pic__placeholder">No Image</div>
          )}

          {/* hover zoom overlay */}
          <div className="pic__overlay" />

          {/* wishlist heart */}
          <button
            className={`pic__heart${favorited ? " pic__heart--active" : ""}`}
            onClick={handleWishlist}
            aria-label="Wishlist"
          >
            <svg viewBox="0 0 24 24" width="17" height="17"
              fill={favorited ? "var(--pink)" : "none"}
              stroke="var(--pink)" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>

          {/* dot indicators — only if multiple slides */}
          {slides.length > 1 && (
            <div className="pic__dots">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  className={`pic__dot${activeSlide === idx ? " pic__dot--active" : ""}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveSlide(idx); }}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

        </div>

        {/* ── BODY ── */}
        <div className="pic__body">

          {/* name */}
          <h3 className="pic__name">{name}</h3>

          {/* description */}
          {description && (
            <p className="pic__desc">
              {description.length > 55 ? description.substring(0, 55) + "..." : description}
            </p>
          )}

          {/* star rating */}
          <div className="pic__rating">
            <div className="pic__stars">{renderStars()}</div>
            {reviewCount > 0 && <span className="pic__review-count">({reviewCount} Reviews)</span>}
          </div>

          {/* divider */}
          <div className="pic__divider" />

          {/* price row + add to cart */}
          <div className="pic__footer">
            <div className="pic__price-group">
              <span className="pic__price">
                {currency}{Number(price).toLocaleString("en-IN")}
              </span>
              {originalPrice && (
                <span className="pic__original">
                  {currency}{Number(originalPrice).toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <button
              className="pic__cart-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Products at this level have no size selector — default to "OneSize"
                addToCart(id, "OneSize");
              }}
              aria-label="Add to cart"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <span className="pic__cart-btn-text">ADD TO CART</span>
            </button>
          </div>

        </div>

      </Link>
    </article>
  );
};

export default ProductItem;
