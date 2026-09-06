import React, { useContext, useEffect, useState } from "react";
import Slider from "react-slick";
import { ShopContext } from "../context/ShopContext";
import GoogleReviewsItem from "./GoogleReviewsItem";
import "./GoogleReviews.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const GoogleReviews = () => {
  const { googleReviews } = useContext(ShopContext);
  const [latestReviews, setLatestReviews] = useState([]);

  useEffect(() => {
    if (Array.isArray(googleReviews) && googleReviews.length > 0) {
      const sorted = [...googleReviews].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setLatestReviews(sorted.slice(0, 10));
    }
  }, [googleReviews]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 900, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section className="container py-4 google-review-carousel-container">
      {latestReviews.length === 0 ? (
        <p className="text-center text-muted fs-5">No reviews available.</p>
      ) : (
        <Slider {...settings}>
          {latestReviews.map((item, idx) => (
            <div key={item._id} className="px-1">
              <GoogleReviewsItem
                name={item.name}
                review={item.review}
                rating={item.rating}
                media={item?.media?.url || null}
                index={idx}
              />
            </div>
          ))}
        </Slider>
      )}
    </section>
  );
};

export default GoogleReviews;
