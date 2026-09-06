import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import "./List.css";

const OfferProductsList = ({ token }) => {
  const [list, setList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    originalPrice: "",
    offerPrice: "",
    days: "",
    category: "",
    isBestseller: false,
    rating: "4.9",
    tagline: "Personalized with love",
    media: null,
    preview: "",
  });

  // Fetch products
  const fetchList = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/offer/list`);
      if (res.data.success) setList(res.data.products);
      else toast.error(res.data.message);
    } catch (err) {
      toast.error("Failed to fetch offer products");
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/category`);
      if (res.data.success) setCategoryList(res.data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchList();
    fetchCategories();
  }, []);

  const removeProduct = async (id) => {
    if (!window.confirm("Delete this offer product?")) return;
    try {
      const res = await axios.post(`${backendUrl}/api/offer/delete`, { id }, { headers: { token } });
      if (res.data.success) {
        toast.success("Deleted");
        fetchList();
      } else toast.error(res.data.message);
    } catch {
      toast.error("Delete failed");
    }
  };

  const openEdit = (item) => {
    setEditing(item._id);
    setEditData({
      name: item.name,
      originalPrice: item.originalPrice,
      offerPrice: item.offerPrice,
      days: item.days || "",
      category: item.category || "",
      isBestseller: item.isBestseller || false,
      rating: item.rating ?? 4.9,
      tagline: item.tagline || "Personalized with love",
      media: null,
      preview: item.media?.url || "",
    });
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    setEditData(prev => ({ ...prev, media: file, preview: URL.createObjectURL(file) }));
  };

  const saveEdit = async () => {
    if (Number(editData.offerPrice) >= Number(editData.originalPrice)) {
      return toast.error("Offer Price must be lower than Original Price");
    }
    try {
      const formData = new FormData();
      formData.append("id", editing);
      formData.append("name", editData.name);
      formData.append("originalPrice", editData.originalPrice);
      formData.append("offerPrice", editData.offerPrice);
      formData.append("days", editData.days);
      formData.append("category", editData.category);
      formData.append("isBestseller", editData.isBestseller);
      formData.append("rating", editData.rating);
      formData.append("tagline", editData.tagline);
      if (editData.media) formData.append("media", editData.media);

      const res = await axios.post(`${backendUrl}/api/offer/update`, formData, { headers: { token } });

      if (res.data.success) {
        toast.success("Offer product updated");
        setEditing(null);
        fetchList();
      } else toast.error(res.data.message);
    } catch {
      toast.error("Update failed");
    }
  };

  // Filtered products
  const filteredList = filterCategory
    ? list.filter(item => item.category === filterCategory)
    : list;

  return (
    <div className="pl-wrap">
      {/* Header */}
      <div className="pl-head">
        <div className="pl-head__left">
          <h1>Combo Offers List</h1>
          <span className="pl-head__count">{list.length} products</span>
        </div>
        <select
          className="pl-filter"
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categoryList.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="pl-table">
        <div className="pl-thead pl-thead--offer">
          <span>Media</span>
          <span>Name</span>
          <span>Original</span>
          <span>Offer</span>
          <span>Rating</span>
          <span>Bestseller</span>
          <span style={{ textAlign: "right" }}>Action</span>
        </div>

        {filteredList.length === 0 && (
          <div className="pl-empty">No combo offers found.</div>
        )}

        {filteredList.map(item => (
          <div key={item._id} className="pl-row pl-row--offer">
            <div className="pl-thumb">
              {item.media?.type === "image" ? (
                <img src={item.media.url} alt={item.name} />
              ) : item.media?.type === "video" ? (
                <video src={item.media.url} muted loop playsInline />
              ) : (
                <span className="pl-thumb__ph">No media</span>
              )}
            </div>

            <div className="pl-cell-name">
              <p className="pl-name">{item.name}</p>
            </div>

            <span className="pl-price-old">₹{item.originalPrice}</span>
            <span className="pl-price-offer">₹{item.offerPrice}</span>
            <span className="pl-sizes">⭐ {item.rating ?? 4.9}</span>

            <div className="pl-cell-meta">
              {item.isBestseller ? (
                <span className="pl-badge-yes">✓ Bestseller</span>
              ) : (
                <span className="pl-badge-no">No</span>
              )}
            </div>

            <div className="pl-actions">
              <button className="pl-btn-edit" onClick={() => openEdit(item)}>Edit</button>
              <button className="pl-btn-del" onClick={() => removeProduct(item._id)} title="Delete">✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="pl-modal-overlay" onClick={() => setEditing(null)}>
          <div className="pl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pl-modal__head">Edit Combo Offer</div>

            <div className="pl-modal__body">
              <div className="pl-field">
                <label>Name</label>
                <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
              </div>

              <div className="pl-field">
                <label>Original Price</label>
                <input type="number" value={editData.originalPrice} onChange={e => setEditData({...editData, originalPrice: e.target.value})} />
              </div>

              <div className="pl-field">
                <label>Offer Price</label>
                <input type="number" value={editData.offerPrice} onChange={e => setEditData({...editData, offerPrice: e.target.value})} />
              </div>

              {editData.originalPrice && editData.offerPrice && Number(editData.originalPrice) > 0 && (
                <p style={{ fontSize: "0.8rem", marginBottom: "12px" }}>
                  Discount on card:{" "}
                  <b style={{ color: Number(editData.offerPrice) < Number(editData.originalPrice) ? "#059669" : "#dc2626" }}>
                    {Math.round(((Number(editData.originalPrice) - Number(editData.offerPrice)) / Number(editData.originalPrice)) * 100)}% OFF
                  </b>
                </p>
              )}

              <div className="pl-field">
                <label>Days</label>
                <input type="number" value={editData.days} onChange={e => setEditData({...editData, days: e.target.value})} />
              </div>

              <div className="pl-field">
                <label>Category</label>
                <select value={editData.category} onChange={e => setEditData({...editData, category: e.target.value})}>
                  <option value="">-- Select Category --</option>
                  {categoryList.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>

              <div className="pl-field">
                <label>Tagline</label>
                <input type="text" value={editData.tagline} placeholder="e.g. Personalized with love" onChange={e => setEditData({...editData, tagline: e.target.value})} />
              </div>

              <div className="pl-field">
                <label>Rating (0–5)</label>
                <input type="number" step="0.1" min="0" max="5" value={editData.rating} onChange={e => setEditData({...editData, rating: e.target.value})} />
              </div>

              <label className="pl-check">
                <input
                  type="checkbox"
                  checked={editData.isBestseller}
                  onChange={e => setEditData({...editData, isBestseller: e.target.checked})}
                  className="accent-pink-500"
                />
                <span>Mark as Bestseller</span>
              </label>

              <div className="pl-field">
                <label>Change Media</label>
                <input type="file" accept="image/*,video/*" onChange={handleMediaChange} />
              </div>

              {editData.preview && (
                <img src={editData.preview} className="pl-modal__preview" alt="preview" />
              )}
            </div>

            <div className="pl-modal__foot">
              <button className="pl-btn-cancel" onClick={() => setEditing(null)}>Cancel</button>
              <button className="pl-btn-save" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferProductsList;
