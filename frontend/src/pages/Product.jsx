import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets.js';
import RelatedProducts from '../components/RelatedProducts';
import './Product.css';

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, currency, addToCart, toggleFavorite, isFavorite } = useContext(ShopContext);

  const [productData, setProductData]   = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [size, setSize]                 = useState('');
  const [description, setDescription]  = useState('');
  const [added, setAdded]               = useState(false);

  const detectMediaType = (url) => {
    if (!url) return 'image';
    if (/\.(mp4|webm|ogg)$/i.test(url)) return 'video';
    if (/\.(mp3|wav)$/i.test(url))  return 'audio';
    return 'image';
  };

  useEffect(() => {
    const load = async () => {
      const found = products.find(p => p._id === productId);
      const hydrate = (product) => {
        let media = Array.isArray(product.media) && product.media.length
          ? product.media
          : Array.isArray(product.image)
            ? product.image.map(url => ({ url, type: detectMediaType(url) }))
            : [{ url: assets.fallback_image, type: 'image' }];
        media = media.map(m =>
          typeof m === 'string' ? { url: m, type: detectMediaType(m) }
            : { ...m, type: m.type || detectMediaType(m.url) }
        );
        setProductData({ ...product, mediaArr: media });
        setSelectedMedia(media[0]);
        setDescription(product.description || '');
      };
      if (found) { hydrate(found); }
      else {
        try {
          const res = await fetch(`/api/product/${productId}`);
          hydrate(await res.json());
        } catch (e) { console.error(e); }
      }
    };
    load();
  }, [productId, products]);

  if (!productData) {
    return (
      <div className="pd-loading">
        <span className="pd-loading__dot" />
        <span className="pd-loading__dot" />
        <span className="pd-loading__dot" />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (productData.sizes?.length && !size) {
      toast.error('Please select a size first');
      return;
    }
    addToCart(productData._id, size || 'OneSize');
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (productData.sizes?.length && !size) {
      toast.error('Please select a size first');
      return;
    }
    addToCart(productData._id, size || 'OneSize');
    navigate('/cart');
  };

  const renderMain = () => {
    if (!selectedMedia) return null;
    if (selectedMedia.type === 'video')
      return <video src={selectedMedia.url} autoPlay muted loop playsInline controls className="pd__main-media" />;
    if (selectedMedia.type === 'audio')
      return <audio src={selectedMedia.url} controls preload="auto" className="pd__main-audio" />;
    return <img src={selectedMedia.url} alt={productData.name} className="pd__main-media" />;
  };

  const productUrl = `https://myepicmoments.com/product/${productData._id}`;
  const productImg = selectedMedia?.url || productData.mediaArr?.[0]?.url || 'https://myepicmoments.com/assets/social-preview.jpg';
  const metaDesc = (productData.description || `Buy ${productData.name} — a personalized gift from Epic Moments. Custom photo gifts, frames & more.`).slice(0, 160);

  return (
    <div className="pd">

      <Helmet>
        <title>{`${productData.name} | Epic Moments`}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={productUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={productUrl} />
        <meta property="og:title" content={`${productData.name} | Epic Moments`} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:image" content={productImg} />
        <meta property="og:site_name" content="Epic Moments" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${productData.name} | Epic Moments`} />
        <meta name="twitter:description" content={metaDesc} />
        <meta name="twitter:image" content={productImg} />

        {/* Product structured data — helps Google show rich results */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": productData.name,
            "image": productImg,
            "description": metaDesc,
            "category": productData.category || "Personalized Gifts",
            "brand": { "@type": "Brand", "name": "Epic Moments" },
            "offers": {
              "@type": "Offer",
              "url": productUrl,
              "priceCurrency": "INR",
              "price": Number(productData.price) || 0,
              "availability": "https://schema.org/InStock"
            }
          })}
        </script>
      </Helmet>

      {/* ── BREADCRUMB ── */}
      <div className="pd__breadcrumb">
        <span className="pd__breadcrumb-link" onClick={() => navigate('/')}>Home</span>
        <span className="pd__breadcrumb-sep">›</span>
        <span className="pd__breadcrumb-link" onClick={() => navigate('/collections')}>Collections</span>
        <span className="pd__breadcrumb-sep">›</span>
        <span className="pd__breadcrumb-current">{productData.name}</span>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="pd__layout">

        {/* LEFT — media */}
        <div className="pd__gallery">

          {/* thumbnails */}
          <div className="pd__thumbs">
            {(productData.mediaArr || []).map((item, i) => (
              <button
                key={i}
                className={`pd__thumb${selectedMedia?.url === item.url ? ' pd__thumb--active' : ''}`}
                onClick={() => setSelectedMedia(item)}
                aria-label={`View media ${i + 1}`}
              >
                {item.type === 'video'
                  ? <video src={item.url} muted playsInline className="pd__thumb-media" />
                  : item.type === 'audio'
                    ? <span className="pd__thumb-audio">🎵</span>
                    : <img src={item.url} alt="" className="pd__thumb-media" />
                }
              </button>
            ))}
          </div>

          {/* main preview */}
          <div className="pd__main">
            {renderMain()}
            <button
              className={`pd__wish${isFavorite(productData._id) ? ' pd__wish--active' : ''}`}
              onClick={() => toggleFavorite({
                _id: productData._id,
                media: productData.mediaArr,
                name: productData.name,
                price: productData.price,
                category: productData.category,
              })}
              aria-label="Add to wishlist"
            >
              {isFavorite(productData._id) ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

        </div>

        {/* RIGHT — info */}
        <div className="pd__info">

          {/* category pill */}
          {productData.category && (
            <span className="pd__category">{productData.category}</span>
          )}

          {/* name */}
          <h1 className="pd__name">{productData.name}</h1>

          {/* price */}
          <div className="pd__price-row">
            <span className="pd__price">{currency}{Number(productData.price).toLocaleString("en-IN")}</span>
            {productData.originalPrice && (
              <span className="pd__original">{currency}{Number(productData.originalPrice).toLocaleString("en-IN")}</span>
            )}
            {productData.originalPrice && (
              <span className="pd__discount">
                {Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>

          <div className="pd__divider" />

          {/* size selection */}
          {productData.sizes?.length > 0 && (
            <div className="pd__sizes">
              <p className="pd__sizes-label">Select Size</p>
              <div className="pd__sizes-row">
                {productData.sizes.map((s, i) => (
                  <button
                    key={i}
                    className={`pd__size-btn${s === size ? ' pd__size-btn--active' : ''}`}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="pd__cta-row">
            <button
              className={`pd__cart-btn${added ? ' pd__cart-btn--added' : ''}${!size && productData.sizes?.length ? ' pd__cart-btn--disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={!size && productData.sizes?.length > 0}
            >
              {added ? (
                <>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Added!
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  Add to Cart
                </>
              )}
            </button>

            <button
              className="pd__buy-btn"
              onClick={handleBuyNow}
              disabled={!size && productData.sizes?.length > 0}
            >
              ⚡ Buy Now
            </button>
          </div>

          <button className="pd__customize-btn" onClick={() => navigate('/contact')}>
            ✏️ Need Customization? Contact Us
          </button>

          {/* trust mini row */}
          <div className="pd__trust">
            {[
              { icon: "🚚", t: "Free Delivery", s: "Above ₹499" },
              { icon: "🔄", t: "Easy Returns", s: "7-day policy" },
              { icon: "🔒", t: "Secure Payment", s: "100% safe" },
              { icon: "⭐", t: "Premium Quality", s: "Handcrafted" },
            ].map(({ icon, t, s }) => (
              <div key={t} className="pd__trust-item">
                <span className="pd__trust-icon">{icon}</span>
                <div>
                  <strong>{t}</strong>
                  <span>{s}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pd__divider" />

          {/* important notes */}
          <div className="pd__notes">
            <p className="pd__notes-title">⚠️ Please read before ordering:</p>
            <ul>
              <li>Customized items are non-returnable unless damaged.</li>
              <li>Delivery takes 5–7 working days across India.</li>
              <li>Provide accurate shipping address & contact number.</li>
              <li>Contact support within 2 hours for order modifications.</li>
            </ul>
          </div>

        </div>
      </div>

      {/* ── DESCRIPTION ── */}
      <div className="pd__tabs">
        <div className="pd__tab-nav">
          <span className="pd__tab-btn pd__tab-btn--active">Description</span>
        </div>
        <div className="pd__tab-panel">
          <p className="pd__tab-desc">{description || 'No description available.'}</p>
        </div>
      </div>

      {/* ── RELATED PRODUCTS ── */}
      <div className="pd__related">
        <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
      </div>

    </div>
  );
};

export default Product;
