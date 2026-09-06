import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MainPage.css";

const CatagereItem = ({ id, image, name }) => {
  const navigate = useNavigate();

  const handleViewDetailsClick = () => {
    navigate(`/collection`);
    window.scrollTo(0, 0);
  };

  const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);
  const mediaUrl = Array.isArray(image) && image.length > 0 ? image[0] : null;

  return (
    <div className="card_zone">
      <div className="card-border-top"></div>

      <Link
        to={`/collections?category=${encodeURIComponent(name)}`}
        className="image-wrapper"
        onClick={() => window.scrollTo(0, 0)}
      >
        {mediaUrl ? (
          isVideo(mediaUrl) ? (
            <video
              src={mediaUrl}
              controls
              muted
              loop
              width="100%"
              height="150px"
              style={{ objectFit: "cover", borderRadius: "8px" }}
              onError={(e) => {
                e.target.poster = "/placeholder.png";
              }}
            />
          ) : (
            <img
              src={mediaUrl}
              alt={name}
              loading="lazy"
              onError={(e) => {
                e.target.src = "/placeholder.png";
              }}
              style={{ borderRadius: "8px" }}
            />
          )
        ) : (
          <img
            src="/placeholder.png"
            alt="placeholder"
            style={{ borderRadius: "8px" }}
          />
        )}
      </Link>

      <div className="Catagery_card_text">{name}</div>
      <button onClick={handleViewDetailsClick}>View Details</button>
    </div>
  );
};

export default CatagereItem;
