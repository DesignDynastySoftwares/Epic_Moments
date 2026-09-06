import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AdminForm.css';
import './List.css';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const ManageCategory = () => {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchCategories = useCallback(async () => {
    if (!token) {
      toast.error("Unauthorized. Please log in.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/category`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setCategories(res.data.categories || []);
      } else {
        toast.error(res.data.message || "Failed to fetch categories");
      }
    } catch (err) {
      toast.error("Failed to load categories");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = async (e) => {
    e.preventDefault();

    const trimmed = name.trim().toLowerCase();
    if (!trimmed) {
      toast.error("Category name cannot be empty");
      return;
    }

    if (!token) {
      toast.error("Unauthorized. Please log in.");
      return;
    }

    try {
      const res = await axios.post(
        `${backendUrl}/api/category/add`,
        { name: trimmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Category added");
        setName('');
        fetchCategories();
      } else {
        toast.error(res.data.message || "Failed to add category");
      }
    } catch (err) {
      console.error("Add Error:", err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await axios.delete(`${backendUrl}/api/category/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        toast.success(res.data.message || "Category deleted");
        fetchCategories();
      } else {
        toast.error(res.data.message || "Failed to delete category");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error(err.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <div className="af-wrap">
      <div className="af-card">
        <div className="af-head">
          <h1>Manage Categories</h1>
          <p>Add or remove product categories used across the site</p>
        </div>

        <div className="af-body">
          <form onSubmit={handleAdd} style={{ display: "flex", gap: "10px" }}>
            <div className="af-field" style={{ flex: 1 }}>
              <input
                type="text"
                value={name}
                placeholder="Enter category name"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <button type="submit" className="af-btn" disabled={!name.trim()} style={{ alignSelf: "stretch" }}>
              Add
            </button>
          </form>

          {loading ? (
            <p className="pl-empty">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="pl-empty">No categories found.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px" }}>
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#fdf5fa",
                    border: "1px solid #f0d4e4",
                    borderRadius: "10px",
                    padding: "10px 14px",
                  }}
                >
                  <span style={{ textTransform: "capitalize", fontWeight: 600, color: "#4a2540" }}>
                    {cat.name}
                  </span>
                  <button
                    className="pl-btn-del"
                    onClick={() => handleDelete(cat._id)}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCategory;
