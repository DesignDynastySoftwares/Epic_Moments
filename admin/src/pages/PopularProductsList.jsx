import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import "./List.css";

const PopularProductsList = ({ token }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch all popular products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/popular/list`);
      if (res.data.success) {
        setProducts(res.data.popularProducts.reverse());
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch popular products");
    }
  };

  // Remove a popular product
  const removeProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await axios.post(
        `${backendUrl}/api/popular/remove`,
        { id },
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success("Popular product removed");
        fetchProducts();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error removing product");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = products.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.name?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q)
    );
  });

  const renderThumb = (item) => {
    const mediaUrl = item?.image && item.image.length > 0 ? item.image[0] : null;
    const isVideo = mediaUrl
      ? mediaUrl.endsWith(".mp4") || mediaUrl.endsWith(".mov") || mediaUrl.includes("video")
      : false;
    return (
      <div className="pl-thumb">
        {mediaUrl ? (
          isVideo ? (
            <video src={mediaUrl} muted loop playsInline />
          ) : (
            <img src={mediaUrl} alt={item.name} />
          )
        ) : (
          <span className="pl-thumb__ph">No media</span>
        )}
      </div>
    );
  };

  return (
    <div className="pl-wrap">
      {/* Header */}
      <div className="pl-head">
        <div className="pl-head__left">
          <h1>Best Sellers List</h1>
          <span className="pl-head__count">{products.length} products</span>
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
        <div className="pl-thead pl-thead--pop">
          <span>Media</span>
          <span>Name</span>
          <span>Category</span>
          <span>Rating</span>
          <span>Purchases</span>
          <span style={{ textAlign: "right" }}>Action</span>
        </div>

        {filtered.length === 0 && (
          <div className="pl-empty">No best sellers found.</div>
        )}

        {filtered.map((item) => (
          <div key={item._id} className="pl-row pl-row--pop">
            {renderThumb(item)}

            <div className="pl-cell-name">
              <p className="pl-name">{item.name ?? "Unnamed Product"}</p>
            </div>

            <div className="pl-cell-meta">
              <span className="pl-cat">{item.category || "—"}</span>
            </div>

            <span className="pl-sizes">
              ⭐ {Number(item.rating ?? 0).toFixed(1)}
              {item.ratingCount ? ` (${item.ratingCount})` : ""}
            </span>

            <span className="pl-sizes">
              {item.purchases ? `${Number(item.purchases).toLocaleString("en-IN")}+` : "0"}
            </span>

            <div className="pl-actions">
              <button
                className="pl-btn-edit"
                onClick={() => navigate(`/PopularProducts?edit=${item._id}`)}
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
        ))}
      </div>
    </div>
  );
};

export default PopularProductsList;
