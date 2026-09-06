import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import placeholder from "../assets/upload_area.png"; // <-- your placeholder image

const OfferProducts = ({ token }) => {
  const [media, setMedia] = useState(null);
  const [name, setName] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [days, setDays] = useState("");
  const [category, setCategory] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [isBestseller, setIsBestseller] = useState(false);
  const [rating, setRating] = useState("4.9");
  const [tagline, setTagline] = useState("Personalized with love");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/category`);
        if (res.data.success) setCategoryList(res.data.categories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!media) return toast.error("Please select media");
    if (!category) return toast.error("Please select a category");
    if (Number(offerPrice) >= Number(originalPrice)) {
      return toast.error("Offer Price must be lower than Original Price");
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("originalPrice", originalPrice);
      formData.append("offerPrice", offerPrice);
      formData.append("days", days);
      formData.append("category", category);
      formData.append("isBestseller", isBestseller);
      formData.append("rating", rating);
      formData.append("tagline", tagline);
      formData.append("media", media);

      const res = await axios.post(`${backendUrl}/api/offer/add`, formData, {
        headers: { token },
      });

      if (res.data.success) {
        toast.success(res.data.message || "Offer product added");
        setName("");
        setOriginalPrice("");
        setOfferPrice("");
        setDays("");
        setMedia(null);
        setCategory("");
        setIsBestseller(false);
        setRating("4.9");
        setTagline("Personalized with love");
      } else toast.error(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col gap-4 w-full max-w-md">
      <div>
        <p className="mb-1">Upload Media</p>
        <label htmlFor="mediaUpload" className="cursor-pointer">
          {media ? (
            media.type.startsWith("video") ? (
              <video src={URL.createObjectURL(media)} controls className="w-40 mt-2" />
            ) : (
              <img src={URL.createObjectURL(media)} alt="preview" className="w-40 mt-2" />
            )
          ) : (
            <img src={placeholder} alt="upload placeholder" className="w-40 mt-2" />
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

      <div className="flex flex-col gap-1">
        <label className="font-medium text-sm">Product Name</label>
        <input type="text" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} className="border rounded px-2 py-1" required />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-medium text-sm">Original Price (₹) — higher, shown struck-through</label>
        <input type="number" placeholder="e.g. 1000" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="border rounded px-2 py-1" required />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-medium text-sm">Offer Price (₹) — lower, the selling price</label>
        <input type="number" placeholder="e.g. 100" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} className="border rounded px-2 py-1" required />
      </div>

      {/* live discount preview */}
      {originalPrice && offerPrice && Number(originalPrice) > 0 && (
        <p className="text-sm">
          Discount shown on card:{" "}
          <span className={Number(offerPrice) < Number(originalPrice) ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
            {Math.round(((Number(originalPrice) - Number(offerPrice)) / Number(originalPrice)) * 100)}% OFF
          </span>
          {Number(offerPrice) >= Number(originalPrice) && " (Offer price must be lower!)"}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label className="font-medium text-sm">Days (Optional)</label>
        <input type="number" placeholder="Days (Optional)" value={days} onChange={(e) => setDays(e.target.value)} className="border rounded px-2 py-1" />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-medium text-sm">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded px-2 py-1" required>
          <option value="">-- Select Category --</option>
          {categoryList.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
        </select>
      </div>

      {/* Tagline */}
      <div className="flex flex-col gap-1">
        <label className="font-medium text-sm">Tagline (shown below rating)</label>
        <input
          type="text"
          placeholder="e.g. Personalized with love"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      {/* Rating */}
      <div className="flex flex-col gap-1">
        <label className="font-medium text-sm">Rating (0–5)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          placeholder="e.g. 4.9"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      {/* Bestseller toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isBestseller}
          onChange={(e) => setIsBestseller(e.target.checked)}
          className="w-4 h-4 accent-pink-500"
        />
        <span className="font-medium text-sm">Mark as Bestseller</span>
      </label>

      <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded transition">Add Combo Offer</button>
    </form>
  );
};

export default OfferProducts;
