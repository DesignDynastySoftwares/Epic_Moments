import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import "./AdminForm.css";

const Catagere = ({ token }) => {
  const [media, setMedia] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!media) {
      toast.error("Please select an image, video, or gif file");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("media", media);

      const response = await axios.post(`${backendUrl}/api/catagere/add`, formData, {
        headers: { token },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setMedia(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="af-wrap">
      <form onSubmit={onSubmitHandler} className="af-card">
        <div className="af-head">
          <h1>Add Catagere Image</h1>
          <p>Upload a category tile image with its name</p>
        </div>

        <div className="af-body">
          <div className="af-upload">
            <span className="af-upload__label">Image / Video / Gif</span>
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
                <img src={assets.upload_area} alt="upload" />
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
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="af-actions">
            <button type="submit" className="af-btn" disabled={loading}>
              {loading ? "Adding..." : "Add Catagere"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Catagere;
