import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import BestItem from './BestItem';
import './bestcollections.css';
import './ProductItem.css';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const mapMedia = (mediaArr = []) => {
  if (!Array.isArray(mediaArr)) return [];

  return mediaArr.map(item => {
    if (typeof item === 'object' && item !== null && 'url' in item && 'type' in item) {
      const fullUrl = item.url.startsWith('http')
        ? item.url
        : `${BASE_URL}${item.url.startsWith('/') ? '' : '/'}${item.url}`;

      return {
        ...item,
        url: fullUrl,
      };
    }

    if (typeof item === 'string') {
      const fullUrl = item.startsWith('http')
        ? item
        : `${BASE_URL}${item.startsWith('/') ? '' : '/'}${item}`;

      let type = 'image';
      if (item.match(/\.(mp4|webm|ogg)$/i)) type = 'video';
      else if (item.match(/\.(mp3|wav|ogg)$/i)) type = 'audio';

      return { type, url: fullUrl };
    }

    return null;
  }).filter(Boolean);
};

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    if (!products || !Array.isArray(products)) {
      setBestSeller([]);
      return;
    }

    const bestProducts = products.filter(item => item.bestseller);

    const fixedProducts = bestProducts.map(item => ({
      ...item,
      media: mapMedia(item.media ?? item.image ?? []),
    }));

    setBestSeller(fixedProducts.slice(0, 5));
  }, [products]);

  if (!bestSeller.length) {
    return (
      <div className="my-10 text-center">
        <p>No best sellers found.</p>
      </div>
    );
  }

  return (
    <div className="my-10">
      <div className="bestcollections_slide-top">
        <div className="screen-3-title">
          <h2>Best Sales</h2>
          <p>
            Make every moment unforgettable with our best-selling personalized gifts, crafted to delight and impress.
          </p>
        </div>
      </div>

      <div className="best-grid-wrapper">
        {bestSeller.map((item, index) => (
          <BestItem
            key={item._id ?? index}
            id={item._id}
            name={item.name}
            media={item.media}
            price={item.price}
            description={item.description}
          />
        ))}
      </div>
    </div>
  );
};

export default BestSeller;
