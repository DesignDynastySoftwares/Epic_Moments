import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import QRCode from 'react-qr-code';
import sendOrderMail from '../components/sendOrderMail';
import './PlaceOrder.css';

// Feature flags — kept so old code stays recoverable without deleting it.
const RAZORPAY_ENABLED = true;
const MANUAL_UPI_ENABLED = false; // manual QR (no auto-verify) — Razorpay handles UPI instead

const PAYMENT_METHODS = [
  {
    id: 'razorpay',
    icon: '💳',
    name: 'Pay Online',
    sub: 'UPI, Cards, Net Banking & Wallets — instant & secure',
  },
  {
    id: 'upi',
    icon: '📱',
    name: 'UPI / QR Code',
    sub: 'Scan & pay to our account',
  },
  {
    id: 'cod',
    icon: '💵',
    name: 'Cash on Delivery',
    sub: 'Pay when your order arrives',
  },
].filter(
  (pm) =>
    (pm.id !== 'razorpay' || RAZORPAY_ENABLED) &&
    (pm.id !== 'upi' || MANUAL_UPI_ENABLED)
);

const PlaceOrder = () => {
  const [method, setMethod]                   = useState('razorpay');
  const [upiConfirmed, setUpiConfirmed]       = useState(false);
  const [isPlacingUPI, setIsPlacingUPI]       = useState(false);

  const {
    navigate, backendUrl, token,
    cartItems, setCartItems,
    getCartAmount, products,
  } = useContext(ShopContext);

  const [form, setForm] = useState({
    firstName: '', lastName: '',
    email: '', street: '',
    city: '', state: '',
    zipcode: '', country: '',
    phone: '',
  });

  const onChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const buildItems = () => {
    const items = [];
    for (const id in cartItems) {
      for (const size in cartItems[id]) {
        if (cartItems[id][size] > 0) {
          const p = products.find(p => p._id === id);
          if (p) items.push({ ...JSON.parse(JSON.stringify(p)), size, quantity: cartItems[id][size] });
        }
      }
    }
    return items;
  };

  const sendEmail = async (items) => {
    try {
      await sendOrderMail({ items, address: form, amount: getCartAmount() });
    } catch (e) { console.error(e); }
  };

  const playSound = () => {
    const a = new Audio('/darklord.mp3');
    a.volume = 0.7;
    a.play().catch(() => {});
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) { toast.error('Please login first.'); navigate('/login'); return; }
    if (method === 'upi' && !upiConfirmed) {
      toast.error('Please confirm UPI payment first.'); return;
    }

    const items = buildItems();
    const payload = { address: form, items, amount: getCartAmount(), payment_method: method };

    try {
      if (method === 'cod') {
        const { data } = await axios.post(`${backendUrl}/api/order/place`, payload, { headers: { Authorization: `Bearer ${token}` } });
        if (data.success) { await sendEmail(items); setCartItems({}); playSound(); toast.success('Order placed!'); navigate('/orders'); }
        else toast.error(data.message);
      }
      if (method === 'razorpay') {
        // Razorpay checkout script must be loaded
        if (typeof window.Razorpay === 'undefined') {
          toast.error('Payment library not loaded. Please refresh the page.');
          return;
        }
        console.log('Creating Razorpay order...', payload);
        const { data } = await axios.post(`${backendUrl}/api/order/razorpay`, payload, { headers: { Authorization: `Bearer ${token}` } });
        console.log('Razorpay order response:', data);
        if (data.success && data.order) {
          initPay(data.order, items);
        } else {
          toast.error(data.message || 'Could not start payment');
        }
      }
    } catch (err) {
      console.error('Place order error:', err.response?.data || err);
      toast.error(err.response?.data?.message || err.message || 'Failed to place order');
    }
  };

  const initPay = (order, items) => {
    const opts = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Epic Moments',
      description: 'Order Payment',
      order_id: order.id,
      prefill: {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        contact: form.phone,
      },
      theme: { color: '#e8157e' },
      handler: async (res) => {
        // res contains razorpay_order_id, razorpay_payment_id, razorpay_signature
        try {
          const { data } = await axios.post(
            `${backendUrl}/api/order/verifyRazorpay`,
            res,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (data.success) {
            await sendEmail(items);
            setCartItems({});
            playSound();
            toast.success('Payment successful! Order confirmed.');
            navigate('/orders');
          } else {
            toast.error(data.message || 'Payment verification failed');
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Payment verification failed');
        }
      },
      modal: {
        ondismiss: () => toast.info('Payment cancelled'),
      },
    };
    new window.Razorpay(opts).open();
  };

  const placeUPI = async () => {
    setIsPlacingUPI(true);
    const items = buildItems();
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/order/place`,
        { address: form, items, amount: getCartAmount(), payment_method: 'upi' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) { await sendEmail(items); playSound(); toast.success('UPI Order Placed!'); setCartItems({}); navigate('/orders'); }
      else toast.error(data.message);
    } catch (err) { toast.error('Failed to place UPI order'); }
    finally { setIsPlacingUPI(false); }
  };

  const subtotal = getCartAmount();
  const total    = subtotal === 0 ? 0 : subtotal;

  const inputClass = 'po__input';

  return (
    <div className="po">

      {/* ── HEADER ── */}
      <div className="po__header">
        <div className="po__eyebrow"><span>CHECKOUT</span></div>
        <h1 className="po__title">Place Your <span>Order</span></h1>
      </div>

      {/* ── STEPS ── */}
      <div className="po__steps">
        <div className="po__step po__step--done">
          <span className="po__step-num">✓</span><span>Cart</span>
        </div>
        <span className="po__step-arrow">›</span>
        <div className="po__step po__step--active">
          <span className="po__step-num">2</span><span>Delivery</span>
        </div>
        <span className="po__step-arrow">›</span>
        <div className="po__step">
          <span className="po__step-num">3</span><span>Payment</span>
        </div>
        <span className="po__step-arrow">›</span>
        <div className="po__step">
          <span className="po__step-num">4</span><span>Confirmation</span>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="po__layout">

          {/* ── LEFT ── */}
          <div>

            {/* Delivery info */}
            <div className="po__card">
              <h2 className="po__card-title">
                <span className="po__card-icon">📦</span>
                Delivery Information
              </h2>

              <div className="po__form-row">
                <div className="po__form-group">
                  <label className="po__label">First Name</label>
                  <input required name="firstName" value={form.firstName} onChange={onChange} placeholder="John" className={inputClass} />
                </div>
                <div className="po__form-group">
                  <label className="po__label">Last Name</label>
                  <input required name="lastName" value={form.lastName} onChange={onChange} placeholder="Doe" className={inputClass} />
                </div>
                <div className="po__form-group po__form-group--full">
                  <label className="po__label">Email Address</label>
                  <input required type="email" name="email" value={form.email} onChange={onChange} placeholder="john@example.com" className={inputClass} />
                </div>
                <div className="po__form-group po__form-group--full">
                  <label className="po__label">Street Address</label>
                  <input required name="street" value={form.street} onChange={onChange} placeholder="123, MG Road" className={inputClass} />
                </div>
                <div className="po__form-group">
                  <label className="po__label">City</label>
                  <input required name="city" value={form.city} onChange={onChange} placeholder="Mumbai" className={inputClass} />
                </div>
                <div className="po__form-group">
                  <label className="po__label">State</label>
                  <input name="state" value={form.state} onChange={onChange} placeholder="Maharashtra" className={inputClass} />
                </div>
                <div className="po__form-group">
                  <label className="po__label">Pincode</label>
                  <input required name="zipcode" value={form.zipcode} onChange={onChange} placeholder="400001" className={inputClass} />
                </div>
                <div className="po__form-group">
                  <label className="po__label">Country</label>
                  <input required name="country" value={form.country} onChange={onChange} placeholder="India" className={inputClass} />
                </div>
                <div className="po__form-group po__form-group--full">
                  <label className="po__label">Phone Number</label>
                  <input required type="tel" name="phone" value={form.phone} onChange={onChange} placeholder="+91 98765 43210" className={inputClass} />
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT — summary ── */}
          <div className="po__summary">
            <h2 className="po__summary-title">Order Summary</h2>

            {/* Payment method — 2 equal boxes */}
            <div className="po__pay">
              <p className="po__pay-label">Payment Method</p>
              <div className="po__pay-grid">
                {PAYMENT_METHODS.map(pm => (
                  <button
                    type="button"
                    key={pm.id}
                    className={`po__pay-box${method === pm.id ? ' po__pay-box--active' : ''}`}
                    onClick={() => setMethod(pm.id)}
                  >
                    <span className="po__pay-box-icon">{pm.icon}</span>
                    <span className="po__pay-box-name">{pm.name}</span>
                    <span className="po__pay-box-sub">{pm.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="po__summary-divider" />

            <div className="po__summary-rows">
              <div className="po__summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal}.00</span>
              </div>
              <div className="po__summary-row po__summary-row--free">
                <span>Shipping</span>
                <span>🎉 Free</span>
              </div>
            </div>

            <div className="po__summary-divider" />

            <div className="po__summary-total">
              <span>Total</span>
              <span>₹{total}.00</span>
            </div>

            {/* place order button */}
            {method !== 'upi' && (
              <button type="submit" className="po__place-btn">
                {method === 'razorpay' ? (
                  <>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                      stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    PAY ₹{total} SECURELY
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                      stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    PLACE ORDER
                  </>
                )}
              </button>
            )}

            {method === 'upi' && !upiConfirmed && (
              <button type="button" className="po__place-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                Complete UPI Payment First
              </button>
            )}
          </div>

        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;
