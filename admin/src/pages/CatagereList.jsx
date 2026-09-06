import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import "./List.css";

const CategoryList = ({ token }) => {
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/catagere/list`);
      if (res.data.success) {
        setCategories(res.data.catageres.reverse());
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch categories");
    }
  };

  const removeCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await axios.post(
        `${backendUrl}/api/catagere/remove`,
        { id },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Category removed");
        fetchCategories();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error removing category");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="pl-wrap">
      <div className="pl-head">
        <div className="pl-head__left">
          <h1>Catagere List</h1>
          <span className="pl-head__count">{categories.length} items</span>
        </div>
      </div>

      <div className="pl-table">
        <div className="pl-thead" style={{ gridTemplateColumns: "90px 1fr 120px" }}>
          <span>Media</span>
          <span>Category Name</span>
          <span style={{ textAlign: "right" }}>Action</span>
        </div>

        {categories.length === 0 && (
          <div className="pl-empty">No categories found.</div>
        )}

        {categories.map((cat) => (
          <div
            key={cat._id}
            className="pl-row"
            style={{ gridTemplateColumns: "90px 1fr 120px" }}
          >
            <div className="pl-thumb" style={{ width: 70, height: 70 }}>
              {cat.image && cat.image.length > 0 ? (
                cat.image[0].includes(".mp4") ? (
                  <video src={cat.image[0]} muted loop playsInline />
                ) : (
                  <img src={cat.image[0]} alt="category" />
                )
              ) : (
                <span className="pl-thumb__ph">No media</span>
              )}
            </div>

            <p className="pl-name">{cat.name || "Unnamed Category"}</p>

            <div className="pl-actions">
              <button
                className="pl-btn-del"
                onClick={() => removeCategory(cat._id)}
                title="Delete"
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

export default CategoryList;
