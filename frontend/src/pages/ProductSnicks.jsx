import React, { useContext } from "react";
import Slider from "react-slick";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";  // import Link
import "./SimpleSlider.css";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Utility to check if URL is a video file
const isVideoFile = (url) => {
  return /\.(mp4|webm|ogg)$/i.test(url);
};

export default function SimpleSlider() {
  const { products } = useContext(ShopContext);

  if (!products || products.length === 0) {
    return <p>Loading products...</p>;
  }

  const getFirstMedia = (product) => {
    const mediaArray = Array.isArray(product.media) && product.media.length > 0
      ? product.media
      : Array.isArray(product.image) ? product.image : [];

    if (mediaArray.length === 0) return null;

    let firstItem = mediaArray[0];
    let url = "";

    if (typeof firstItem === "string") {
      url = firstItem;
    } else if (typeof firstItem === "object" && firstItem.url) {
      url = firstItem.url;
    }

    if (!url) return null;

    if (!url.startsWith("http")) {
      url = `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
    }

    return {
      url,
      type: isVideoFile(url) ? "video" : "image",
    };
  };

  const baseSettings = {
    dots: false,
    infinite: true,
    speed: 5000,
    slidesToShow: Math.min(products.length, 4),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: "linear",
    pauseOnHover: false,
    arrows: false,
    responsive: [
      { breakpoint: 1281, settings: { slidesToShow: Math.min(products.length, 3) } },
      { breakpoint: 1024, settings: { slidesToShow: Math.min(products.length, 3) } },
      { breakpoint: 768, settings: { slidesToShow: Math.min(products.length, 2) } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  const forwardSettings = { ...baseSettings, rtl: false };
  const reverseSettings = { ...baseSettings, rtl: true };

  return (
    <div className="product-slick space-y-8">
      {/* Forward Slider */}
      <div className="slider-container">
        <Slider {...forwardSettings}>
          {products.map((product) => {
            const media = getFirstMedia(product);

            return (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="slide-card"
                aria-label={`View details of ${product.name}`}
              >
                {media ? (
                  media.type === "video" ? (
                    <video
                      src={media.url}
                      muted
                      autoPlay
                      loop
                      playsInline
                      className="product-video"
                    />
                  ) : (
                    <img
                      src={media.url}
                      alt={product.name || "Product image"}
                      className="product-image"
                      loading="lazy"
                    />
                  )
                ) : (
                  <div className="product-image placeholder">No Image</div>
                )}
                <h3>{product.name}</h3>
              </Link>
            );
          })}
        </Slider>
      </div>

      {/* Reverse Slider */}
      <div className="slider-container">
        <Slider {...reverseSettings}>
          {products.map((product) => {
            const media = getFirstMedia(product);

            return (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="slide-card"
                aria-label={`View details of ${product.name}`}
              >
                {media ? (
                  media.type === "video" ? (
                    <video
                      src={media.url}
                      muted
                      autoPlay
                      loop
                      playsInline
                      className="product-video"
                    />
                  ) : (
                    <img
                      src={media.url}
                      alt={product.name || "Product image"}
                      className="product-image"
                      loading="lazy"
                    />
                  )
                ) : (
                  <div className="product-image placeholder">No Image</div>
                )}
                <h3>{product.name}</h3>
              </Link>
            );
          })}
        </Slider>
      </div>
    </div>
  );
}
