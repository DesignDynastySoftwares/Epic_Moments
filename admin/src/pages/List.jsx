import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import './List.css';

const List = ({ token }) => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');

  // Fetch all products from backend
  const fetchList = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/product/list`);
      if (res.data.success) {
        // Reverse order to show latest first
        setList(res.data.products.reverse());
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Failed to fetch product list");
    }
  };

  // Remove product
  const removeProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        fetchList();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    }
  };

  // Generate keywords for product (example external API call)
  const generateKeyword = async (name, description) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/keyword/generate`,
        { name, description },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success('Keyword generated successfully');
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Keyword generation failed');
      console.error(err);
    }
  };

  // Handle review edits locally
  const handleReviewChange = (productId, index, field, value) => {
    setList((prevList) =>
      prevList.map((item) =>
        item._id === productId
          ? {
              ...item,
              reviews: item.reviews.map((rev, i) =>
                i === index ? { ...rev, [field]: field === 'rating' ? Number(value) : value } : rev
              ),
            }
          : item
      )
    );
  };

  // Add new review locally (to UI)
  const handleAddReview = (productId) => {
    setList((prevList) =>
      prevList.map((item) =>
        item._id === productId
          ? {
              ...item,
              reviews: [...(item.reviews || []), { reviewer: '', comment: '', rating: 5 }],
            }
          : item
      )
    );
    setExpanded(productId);
  };

  // Delete review with backend update
  const handleDeleteReview = async (productId, index) => {
    const product = list.find((item) => item._id === productId);
    if (!product) return;

    const updatedReviews = product.reviews.filter((_, i) => i !== index);

    try {
      const res = await axios.put(
        `${backendUrl}/api/product/update-reviews/${productId}`,
        { reviews: updatedReviews },
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success('Review deleted');
        setList((prev) =>
          prev.map((item) => (item._id === productId ? { ...item, reviews: updatedReviews } : item))
        );
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete review');
    }
  };

  // Save all reviews edits to backend
  const handleUpdateReview = async (productId, reviews) => {
    for (const rev of reviews) {
      if (
        !rev.reviewer.trim() ||
        !rev.comment.trim() ||
        isNaN(rev.rating) ||
        rev.rating < 0 ||
        rev.rating > 5
      ) {
        toast.error('Please fill all review fields correctly (rating 0-5).');
        return;
      }
    }

    try {
      const res = await axios.put(
        `${backendUrl}/api/product/update-reviews/${productId}`,
        { reviews },
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success('Reviews updated');
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update reviews');
    }
  };

  // Calculate average rating with 1 decimal point
  const getAverageRating = (reviews = []) => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((acc, rev) => acc + Number(rev.rating), 0);
    return (total / reviews.length).toFixed(1);
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filteredList = list.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.name?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q)
    );
  });

  const renderThumb = (item) => (
    <div className="pl-thumb">
      {item.media?.length > 0 ? (
        item.media[0].type === 'image' ? (
          <img src={item.media[0].url} alt={item.name} />
        ) : item.media[0].type === 'video' ? (
          <video src={item.media[0].url} muted loop playsInline />
        ) : item.media[0].type === 'audio' ? (
          <span className="pl-thumb__ph">🎵 Audio</span>
        ) : (
          <span className="pl-thumb__ph">No preview</span>
        )
      ) : (
        <span className="pl-thumb__ph">No media</span>
      )}
    </div>
  );

  return (
    <div className="pl-wrap">
      {/* Header */}
      <div className="pl-head">
        <div className="pl-head__left">
          <h1>All Products List</h1>
          <span className="pl-head__count">{list.length} products</span>
        </div>
        <div className="pl-search">
          <FaSearch className="pl-search__icon" />
          <input
            type="text"
            placeholder="Search by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="pl-table">
        <div className="pl-thead">
          <span>Media</span>
          <span>Name</span>
          <span>Category</span>
          <span>Price</span>
          <span>Sizes</span>
          <span>Reviews</span>
          <span style={{ textAlign: 'right' }}>Action</span>
        </div>

        {filteredList.length === 0 && (
          <div className="pl-empty">No products found.</div>
        )}

        {filteredList.map((item) => (
          <div key={item._id}>
            <div className="pl-row">
              {renderThumb(item)}

              <div className="pl-cell-name">
                <p className="pl-name">{item.name}</p>
              </div>

              <div className="pl-cell-meta">
                <span className="pl-cat">{item.category}</span>
                <span className="pl-price">
                  {currency}
                  {item.price}
                </span>
                <span className="pl-sizes">{item.sizes?.join(', ')}</span>
              </div>

              <div className="pl-reviews">
                <span className="pl-reviews__stat">
                  <b>{item.reviews?.length || 0}</b> reviews · ⭐{' '}
                  {getAverageRating(item.reviews)}
                </span>
                <button
                  className="pl-chip-btn pl-chip-btn--view"
                  onClick={() => setExpanded(expanded === item._id ? null : item._id)}
                >
                  {expanded === item._id ? 'Hide reviews' : 'View / Edit reviews'}
                </button>
                <button
                  className="pl-chip-btn pl-chip-btn--kw"
                  onClick={() => generateKeyword(item.name, item.description)}
                  disabled={!item.description}
                >
                  ⚡ Generate Keyword
                </button>
              </div>

              <div className="pl-actions">
                <button
                  className="pl-btn-edit"
                  onClick={() => navigate(`/add?edit=${item._id}`)}
                  title="Edit Product"
                >
                  Edit
                </button>
                <button
                  className="pl-btn-del"
                  onClick={() => removeProduct(item._id)}
                  title="Delete Product"
                >
                  ✕
                </button>
              </div>
            </div>

            {expanded === item._id && (
              <div className="pl-reviews-panel">
                <p className="pl-reviews-panel__title">Reviews for {item.name}</p>

                <button
                  className="pl-btn-add-rev"
                  onClick={() => handleAddReview(item._id)}
                >
                  + Add Review
                </button>

                {item.reviews?.map((rev, i) => (
                  <div key={i} className="pl-rev-card">
                    <button
                      className="pl-rev-del"
                      onClick={() => handleDeleteReview(item._id, i)}
                      title="Delete Review"
                    >
                      ✕
                    </button>

                    <input
                      type="text"
                      value={rev.reviewer}
                      onChange={(e) =>
                        handleReviewChange(item._id, i, 'reviewer', e.target.value)
                      }
                      placeholder="Reviewer"
                    />
                    <textarea
                      value={rev.comment}
                      onChange={(e) =>
                        handleReviewChange(item._id, i, 'comment', e.target.value)
                      }
                      placeholder="Comment"
                      rows={2}
                    />
                    <input
                      type="number"
                      value={rev.rating}
                      onChange={(e) =>
                        handleReviewChange(item._id, i, 'rating', e.target.value)
                      }
                      min="0"
                      max="5"
                      step="0.1"
                      placeholder="Rating"
                    />
                  </div>
                ))}

                <button
                  className="pl-btn-save-rev"
                  onClick={() => handleUpdateReview(item._id, item.reviews)}
                >
                  Save Reviews
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;
