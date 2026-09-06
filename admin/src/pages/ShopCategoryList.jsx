import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import "./List.css";

const ICON_OPTIONS = [
  { value: "desk",     label: "Desk Decoratives" },
  { value: "wedding",  label: "Wedding Invites" },
  { value: "gift",     label: "Gift Essentials" },
  { value: "album",    label: "Premium Albums" },
  { value: "photo",    label: "Custom Photo Gifts" },
  { value: "wall",     label: "Wall Decoratives" },
  { value: "car",      label: "Car Decoratives" },
  { value: "business", label: "Business Needs" },
  { value: "custom",   label: "Other / Custom" },
];

const ShopCategoryList = ({ token }) => {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({
    name: "", iconType: "desk", order: "0", navigateTo: "/collections", image: null, preview: "",
  });

  const fetchList = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/shopcategory/list`);
      if (res.data.success) setList(res.data.categories);
      else toast.error(res.data.message);
    } catch { toast.error("Failed to fetch"); }
  };

  useEffect(() => { fetchList(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      const res = await axios.post(`${backendUrl}/api/shopcategory/delete`, { id }, { headers: { token } });
      if (res.data.success) { toast.success("Deleted"); fetchList(); }
      else toast.error(res.data.message);
    } catch { toast.error("Delete failed"); }
  };

  const openEdit = (item) => {
    setEditing(item._id);
    setEditData({
      name:       item.name,
      iconType:   item.iconType || "desk",
      order:      item.order ?? 0,
      navigateTo: item.navigateTo || "/collections",
      image:      null,
      preview:    item.image?.url || "",
    });
  };

  const saveEdit = async () => {
    try {
      const fd = new FormData();
      fd.append("id", editing);
      fd.append("name", editData.name);
      fd.append("iconType", editData.iconType);
      fd.append("order", editData.order);
      fd.append("navigateTo", editData.navigateTo);
      if (editData.image) fd.append("image", editData.image);

      const res = await axios.post(`${backendUrl}/api/shopcategory/update`, fd, { headers: { token } });
      if (res.data.success) {
        toast.success("Updated!");
        setEditing(null);
        fetchList();
      } else toast.error(res.data.message);
    } catch { toast.error("Update failed"); }
  };

  return (
    <div className="pl-wrap">
      <div className="pl-head">
        <div className="pl-head__left">
          <h1>Shop Categories</h1>
          <span className="pl-head__count">{list.length} categories</span>
        </div>
      </div>

      <div className="pl-grid">
        {list.map((item) => (
          <div key={item._id} className="pl-gcard">
            <img src={item.image?.url} alt={item.name} className="pl-gcard__img" />
            <div className="pl-gcard__body">
              <p className="pl-gcard__name">{item.name}</p>
              <p className="pl-gcard__meta">Icon: {item.iconType} · Order: {item.order}</p>
              <p className="pl-gcard__nav">→ {item.navigateTo}</p>
              <div className="pl-gcard__actions">
                <button className="pl-btn-edit" onClick={() => openEdit(item)}>Edit</button>
                <button className="pl-btn-del" onClick={() => remove(item._id)} title="Delete">✕</button>
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="pl-empty" style={{ gridColumn: "1 / -1" }}>No categories yet.</div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="pl-modal-overlay" onClick={() => setEditing(null)}>
          <div className="pl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pl-modal__head">Edit Category</div>

            <div className="pl-modal__body">
              <div className="pl-field">
                <label>Image (click preview to change)</label>
                <label style={{ cursor: "pointer", display: "block" }}>
                  {editData.preview && (
                    <img src={editData.preview} alt="preview" className="pl-modal__preview" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files[0];
                      setEditData({ ...editData, image: f, preview: URL.createObjectURL(f) });
                    }}
                  />
                </label>
              </div>

              <div className="pl-field">
                <label>Name</label>
                <input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
              </div>

              <div className="pl-field">
                <label>Icon Type</label>
                <select value={editData.iconType} onChange={(e) => setEditData({ ...editData, iconType: e.target.value })}>
                  {ICON_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="pl-field">
                <label>Navigate To</label>
                <input value={editData.navigateTo} onChange={(e) => setEditData({ ...editData, navigateTo: e.target.value })} />
              </div>

              <div className="pl-field">
                <label>Display Order</label>
                <input type="number" min="0" value={editData.order} onChange={(e) => setEditData({ ...editData, order: e.target.value })} />
              </div>
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

export default ShopCategoryList;
