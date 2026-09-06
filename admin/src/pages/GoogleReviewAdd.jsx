import React, { useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import placeholder from "../assets/upload_area.png";
import "./AdminForm.css";

const GoogleReviewAdd = ({ token }) => {
  const [name, setName] = useState("");
  const [rating, setRating] = useState("");
  const [review, setReview] = useState("");
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!name || !rating || !review)
      return toast.error("All fields except image are required");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("rating", rating);
      formData.append("review", review);
      if (media) formData.append("media", media);

      const res = await axios.post(
        `${backendUrl}/api/googlereviews/add`,
        formData,
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success("Review Added Successfully");
        setName("");
        setRating("");
        setReview("");
        setMedia(null);
      }
    } catch (err) {
      toast.error("Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  const isVideo = media && /\.(mp4|mov|webm)$/i.test(media.name);

  return (
    <div className="af-wrap">
      <form onSubmit={submitHandler} className="af-card">
        <div className="af-head">
          <h1>Add Customer Review</h1>
          <p>Add a review shown in the "What Our Customers Say" section</p>
        </div>

        <div className="af-body">
          <div className="af-upload">
            <span className="af-upload__label">Customer Photo / Video (optional)</span>
            <label
              htmlFor="reviewImage"
              className={`af-upload__box${media ? "" : " af-upload__box--empty"}`}
            >
              {media ? (
                isVideo ? (
                  <video src={URL.createObjectURL(media)} autoPlay loop muted />
                ) : (
                  <img src={URL.createObjectURL(media)} alt="preview" />
                )
              ) : (
                <img src={placeholder} alt="upload" />
              )}
              <input
                type="file"
                id="reviewImage"
                accept="image/*,video/*"
                hidden
                onChange={(e) => setMedia(e.target.files[0])}
              />
            </label>
          </div>

          <div className="af-row">
            <div className="af-field">
              <label>Customer Name</label>
              <input
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="af-field">
              <label>Rating (1–5)</label>
              <input
                type="number"
                placeholder="e.g. 5"
                value={rating}
                min="1"
                max="5"
                onChange={(e) => setRating(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="af-field">
            <label>Review</label>
            <textarea
              placeholder="Write review..."
              rows="3"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              required
              style={{
                border: "1px solid #e6d3de",
                borderRadius: "9px",
                padding: "10px 12px",
                fontSize: "0.9rem",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div className="af-actions">
            <button type="submit" className="af-btn" disabled={loading}>
              {loading ? "Adding..." : "Add Review"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default GoogleReviewAdd;
