import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import "./List.css";

const GoogleReviewList = ({ token }) => {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);

  const [editData, setEditData] = useState({
    name: "",
    rating: "",
    review: "",
    media: null,
    preview: "",
  });

  const fetchList = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/googlereviews/list`);
      if (res.data.success) setList(res.data.data);
    } catch {
      toast.error("Failed to fetch reviews");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const deleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      const res = await axios.post(
        `${backendUrl}/api/googlereviews/delete`,
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
      rating: item.rating,
      review: item.review,
      media: null,
      preview: item.media?.url || "",
    });
  };

  const saveEdit = async () => {
    try {
      const formData = new FormData();
      formData.append("id", editing);
      formData.append("name", editData.name);
      formData.append("rating", editData.rating);
      formData.append("review", editData.review);
      if (editData.media) formData.append("media", editData.media);

      const res = await axios.post(
        `${backendUrl}/api/googlereviews/update`,
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

  return (
    <div className="pl-wrap">
      <div className="pl-head">
        <div className="pl-head__left">
          <h1>Google Reviews</h1>
          <span className="pl-head__count">{list.length} reviews</span>
        </div>
      </div>

      <div className="pl-table">
        <div className="pl-thead" style={{ gridTemplateColumns: "70px 1.2fr 0.8fr 2fr 1.2fr" }}>
          <span>Media</span>
          <span>Name</span>
          <span>Rating</span>
          <span>Review</span>
          <span style={{ textAlign: "right" }}>Action</span>
        </div>

        {list.length === 0 && (
          <div className="pl-empty">No reviews found.</div>
        )}

        {list.map((item) => (
          <div key={item._id} className="pl-row" style={{ gridTemplateColumns: "70px 1.2fr 0.8fr 2fr 1.2fr" }}>
            <div className="pl-thumb">
              {item.media?.url ? (
                /\.(mp4|mov|webm)$/i.test(item.media.url) ? (
                  <video src={item.media.url} autoPlay loop muted />
                ) : (
                  <img src={item.media.url} alt={item.name} />
                )
              ) : (
                <span className="pl-thumb__ph">No media</span>
              )}
            </div>

            <p className="pl-name">{item.name}</p>
            <span className="pl-sizes">⭐ {item.rating}</span>
            <span className="pl-sizes" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.review}
            </span>

            <div className="pl-actions">
              <button className="pl-btn-edit" onClick={() => openEdit(item)}>Edit</button>
              <button className="pl-btn-del" onClick={() => deleteReview(item._id)} title="Delete">✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="pl-modal-overlay" onClick={() => setEditing(null)}>
          <div className="pl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pl-modal__head">Edit Review</div>

            <div className="pl-modal__body">
              <div className="pl-field">
                <label>Customer Name</label>
                <input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
              </div>

              <div className="pl-field">
                <label>Rating (1–5)</label>
                <input type="number" min="1" max="5" value={editData.rating} onChange={(e) => setEditData({ ...editData, rating: e.target.value })} />
              </div>

              <div className="pl-field">
                <label>Review</label>
                <textarea
                  rows="3"
                  value={editData.review}
                  onChange={(e) => setEditData({ ...editData, review: e.target.value })}
                  style={{
                    border: "1px solid #e6d3de",
                    borderRadius: "8px",
                    padding: "8px 11px",
                    fontSize: "0.86rem",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
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

              {editData.preview &&
                (/\.(mp4|mov|webm)$/i.test(editData.preview) ? (
                  <video src={editData.preview} className="pl-modal__preview" autoPlay loop muted />
                ) : (
                  <img src={editData.preview} className="pl-modal__preview" alt="preview" />
                ))}
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

export default GoogleReviewList;
