import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import "./List.css";

const WallDecorativesList = ({ token }) => {
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
    media: null,
    preview: "",
  });

  const fetchList = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/walldecoratives/list`);
      if (res.data.success) setList(res.data.products);
    } catch {
      toast.error("Failed to load list");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/category`);
      if (res.data.success) setCategoryList(res.data.categories);
    } catch {}
  };

  useEffect(() => {
    fetchList();
    fetchCategories();
  }, []);

  const removeItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      const res = await axios.post(
        `${backendUrl}/api/walldecoratives/delete`,
        { id },
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success("Deleted Successfully");
        fetchList();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const openEdit = (item) => {
    setEditing(item._id);
    setEditData({
      name: item.name,
      originalPrice: item.originalPrice,
      offerPrice: item.offerPrice || "",
      days: item.days || "",
      category: item.category,
      preview: item.media.url,
      media: null,
    });
  };

  const saveEdit = async () => {
    if (editData.offerPrice && Number(editData.offerPrice) >= Number(editData.originalPrice)) {
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

      if (editData.media) formData.append("media", editData.media);

      const res = await axios.post(
        `${backendUrl}/api/walldecoratives/update`,
        formData,
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success("Updated Successfully");
        setEditing(null);
        fetchList();
      }
    } catch {
      toast.error("Update failed");
    }
  };

  const filtered = filterCategory
    ? list.filter((item) => item.category === filterCategory)
    : list;

  const editDiscount =
    editData.originalPrice && editData.offerPrice && Number(editData.originalPrice) > 0
      ? Math.round(((Number(editData.originalPrice) - Number(editData.offerPrice)) / Number(editData.originalPrice)) * 100)
      : null;

  return (
    <div className="pl-wrap">
      {/* Header */}
      <div className="pl-head">
        <div className="pl-head__left">
          <h1>Wall Decoratives List</h1>
          <span className="pl-head__count">{list.length} products</span>
        </div>
        <select
          className="pl-filter"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categoryList.map((cat) => (
            <option key={cat._id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="pl-table">
        <div className="pl-thead pl-thead--pop">
          <span>Media</span>
          <span>Name</span>
          <span>Original</span>
          <span>Offer</span>
          <span>Category</span>
          <span style={{ textAlign: "right" }}>Action</span>
        </div>

        {filtered.length === 0 && (
          <div className="pl-empty">No wall decoratives found.</div>
        )}

        {filtered.map((item) => (
          <div key={item._id} className="pl-row pl-row--pop">
            <div className="pl-thumb">
              {item.media?.url ? (
                /\.(mp4|mov|webm)$/i.test(item.media.url) || item.media?.type === "video" ? (
                  <video src={item.media.url} muted loop playsInline />
                ) : (
                  <img src={item.media.url} alt={item.name} />
                )
              ) : (
                <span className="pl-thumb__ph">No media</span>
              )}
            </div>

            <div className="pl-cell-name">
              <p className="pl-name">{item.name}</p>
            </div>

            <span className="pl-price-old">₹{item.originalPrice}</span>
            <span className="pl-price-offer">
              {item.offerPrice ? `₹${item.offerPrice}` : "—"}
            </span>

            <div className="pl-cell-meta">
              <span className="pl-cat">{item.category}</span>
            </div>

            <div className="pl-actions">
              <button className="pl-btn-edit" onClick={() => openEdit(item)}>Edit</button>
              <button className="pl-btn-del" onClick={() => removeItem(item._id)} title="Delete">✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="pl-modal-overlay" onClick={() => setEditing(null)}>
          <div className="pl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pl-modal__head">Edit Wall Decorative</div>

            <div className="pl-modal__body">
              <div className="pl-field">
                <label>Name</label>
                <input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
              </div>

              <div className="pl-field">
                <label>Original Price</label>
                <input type="number" value={editData.originalPrice} onChange={(e) => setEditData({ ...editData, originalPrice: e.target.value })} />
              </div>

              <div className="pl-field">
                <label>Offer Price</label>
                <input type="number" value={editData.offerPrice} onChange={(e) => setEditData({ ...editData, offerPrice: e.target.value })} />
              </div>

              {editDiscount !== null && (
                <p style={{ fontSize: "0.8rem", marginBottom: "12px" }}>
                  Discount on card:{" "}
                  <b style={{ color: Number(editData.offerPrice) < Number(editData.originalPrice) ? "#059669" : "#dc2626" }}>
                    {editDiscount}% OFF
                  </b>
                </p>
              )}

              <div className="pl-field">
                <label>Days</label>
                <input type="number" value={editData.days} onChange={(e) => setEditData({ ...editData, days: e.target.value })} />
              </div>

              <div className="pl-field">
                <label>Category</label>
                <select value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })}>
                  <option value="">-- Select Category --</option>
                  {categoryList.map((cat) => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="pl-field">
                <label>Change Media</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      media: e.target.files[0],
                      preview: URL.createObjectURL(e.target.files[0]),
                    })
                  }
                />
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

export default WallDecorativesList;
