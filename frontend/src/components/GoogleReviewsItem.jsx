import React from "react";
import "./GoogleReviews.css";

const GoogleReviewsItem = ({ name, review, rating, media }) => {
  const mainMedia = media || null;

  const isVideo =
    mainMedia &&
    (mainMedia.includes("video/upload") ||
      /\.(mp4|mov|webm)$/i.test(mainMedia));

  return (
    <div className="gr-card">
      {/* Profile pic — top-right corner */}
      <div className="gr-image-wrap">
        {mainMedia ? (
          isVideo ? (
            <video src={mainMedia} className="gr-image" autoPlay loop muted playsInline />
          ) : (
            <img src={mainMedia} className="gr-image" alt={name} />
          )
        ) : (
          <div className="gr-avatar">
            <span className="gr-avatar-letter">{name?.charAt(0)?.toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* decorative quote mark */}
      <span className="gr-quote" aria-hidden="true">&ldquo;</span>

      {/* Stars */}
      <div className="gr-stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < rating ? "gr-star gr-star--filled" : "gr-star gr-star--empty"}>★</span>
        ))}
      </div>

      {/* Review text */}
      <p className="gr-review-text">{review}</p>

      {/* Reviewer footer */}
      <div className="gr-footer">
        <div className="gr-footer__info">
          <h4 className="gr-name">{name}</h4>
          <span className="gr-verified">
            <span className="gr-verified-icon">✓</span> Verified Purchase
          </span>
        </div>
      </div>
    </div>
  );
};

export default GoogleReviewsItem;
