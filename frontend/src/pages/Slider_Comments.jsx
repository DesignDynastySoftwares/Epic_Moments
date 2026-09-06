import React, { useContext, useEffect, useState } from "react";
import Slider from "react-slick";
import "./Slider_Comments.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ShopContext } from "../context/ShopContext";

const ProfileSlider = () => {
  const { googleReviews } = useContext(ShopContext);
  const [latestReviews, setLatestReviews] = useState([]);

  useEffect(() => {
    if (Array.isArray(googleReviews) && googleReviews.length > 0) {
      setLatestReviews(googleReviews.slice(0, 10)); // Just like wall decor
    }
  }, [googleReviews]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: false,
  };

  return (
    <div className="slider-comments">

      {latestReviews.length === 0 ? (
        <p className="text-center text-muted fs-5">
          No reviews available.
        </p>
      ) : (
        <Slider {...settings}>
          {latestReviews.map((item) => (
            <div key={item._id} className="profile-slide">

              {/* IMAGE / VIDEO */}
              <div className="ima_name">
                {item.media?.url ? (
                  /\.(mp4|mov|webm)$/i.test(item.media.url) ? (
                    <video
                      src={item.media.url}
                      className="profile-pic"
                      autoPlay
                      loop
                      muted
                    />
                  ) : (
                    <img
                      src={item.media.url}
                      alt={item.name}
                      className="profile-pic"
                    />
                  )
                ) : (
                  <div className="profile-pic no-media">No Media</div>
                )}

                <h2>{item.name}</h2>
              </div>

              {/* COMMENT */}
              <p>"{item.review}"</p>

              {/* RATING */}
              <p className="rating-stars">
                {"⭐".repeat(item.rating)}
              </p>

            </div>
          ))}
        </Slider>
      )}
    </div>
  );
};

export default ProfileSlider;
