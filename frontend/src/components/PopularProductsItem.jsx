import React from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import "./popularProducts.css";

const PopularProductsItem = ({
  id, name, image = [], category,
  rating = 4.8, purchases = 0,
  badge, discount,
}) => {
  const mainMedia = Array.isArray(image) && image.length > 0 ? image[0] : null;

  return (
    <Link
      to={{ pathname: "/collections", search: `?category=${encodeURIComponent(category || "")}` }}
      className="pp-card"
    >
      {/* Image */}
      <div className="pp-card__media">
        {mainMedia ? (
          /\.(mp4|mov|webm)$/i.test(mainMedia) ? (
            <video src={mainMedia} className="pp-card__img" autoPlay loop muted playsInline />
          ) : (
            <img src={mainMedia} className="pp-card__img" alt={name} loading="lazy" />
          )
        ) : (
          <div className="pp-card__no-media">No Media</div>
        )}

        {/* Badge */}
        {badge && (
          <span className="pp-card__badge pp-card__badge--seller">
            {badge.split("\n").map((line, i) => <span key={i}>{line}</span>)}
          </span>
        )}
        {discount && !badge && (
          <span className="pp-card__badge pp-card__badge--discount">{discount}%OFF</span>
        )}
      </div>

      {/* Info */}
      <div className="pp-card__body">
        {/* Name */}
        <p className="pp-card__name">{name}</p>

        {/* Category */}
        {category && <p className="pp-card__category">{category}</p>}

        {/* Sales (left) + Rating (right) */}
        <div className="pp-card__meta">
          {purchases > 0 ? (
            <span className="pp-card__purchases">
              {Number(purchases).toLocaleString("en-IN")}+ sold
            </span>
          ) : (
            <span />
          )}
          <span className="pp-card__rating">
            <FaStar className="pp-card__star" />
            <span>{Number(rating).toFixed(1)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PopularProductsItem;
