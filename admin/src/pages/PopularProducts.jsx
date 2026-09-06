import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const PopularProducts = ({ token }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get("edit");
  const isEdit = Boolean(editId);

  const [media, setMedia] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [rating, setRating] = useState("4.8");
  const [ratingCount, setRatingCount] = useState("");
  const [purchases, setPurchases] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/category`);
        if (res.data.success) {
          setCategoryList(res.data.categories);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchCategories();
  }, []);

  // Edit mode: load the popular product
  useEffect(() => {
    if (!editId) return;
    const fetchOne = async () => {
      try {
        const res = await axios.post(`${backendUrl}/api/popular/single`, { id: editId });
        if (res.data.success && res.data.popularProduct) {
          const p = res.data.popularProduct;
          setName(p.name || "");
          setCategory(p.category || "");
          setRating(p.rating != null ? String(p.rating) : "4.8");
          setRatingCount(p.ratingCount != null ? String(p.ratingCount) : "");
          setPurchases(p.purchases != null ? String(p.purchases) : "");
          setExistingImage(p.image && p.image.length > 0 ? p.image[0] : null);
        } else {
          toast.error("Could not load product for editing");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load product");
      }
    };
    fetchOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // In add mode media is required; in edit mode it's optional (keeps existing)
    if (!isEdit && !media) {
      toast.error("Please select an image, video, or gif file");
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("rating", rating);
      formData.append("ratingCount", ratingCount || 0);
      formData.append("purchases", purchases || 0);
      if (media) formData.append("media", media);

      let response;
      if (isEdit) {
        response = await axios.put(
          `${backendUrl}/api/popular/update/${editId}`,
          formData,
          { headers: { token } }
        );
      } else {
        response = await axios.post(
          `${backendUrl}/api/popular/add`,
          formData,
          { headers: { token } }
        );
      }

      if (response.data.success) {
        toast.success(response.data.message);
        if (isEdit) {
          navigate("/PopularProductsList");
          return;
        }
        setName("");
        setMedia(null);
        setCategory("");
        setRating("4.8");
        setRatingCount("");
        setPurchases("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
      <h2 className="text-xl font-bold text-pink-700">
        {isEdit ? "Edit Best Seller" : "Add Best Seller"}
      </h2>

      {/* Upload Media */}
      <div>
        <p className="mb-2">
          {isEdit ? "Image/Video/Gif (leave empty to keep current)" : "Upload Image/Video/Gif"}
        </p>
        <label htmlFor="mediaUpload" className="cursor-pointer">
          {media ? (
            media.type.startsWith("video") ? (
              <video className="w-40" controls src={URL.createObjectURL(media)} />
            ) : (
              <img className="w-40" src={URL.createObjectURL(media)} alt="preview" />
            )
          ) : existingImage ? (
            (existingImage.endsWith(".mp4") || existingImage.includes("video")) ? (
              <video className="w-40" controls src={existingImage} />
            ) : (
              <img className="w-40" src={existingImage} alt="current" />
            )
          ) : (
            <img className="w-40" src={assets.upload_area} alt="upload placeholder" />
          )}

          <input
            type="file"
            id="mediaUpload"
            accept="image/*,video/*,gif/*"
            onChange={(e) => setMedia(e.target.files[0])}
            hidden
          />
        </label>
      </div>

      {/* Name */}
      <div className="w-full">
        <p className="mb-2">Name</p>
        <input
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full max-w-[500px] px-3 py-2 border rounded"
          required
        />
      </div>

      {/* Category */}
      <div className="w-full max-w-[500px]">
        <p className="mb-2">Category</p>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border rounded"
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

      {/* Rating (0–5) */}
      <div className="w-full max-w-[500px]">
        <p className="mb-2">Rating (0–5)</p>
        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          placeholder="e.g. 4.8"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      {/* Number of Ratings */}
      <div className="w-full max-w-[500px]">
        <p className="mb-2">No. of Ratings</p>
        <input
          type="number"
          min="0"
          placeholder="e.g. 250"
          value={ratingCount}
          onChange={(e) => setRatingCount(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      {/* Number of Purchases */}
      <div className="w-full max-w-[500px]">
        <p className="mb-2">No. of Purchases</p>
        <input
          type="number"
          min="0"
          placeholder="e.g. 1200"
          value={purchases}
          onChange={(e) => setPurchases(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 mt-4">
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2.5 rounded text-white bg-pink-600 ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-pink-700"
          } transition`}
        >
          {loading ? (isEdit ? "Updating..." : "Adding...") : isEdit ? "UPDATE" : "ADD"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={() => navigate("/PopularProductsList")}
            className="px-6 py-2.5 rounded border border-gray-400 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default PopularProducts;
