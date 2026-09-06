import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaStar, FaHeart, FaRegHeart } from 'react-icons/fa';
import './CollectionItem.css';

const CollectionItems = ({
  id, media = [], name, price, category,
  rating = 0, reviews = [], customers = 0, bestseller = false,
}) => {
  const { currency, toggleFavorite, isFavorite } = useContext(ShopContext);
  const navigate = useNavigate();

  const firstMedia = media.length > 0 ? media[0] : null;
  const imgUrl = firstMedia?.url || null;
  const isVideo = imgUrl && /\.(mp4|mov|webm)$/i.test(imgUrl);

  const reviewCount = Array.isArray(reviews) ? reviews.length : 0;
  const displayRating = Number(rating) > 0 ? Number(rating).toFixed(1) : "4.0";
  const faved = isFavorite(id);

  const handleCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${id}`);
  };

  const handleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({ _id: id, media, name, price, category });
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.scrollTo(0, 0);
    navigate(`/product/${id}`);
  };

  return (
    <Link to={`/product/${id}`} className="col-card" onClick={() => window.scrollTo(0, 0)}>
      {/* Image */}
      <div className="col-card__img-wrap">
        {imgUrl ? (
          isVideo ? (
            <video src={imgUrl} className="col-card__img" autoPlay loop muted playsInline />
          ) : (
            <img src={imgUrl} alt={name} className="col-card__img" loading="lazy" />
          )
        ) : (
          <div className="col-card__no-img">📷</div>
        )}

        {/* Bestseller badge */}
        {bestseller && <span className="col-card__badge">★ Bestseller</span>}

        {/* Wishlist heart */}
        <button
          className={`col-card__fav ${faved ? "col-card__fav--active" : ""}`}
          onClick={handleFav}
          aria-label={faved ? "Remove from wishlist" : "Add to wishlist"}
        >
          {faved ? <FaHeart /> : <FaRegHeart />}
        </button>

        {/* Rating chip */}
        <span className="col-card__rating">
          <FaStar className="col-card__rating-star" />
          {displayRating}
        </span>

        <div className="col-card__overlay">
          <span>View Product</span>
        </div>
      </div>

      {/* Info */}
      <div className="col-card__info">
        {category && <span className="col-card__cat">{category}</span>}
        <h3 className="col-card__name">{name}</h3>

        {/* meta: reviews */}
        {reviewCount > 0 && (
          <div className="col-card__meta">
            <span>{reviewCount} reviews</span>
          </div>
        )}

        <div className="col-card__bottom">
          <span className="col-card__price">{currency}{Number(price).toLocaleString("en-IN")}</span>
          <div className="col-card__actions">
            <button className="col-card__buy" onClick={handleBuyNow}>Buy Now</button>
            <button className="col-card__cart" onClick={handleCart} aria-label="Add to cart">🛒</button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CollectionItems;
