import React, { useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import placeholder from "../assets/upload_area.png";
import "./AdminForm.css";

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

const ShopCategoryAdd = ({ token }) => {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [iconType, setIconType] = useState("desk");
  const [order, setOrder] = useState("0");
  const [navigateTo, setNavigateTo] = useState("/collections");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!image) return toast.error("Please select an image");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("iconType", iconType);
      fd.append("order", order);
      fd.append("navigateTo", navigateTo);
      fd.append("image", image);

      const res = await axios.post(`${backendUrl}/api/shopcategory/add`, fd, {
        headers: { token },
      });

      if (res.data.success) {
        toast.success("Shop category added!");
        setName(""); setIconType("desk"); setOrder("0");
        setNavigateTo("/collections"); setImage(null);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="af-wrap">
      <form onSubmit={onSubmit} className="af-card">
        <div className="af-head">
          <h1>Add Shop Category</h1>
          <p>Create a shop-by-category tile shown on the homepage</p>
        </div>

        <div className="af-body">
          <div className="af-upload">
            <span className="af-upload__label">Category Image</span>
            <label
              htmlFor="catImg"
              className={`af-upload__box${image ? "" : " af-upload__box--empty"}`}
            >
              <img
                src={image ? URL.createObjectURL(image) : placeholder}
                alt="preview"
              />
              <input
                id="catImg"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setImage(e.target.files[0])}
              />
            </label>
          </div>

          <div className="af-field">
            <label>Category Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Desk Decoratives"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="af-field">
            <label>Icon Type (shown on card)</label>
            <select value={iconType} onChange={(e) => setIconType(e.target.value)}>
              {ICON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="af-row">
            <div className="af-field">
              <label>Navigate To (URL on click)</label>
              <input
                type="text"
                placeholder="/collections"
                value={navigateTo}
                onChange={(e) => setNavigateTo(e.target.value)}
              />
            </div>
            <div className="af-field">
              <label>Display Order (0 = first)</label>
              <input
                type="number"
                min="0"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />
            </div>
          </div>

          <div className="af-actions">
            <button type="submit" className="af-btn" disabled={loading}>
              {loading ? "Adding..." : "Add Category"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ShopCategoryAdd;
