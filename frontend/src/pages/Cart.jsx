import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets.js';
import './Cart.css';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate, getCartAmount, delivery_fee } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const temp = [];
      for (const id in cartItems) {
        for (const size in cartItems[id]) {
          if (cartItems[id][size] > 0) {
            temp.push({ _id: id, size, quantity: cartItems[id][size] });
          }
        }
      }
      setCartData(temp);
    }
  }, [cartItems, products]);

  const renderThumb = (media, name) => {
    if (!media) return <img src="/default.jpg" alt="Product" />;
    if (media.type === 'video') return <video src={media.url} muted playsInline preload="metadata" />;
    return <img src={media.url} alt={name} />;
  };

  const subtotal = getCartAmount();
  const total = subtotal === 0 ? 0 : subtotal + delivery_fee;

  return (
    <div className="cart">

      {/* ── HEADER ── */}
      <div className="cart__header">
        <div className="cart__eyebrow">
          <span>YOUR CART</span>
        </div>
        <h1 className="cart__title">
          Shopping <span>Bag</span>
        </h1>
      </div>

      <div className="cart__layout">

        {/* ── LEFT — items ── */}
        {cartData.length === 0 ? (
          <div className="cart__empty">
            <span className="cart__empty-icon">🛍️</span>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added any products yet.</p>
            <button className="cart__empty-btn" onClick={() => navigate('/collections')}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="cart__items">

            {/* column headers */}
            <div className="cart__thead">
              <span className="cart__thead-col cart__thead-col--img">Item</span>
              <span className="cart__thead-col cart__thead-col--name">Product</span>
              <span className="cart__thead-col cart__thead-col--price">Price</span>
              <span className="cart__thead-col cart__thead-col--size">Size</span>
              <span className="cart__thead-col cart__thead-col--qty">Qty</span>
              <span className="cart__thead-col cart__thead-col--total">Total</span>
              <span className="cart__thead-col cart__thead-col--del">Remove</span>
            </div>

            {cartData.map((item, index) => {
              const product = products.find(p => p._id === item._id);
              if (!product) return null;
              const firstMedia = product.media?.[0] || { url: '/default.jpg', type: 'image' };
              const lineTotal = Number(product.price) * Number(item.quantity);

              return (
                <div key={index} className="cart__item">

                  {/* thumbnail */}
                  <div className="cart__item-thumb">
                    {renderThumb(firstMedia, product.name)}
                  </div>

                  {/* name */}
                  <div className="cart__item-name-cell">
                    <p className="cart__item-name">{product.name}</p>
                  </div>

                  {/* price */}
                  <div className="cart__item-cell" data-label="Price">
                    <span className="cart__item-price">{currency}{Number(product.price).toLocaleString("en-IN")}</span>
                  </div>

                  {/* size */}
                  <div className="cart__item-cell" data-label="Size">
                    <span className="cart__item-size">{item.size}</span>
                  </div>

                  {/* quantity */}
                  <div className="cart__item-cell" data-label="Qty">
                    <input
                      type="number"
                      min={1}
                      defaultValue={item.quantity}
                      className="cart__item-qty"
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val > 0) updateQuantity(item._id, item.size, val);
                      }}
                    />
                  </div>

                  {/* line total */}
                  <div className="cart__item-cell" data-label="Total">
                    <span className="cart__item-total">{currency}{lineTotal.toLocaleString("en-IN")}</span>
                  </div>

                  {/* delete */}
                  <button
                    className="cart__item-del"
                    onClick={() => updateQuantity(item._id, item.size, 0)}
                    aria-label="Remove item"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                      <path d="M10 11v6"/><path d="M14 11v6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                    <span className="cart__item-del-text">Delete</span>
                  </button>

                </div>
              );
            })}
          </div>
        )}

        {/* ── RIGHT — order summary ── */}
        <div className="cart__summary">

          <h2 className="cart__summary-title">Order Summary</h2>

          <div className="cart__summary-rows">
            <div className="cart__summary-row">
              <span>Subtotal ({cartData.length} items)</span>
              <span>{currency}{subtotal}.00</span>
            </div>
            <div className="cart__summary-row cart__summary-row--free">
              <span>Shipping</span>
              <span>🎉 Free</span>
            </div>
          </div>

          <div className="cart__summary-divider" />

          <div className="cart__summary-total">
            <span>Total</span>
            <span>{currency}{total}.00</span>
          </div>

          {/* checkout */}
          <button
            className="cart__checkout-btn"
            onClick={() => navigate('/place-order')}
            disabled={cartData.length === 0}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            PROCEED TO CHECKOUT
          </button>

          {/* trust badges */}
          <div className="cart__summary-trust">
            <div className="cart__summary-trust-item">
              <span>🔒</span><span>Secure & encrypted checkout</span>
            </div>
            <div className="cart__summary-trust-item">
              <span>🚚</span><span>Free delivery on all orders</span>
            </div>
            <div className="cart__summary-trust-item">
              <span>↩️</span><span>Easy 7-day return policy</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Cart;
