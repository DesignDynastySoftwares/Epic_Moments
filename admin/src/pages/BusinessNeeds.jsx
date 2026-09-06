import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import placeholder from "../assets/upload_area.png";
import "./AdminForm.css";

const BusinessNeeds = ({ token }) => {
  const [media, setMedia] = useState(null);
  const [name, setName] = useState("");
  const [startingPrice, setStartingPrice] = useState(""); // optional
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

    if (!media) return toast.error("Please upload an image");
    if (!name) return toast.error("Enter title");
    if (!category) return toast.error("Select a category");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("media", media);
      if (startingPrice) formData.append("startingPrice", startingPrice);

      const res = await axios.post(
        `${backendUrl}/api/businessneeds/add`,
        formData,
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success("Business Need Added");
        setName("");
        setCategory("");
        setStartingPrice("");
        setMedia(null);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="af-wrap">
      <form onSubmit={onSubmitHandler} className="af-card">
        <div className="af-head">
          <h1>Add Business Need</h1>
          <p>Upload a business service or need with title and category</p>
        </div>

        <div className="af-body">
          <div className="af-upload">
            <span className="af-upload__label">Image / Video</span>
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
            <label>Title</label>
            <input
              type="text"
              placeholder="Enter title"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="af-row">
            <div className="af-field">
              <label>Starting Price (₹) — optional</label>
              <input
                type="number"
                placeholder="e.g. 499"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
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
              {loading ? "Adding..." : "Add Business Need"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BusinessNeeds;
