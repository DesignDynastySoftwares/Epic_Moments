import React, { useContext, useState, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link, useNavigate } from 'react-router-dom';
import './ProductItem.css';
import { FaShoppingCart, FaCheck, FaInfoCircle } from 'react-icons/fa';

const BestItem = ({ id, media = [], name = 'Unnamed Product', price, description }) => {
  const { currency } = useContext(ShopContext);
  const [clicked, setClicked] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const handleCartClick = () => {
    if (clicked) return;
    setClicked(true);
    setTimeout(() => {
      navigate(`/product/${id}`);
    }, 3000);
  };

  // Keyboard accessibility for the add to cart button
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCartClick();
    }
  };

  // Defensive check
  const firstMedia = Array.isArray(media) && media.length > 0 ? media[0] : null;

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const renderMedia = () => {
    if (!firstMedia) {
      return <img src="/default-image.png" alt="No media available" loading="lazy" />;
    }

    switch (firstMedia.type) {
      case 'image':
        return <img src={firstMedia.url} alt={name} loading="lazy" />;
      case 'video':
        return (
          <video
            ref={videoRef}
            muted
            preload="metadata"
            width="100%"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ display: 'block' }}
            aria-label={`${name} video preview`}
          >
            <source src={firstMedia.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      case 'audio':
        return (
          <audio controls preload="metadata" style={{ width: '100%' }} aria-label={`${name} audio preview`}>
            <source src={firstMedia.url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        );
      default:
        return <img src={firstMedia.url} alt={name} loading="lazy" />;
    }
  };

  return (
    <div className="product-item">
      <div className="Product_Card_wrapper">
        <div className="Product_Card_container">
          <div className="Product_Card_top">
            <Link to={`/product/${id}`} onClick={() => window.scrollTo(0, 0)} aria-label={`View details of ${name}`}>
              {renderMedia()}
            </Link>
          </div>
          <div className={`bottom ${clicked ? 'clicked' : ''}`}>
            <div className="Product_Card_left">
              <div className="Product_Card_details">
                <p className="product-name">{name}</p>
                <p className="product-price-1">
                  {currency}&nbsp;&nbsp;{price}
                </p>
              </div>
              {!clicked && (
                <div
                  className="Product_Card_buy"
                  onClick={handleCartClick}
                  onKeyPress={handleKeyPress}
                  aria-label={`Add ${name} to cart`}
                  role="button"
                  tabIndex={0}
                >
                  <FaShoppingCart />
                </div>
              )}
            </div>
            {clicked && (
              <div className="Product_Card_right" aria-live="polite">
                <div className="Product_Card_details">
                  <h1>{name}</h1>
                  <p>Added to your cart</p>
                </div>
                <div className="Product_Card_done" aria-hidden="true">
                  <FaCheck />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="Product_Card_inside-1">
          <div className="Product_Card_icon" aria-hidden="true">
            <FaInfoCircle />
          </div>
          <div className="Product_Card_Description">
            <p>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestItem;
