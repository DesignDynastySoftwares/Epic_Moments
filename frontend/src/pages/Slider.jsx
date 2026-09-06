import React, { useRef, useContext, useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ShopContext } from "../context/ShopContext";
import "./AutoPlaySlider.css";

const Skeleton = () => <div className="skeleton-loader" />;

const AutoPlaySlider = () => {
  const sliderRef = useRef();
  const { slides } = useContext(ShopContext);
  const [loadedMap, setLoadedMap] = useState({});

  const settings = {
    dots: false,
    infinite: true,
    speed: 900,
    autoplay: false, // we control timing manually
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    afterChange: (index) => handleAfterChange(index),
  };

  // Initialize skeleton loaders & trigger first autoplay
  useEffect(() => {
    if (slides && slides.length > 0) {
      const initialState = {};
      slides.forEach((s) => {
        initialState[s._id] = false;
      });
      setLoadedMap(initialState);

      // Start autoplay for first slide after DOM renders
      setTimeout(() => {
        handleAfterChange(0);
      }, 1000);
    }
  }, [slides]);

  const handleLoad = (id) => {
    setTimeout(() => {
      setLoadedMap((prev) => ({ ...prev, [id]: true }));
    }, 1500); // minimum skeleton time
  };

  const handleAfterChange = (index) => {
    const currentSlide = slides?.[index];
    if (!currentSlide) return;

    const mediaUrl = currentSlide?.image?.[0];
    if (!mediaUrl) return;

    let ext = "";
    try {
      ext = new URL(mediaUrl).pathname.split(".").pop()?.toLowerCase();
    } catch {
      return;
    }

    if (["mp4", "webm"].includes(ext)) {
      // Handle video
      const videoEl = document.querySelector(".slick-current video");
      if (videoEl) {
        videoEl.currentTime = 0;
        videoEl.play();

        // Remove old event listener
        videoEl.onended = null;

        // Move to next when video ends
        videoEl.onended = () => {
          sliderRef.current?.slickNext();
        };
      }
    } else {
      // Handle image - move after 3 seconds
      setTimeout(() => {
        sliderRef.current?.slickNext();
      }, 3000);
    }
  };

  return (
    <div className="slider-container-fluid">
      <Slider ref={sliderRef} {...settings}>
        {slides && slides.length > 0 ? (
          slides.map((slide) => {
            const mediaUrl = slide?.image?.[0];
            const isLoaded = loadedMap[slide._id];

            if (!mediaUrl) {
              return (
                <div key={slide._id} className="skeleton-loader">
                  <p>Media Missing</p>
                </div>
              );
            }

            let ext = "";
            try {
              ext = new URL(mediaUrl).pathname.split(".").pop()?.toLowerCase();
            } catch {
              return (
                <div key={slide._id} className="skeleton-loader">
                  <p>Invalid Media URL</p>
                </div>
              );
            }

            return (
              <div key={slide._id}>
                {!isLoaded && <Skeleton />}
                {["mp4", "webm"].includes(ext) ? (
                  <video
                    src={mediaUrl}
                    muted
                    playsInline
                    onLoadedData={() => handleLoad(slide._id)}
                    className={`media-slide ${isLoaded ? "" : "hidden"}`}
                  />
                ) : ["jpg", "jpeg", "png", "gif", "webp"].includes(ext) ? (
                  <img
                    src={mediaUrl}
                    alt="Slide"
                    loading="lazy"
                    onLoad={() => handleLoad(slide._id)}
                    className={`media-slide ${isLoaded ? "" : "hidden"}`}
                  />
                ) : (
                  <div className="skeleton-loader">
                    <p>Unsupported Media Type</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="skeleton-loader">
            <p>No Slides Available</p>
          </div>
        )}
      </Slider>
    </div>
  );
};

export default AutoPlaySlider;
