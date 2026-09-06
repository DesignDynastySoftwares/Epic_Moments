import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import GoogleReviewsItem from "../components/GoogleReviewsItem";
import { Helmet } from "react-helmet-async";
import "./AllReviews.css";

const AllReviews = () => {
  const { googleReviews } = useContext(ShopContext);

  const reviews = Array.isArray(googleReviews) ? googleReviews : [];

  // Sort newest first
  const sorted = [...reviews].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
      : "0.0";

  return (
    <div className="ar-page">
      <Helmet>
        <title>Customer Reviews - Epic Moments</title>
        <meta
          name="description"
          content="Read what our happy customers say about Epic Moments — personalized gifts, photography and album design."
        />
      </Helmet>

      {/* Header */}
      <div className="ar-hero">
        <span className="ar-hero__eyebrow">LOVED BY CUSTOMERS</span>
        <h1 className="ar-hero__title">
          What Our <span>Customers Say</span>
        </h1>
        <p className="ar-hero__sub">
          Real stories from thousands of happy customers who trusted us with their special moments.
        </p>

        <div className="ar-stats">
          <div className="ar-stat">
            <strong>{avgRating}★</strong>
            <span>Average Rating</span>
          </div>
          <div className="ar-stat">
            <strong>{reviews.length}+</strong>
            <span>Verified Reviews</span>
          </div>
          <div className="ar-stat">
            <strong>20,000+</strong>
            <span>Happy Customers</span>
          </div>
        </div>
      </div>

      {/* Reviews grid */}
      {sorted.length === 0 ? (
        <p className="ar-empty">No reviews yet. Check back soon!</p>
      ) : (
        <div className="ar-grid">
          {sorted.map((item, idx) => (
            <GoogleReviewsItem
              key={item._id || idx}
              name={item.name}
              review={item.review}
              rating={item.rating}
              media={item?.media?.url || null}
              index={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllReviews;
