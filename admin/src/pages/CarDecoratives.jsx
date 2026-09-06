import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import placeholder from "../assets/upload_area.png";
import "./AdminForm.css";

const CarDecoratives = ({ token }) => {
  const [media, setMedia] = useState(null);
  const [name, setName] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [days, setDays] = useState("");
  const [category, setCategory] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/category`);
        if (res.data.success) setCategoryList(res.data.categories);
      } catch (err) {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!media) return toast.error("Please upload media");
    if (!category) return toast.error("Select a category");
    if (offerPrice && Number(offerPrice) >= Number(originalPrice)) {
      return toast.error("Offer Price must be lower than Original Price");
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("originalPrice", originalPrice);
      formData.append("offerPrice", offerPrice);
      formData.append("days", days);
      formData.append("category", category);
      formData.append("media", media);

      const res = await axios.post(
        `${backendUrl}/api/cardecoratives/add`,
        formData,
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success("Car Decorative Added Successfully");
        setName("");
        setOriginalPrice("");
        setOfferPrice("");
        setDays("");
        setMedia(null);
        setCategory("");
      } else toast.error(res.data.message);
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const discount =
    originalPrice && offerPrice && Number(originalPrice) > 0
      ? Math.round(((Number(originalPrice) - Number(offerPrice)) / Number(originalPrice)) * 100)
      : null;
  const discountOk = discount !== null && Number(offerPrice) < Number(originalPrice);

  return (
    <div className="af-wrap">
      <form onSubmit={onSubmitHandler} className="af-card">
        <div className="af-head">
          <h1>Add Car Decorative</h1>
          <p>Upload a product with pricing and category details</p>
        </div>

        <div className="af-body">
          <div className="af-upload">
            <span className="af-upload__label">Product Media (image / video)</span>
            <label
              htmlFor="mediaUpload"
              className={`af-upload__box${media ? "" : " af-upload__box--empty"}`}
            >
              {media ? (
                media.type.startsWith("video") ? (
                  <video src={URL.createObjectURL(media)} muted />
                ) : (
                  <img src={URL.createObjectURL(media)} alt="preview" />
                )
              ) : (
                <img src={placeholder} alt="upload" />
              )}
              <input
                type="file"
                id="mediaUpload"
                accept="image/*,video/*,gif/*"
                hidden
                onChange={(e) => setMedia(e.target.files[0])}
              />
            </label>
          </div>

          <div className="af-field">
            <label>Product Name</label>
            <input
              type="text"
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="af-row">
            <div className="af-field">
              <label>Original Price (₹)</label>
              <input
                type="number"
                placeholder="e.g. 1000"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                required
              />
            </div>
            <div className="af-field">
              <label>Offer Price (₹) — optional</label>
              <input
                type="number"
                placeholder="e.g. 799"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
              />
            </div>
          </div>

          {discount !== null && (
            <p className={`af-discount ${discountOk ? "af-discount--ok" : "af-discount--bad"}`}>
              Discount on card: <b>{discount}% OFF</b>
              {!discountOk && " — Offer price must be lower!"}
            </p>
          )}

          <div className="af-row">
            <div className="af-field">
              <label>Days (optional)</label>
              <input
                type="number"
                placeholder="e.g. 5"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>
            <div className="af-field">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">-- Select Category --</option>
                {categoryList.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="af-actions">
            <button type="submit" className="af-btn" disabled={loading}>
              {loading ? "Adding..." : "Add Car Decorative"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CarDecoratives;
