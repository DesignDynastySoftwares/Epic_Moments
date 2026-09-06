import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from './ProductItem';
import './LatestCollection.css';

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeoutId = null;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setScreenWidth(window.innerWidth), 150);
    };
    window.addEventListener('resize', handleResize);
    return () => { clearTimeout(timeoutId); window.removeEventListener('resize', handleResize); };
  }, []);

  useEffect(() => {
    if (!products || products.length === 0) {
      setLatestProducts([]);
      setLoading(true);
      return;
    }
    setLoading(false);
    let count = 12;
    if (screenWidth >= 800 && screenWidth <= 1270) count = 9;
    else if (screenWidth < 800) count = 6;
    setLatestProducts(products.slice(0, count));
  }, [products, screenWidth]);

  if (loading) {
    return (
      <div className="lc-loading">
        <div className="lc-loading__dot" />
        <div className="lc-loading__dot" />
        <div className="lc-loading__dot" />
      </div>
    );
  }

  if (latestProducts.length === 0) {
    return <div className="lc-empty">No products found.</div>;
  }

  return (
    <div className="lc-wrap">
      <div className="lc-grid">
        {latestProducts.map((item, index) => (
          <div key={item._id ?? index} className="lc-grid__item">
            <ProductItem
              id={item._id}
              media={item.media ?? []}
              name={item.name ?? 'Unnamed Product'}
              price={item.price ?? 'N/A'}
              description={item.description ?? ''}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestCollection;
