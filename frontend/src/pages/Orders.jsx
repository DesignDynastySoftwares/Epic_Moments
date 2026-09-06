import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Orders.css';

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatPaymentMethod = (method) => {
    switch ((method || '').toLowerCase()) {
      case 'cod': return 'Cash on Delivery';
      case 'upi': return 'UPI Payment';
      case 'stripe': return 'Card / Stripe';
      case 'razorpay': return 'Paid Online';
      default: return method || '—';
    }
  };

  // status → color class
  const statusClass = (status = '') => {
    const s = status.toLowerCase();
    if (s.includes('deliver')) return 'od-badge--green';
    if (s.includes('ship') || s.includes('out')) return 'od-badge--blue';
    if (s.includes('cancel')) return 'od-badge--red';
    return 'od-badge--pink'; // placed / processing
  };

  const getImg = (item) => {
    if (Array.isArray(item.media) && item.media[0]) return item.media[0].url || item.media[0];
    if (Array.isArray(item.image) && item.image[0]) return item.image[0];
    return null;
  };

  const loadOrderData = async () => {
    if (!token) { setError('You must be logged in to view orders.'); return; }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success && Array.isArray(response.data.orders)) {
        const allOrdersItem = [];
        response.data.orders.forEach((order) => {
          const itemsArray = Array.isArray(order.items) ? order.items : [];
          itemsArray.forEach((item) => {
            allOrdersItem.push({
              ...item,
              _orderId: order._id,
              status: order.status,
              paymentMethod: order.paymentMethod,
              date: order.date,
            });
          });
        });
        setOrderData(allOrdersItem.reverse());
      } else setError(response.data.message || 'Failed to fetch orders');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrderData(); }, [token]);

  return (
    <div className="od">
      <Helmet><title>My Orders | Epic Moments</title></Helmet>

      {/* Hero */}
      <div className="od-hero">
        <span className="od-hero__eyebrow">MY ACCOUNT</span>
        <h1 className="od-hero__title">My <span>Orders</span></h1>
        <p className="od-hero__sub">Track and review all your Epic Moments orders</p>
      </div>

      <div className="od-body">
        {!token ? (
          <div className="od-empty">
            <span className="od-empty__icon">🔒</span>
            <p>Please login to see your orders.</p>
            <button className="od-empty__btn" onClick={() => navigate('/login')}>Login</button>
          </div>
        ) : loading ? (
          <div className="od-loading">
            <span className="od-loading__dot" /><span className="od-loading__dot" /><span className="od-loading__dot" />
          </div>
        ) : error ? (
          <div className="od-empty"><span className="od-empty__icon">⚠️</span><p>{error}</p></div>
        ) : orderData.length === 0 ? (
          <div className="od-empty">
            <span className="od-empty__icon">📦</span>
            <p>No orders yet.</p>
            <button className="od-empty__btn" onClick={() => navigate('/collections')}>Start Shopping</button>
          </div>
        ) : (
          <div className="od-list">
            {orderData.map((item, index) => {
              const img = getImg(item);
              return (
                <div key={item._orderId + '-' + index} className="od-card">
                  {/* image */}
                  <div className="od-card__img">
                    {img ? <img src={img} alt={item.name} loading="lazy" /> : <span>🎁</span>}
                  </div>

                  {/* info */}
                  <div className="od-card__info">
                    <h3 className="od-card__name">{item.name}</h3>
                    <div className="od-card__meta">
                      <span className="od-card__price">{currency}{Number(item.price).toLocaleString('en-IN')}</span>
                      <span className="od-dot">•</span>
                      <span>Qty: {item.quantity}</span>
                      {item.size && item.size !== 'OneSize' && (<><span className="od-dot">•</span><span>Size: {item.size}</span></>)}
                    </div>
                    <div className="od-card__sub">
                      <span>{item.date ? new Date(item.date).toDateString() : 'N/A'}</span>
                      <span className="od-dot">•</span>
                      <span>{formatPaymentMethod(item.paymentMethod)}</span>
                    </div>
                  </div>

                  {/* status */}
                  <div className="od-card__status">
                    <span className={`od-badge ${statusClass(item.status)}`}>
                      <span className="od-badge__dot" />
                      {item.status || 'Order Placed'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
