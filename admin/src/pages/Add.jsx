import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

const Add = ({ token }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');
  const isEdit = Boolean(editId);

  // Store files (image/video/audio)
  const [mediaFiles, setMediaFiles] = useState([null, null, null, null]);
  // Store previews with type info
  const [mediaPreviews, setMediaPreviews] = useState([null, null, null, null]);
  // Existing media (edit mode) — kept from the saved product
  const [existingMedia, setExistingMedia] = useState([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [bestseller, setBestseller] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [rating, setRating] = useState(4);
  const [customers, setCustomers] = useState(0);
  const [sizes, setSizes] = useState([]);
  const [reviews, setReviews] = useState([{ id: uuidv4(), reviewer: '', comment: '', rating: 5 }]);
  const [loading, setLoading] = useState(false);

  const removeExistingMedia = (publicId) => {
    setExistingMedia((prev) => prev.filter((m) => m.public_id !== publicId));
  };

  const toggleSize = (size) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((item) => item !== size) : [...prev, size]
    );
  };

  const addReview = () => {
    if (reviews.length >= 50) return toast.error('Maximum 50 reviews allowed');
    setReviews([...reviews, { id: uuidv4(), reviewer: '', comment: '', rating: 5 }]);
  };

  const updateReview = (id, field, value) => {
    const updated = reviews.map((review) =>
      review.id === id ? { ...review, [field]: field === 'rating' ? Number(value) : value } : review
    );
    setReviews(updated);
  };

  const deleteReview = (id) => {
    setReviews(reviews.filter((review) => review.id !== id));
  };

  const handleMediaChange = (index, file) => {
    if (!file) return;

    // Validate allowed types: images, videos, audio
    if (
      !file.type.startsWith('image/') &&
      !file.type.startsWith('video/') &&
      !file.type.startsWith('audio/')
    ) {
      toast.error('Only image, video, and audio files are allowed');
      return;
    }
    // Validate max size 500MB
    if (file.size > 500 * 1024 * 1024) {
      toast.error('File size should be under 500MB');
      return;
    }

    // Update media files
    const updatedFiles = [...mediaFiles];
    updatedFiles[index] = file;
    setMediaFiles(updatedFiles);

    // Update previews with URL and type
    const updatedPreviews = [...mediaPreviews];
    updatedPreviews[index] = {
      url: URL.createObjectURL(file),
      type: file.type,
    };
    setMediaPreviews(updatedPreviews);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Basic validations
    if (!name.trim() || !description.trim() || !price || !category) {
      return toast.error('Please fill all required fields');
    }
    if (isNaN(price) || Number(price) <= 0) {
      return toast.error('Please enter a valid price');
    }
    if (rating < 0 || rating > 5) {
      return toast.error('Rating must be between 0 and 5');
    }
    if (customers < 0) {
      return toast.error('Customers bought cannot be negative');
    }

    // In add mode at least one media is required
    if (!isEdit && !mediaFiles.some(Boolean)) {
      return toast.error('Please upload at least one media file');
    }
    // In edit mode there must be either kept media or a new upload
    if (isEdit && existingMedia.length === 0 && !mediaFiles.some(Boolean)) {
      return toast.error('Product must have at least one media file');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('bestseller', bestseller);
      formData.append('rating', rating);
      formData.append('customers', customers);

      // sizes as JSON so backend JSON.parse works for both add & update
      formData.append('sizes', JSON.stringify(sizes));

      mediaFiles.forEach((file, idx) => {
        if (file) formData.append(`media${idx + 1}`, file);
      });

      let response;
      if (isEdit) {
        // keep the existing media the admin didn't remove
        formData.append('keepMedia', JSON.stringify(existingMedia));
        response = await axios.put(`${backendUrl}/api/product/update/${editId}`, formData, {
          headers: { token },
        });
      } else {
        // reviews optional — only send fully filled ones (edited later via List page)
        const validReviews = reviews.filter(
          (rev) => rev.reviewer.trim() && rev.comment.trim()
        );
        validReviews.forEach((rev, i) => {
          formData.append(`reviews[${i}][reviewer]`, rev.reviewer);
          formData.append(`reviews[${i}][comment]`, rev.comment);
          formData.append(`reviews[${i}][rating]`, rev.rating);
        });
        response = await axios.post(`${backendUrl}/api/product/add`, formData, {
          headers: { token },
        });
      }

      if (response.data.success) {
        toast.success(response.data.message);
        if (isEdit) {
          navigate('/list');
          return;
        }
        // Reset form (add mode)
        setName('');
        setDescription('');
        setPrice('');
        setCategory('');
        setSizes([]);
        setBestseller(false);
        setRating(4);
        setCustomers(0);
        setReviews([{ id: uuidv4(), reviewer: '', comment: '', rating: 5 }]);
        setMediaFiles([null, null, null, null]);
        setMediaPreviews([null, null, null, null]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/category`);
        if (res.data.success) {
          setCategoryList(res.data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Edit mode: load the product and pre-fill the form
  useEffect(() => {
    if (!editId) return;
    const fetchProduct = async () => {
      try {
        const res = await axios.post(`${backendUrl}/api/product/single`, {
          productId: editId,
        });
        if (res.data.success && res.data.product) {
          const p = res.data.product;
          setName(p.name || '');
          setDescription(p.description || '');
          setPrice(p.price ?? '');
          setCategory(p.category || '');
          setBestseller(Boolean(p.bestseller));
          setRating(p.rating ?? 4);
          setCustomers(p.customers ?? 0);
          setSizes(Array.isArray(p.sizes) ? p.sizes : []);
          setExistingMedia(Array.isArray(p.media) ? p.media : []);
        } else {
          toast.error('Could not load product for editing');
        }
      } catch (err) {
        console.error('Error loading product:', err);
        toast.error('Failed to load product');
      }
    };
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-4">
      <h2 className="text-xl font-bold text-pink-700">
        {isEdit ? 'Edit Product' : 'Add Product'}
      </h2>

      {/* Existing media (edit mode) */}
      {isEdit && existingMedia.length > 0 && (
        <div>
          <p className="mb-2">Current Media (click ✕ to remove)</p>
          <div className="flex gap-2 flex-wrap">
            {existingMedia.map((m) => (
              <div key={m.public_id} className="relative border p-1 rounded">
                {m.type === 'image' ? (
                  <img className="w-20 h-20 object-cover" src={m.url} alt="media" />
                ) : m.type === 'video' ? (
                  <video className="w-20 h-20 object-cover" src={m.url} muted />
                ) : (
                  <audio className="w-20" src={m.url} controls />
                )}
                <button
                  type="button"
                  onClick={() => removeExistingMedia(m.public_id)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
                  title="Remove media"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Media */}
      <div>
        <p className="mb-2">
          {isEdit ? 'Add / Replace Media (optional)' : 'Upload Media (Images, Videos, Audio)'}
        </p>
        <div className="flex gap-2">
          {mediaPreviews.map((media, idx) => (
            <label key={idx} htmlFor={`media${idx}`} className="cursor-pointer border p-1 rounded">
              {media ? (
                media.type.startsWith('image/') ? (
                  <img className="w-20 h-20 object-cover" src={media.url} alt={`Preview ${idx + 1}`} />
                ) : media.type.startsWith('video/') ? (
                  <video className="w-20 h-20 object-cover" src={media.url} controls />
                ) : media.type.startsWith('audio/') ? (
                  <audio className="w-20" src={media.url} controls />
                ) : null
              ) : (
                <img className="w-20 h-20 object-cover" src={assets.upload_area} alt="Upload" />
              )}
              <input
                type="file"
                accept="image/*,video/*,audio/*"
                hidden
                id={`media${idx}`}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleMediaChange(idx, e.target.files[0]);
                  }
                }}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Product Name */}
      <div className="w-full">
        <p className="mb-2">Product Name</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full max-w-[500px] px-3 py-2 border rounded"
          placeholder="Type here"
          required
        />
      </div>

      {/* Product Description */}
      <div className="w-full">
        <p className="mb-2">Product Description</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full max-w-[500px] px-3 py-2 border rounded"
          placeholder="Write content here"
          required
          rows={4}
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

      {/* Price */}
      <div className="w-full max-w-[500px]">
        <p className="mb-2">Price</p>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          min="0"
          step="0.01"
          required
        />
      </div>

     
      {/* Sizes */}
      <div className="flex flex-wrap gap-2 mt-4">
        <p className="w-full mb-1">Product Sizes</p>
        {['1.5 x 2', '3 x 2', '6 x 4', '6 x 8', '7 x 5', '8 x 10', '8 x 12', '10 x 10', '10 x 12','10 x 15', '11 x 11', '12 x 15 ', '12 x 18', '16 x 20', '16 x 24', '18 x 24', 'FREE SIZE'].map((size) => (
          <p
            key={size}
            onClick={() => toggleSize(size)}
            className={`cursor-pointer px-3 py-1 rounded select-none ${
              sizes.includes(size) ? 'bg-pink-100' : 'bg-slate-200'
            }`}
          >
            {size}
          </p>
        ))}
      </div>


      {/* Rating */}
      <div className="w-full max-w-[500px]">
        <p className="mb-2">Rating (out of 5)</p>
        <input
          type="number"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          min="0"
          max="5"
          step="0.1"
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      {/* Customers Bought */}
      <div className="w-full max-w-[500px]">
        <p className="mb-2">Number of Customers Bought</p>
        <input
          type="number"
          value={customers}
          onChange={(e) => setCustomers(Number(e.target.value))}
          min="0"
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      {/* Bestseller */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="bestseller"
          checked={bestseller}
          onChange={(e) => setBestseller(e.target.checked)}
        />
        <label htmlFor="bestseller">Bestseller</label>
      </div>

      {/* Reviews (add mode only — edit reviews from the List page) */}
      {!isEdit && (
      <div className="w-full max-w-[500px]">
        <p className="mb-2 flex items-center justify-between">
          Reviews
          <button
            type="button"
            onClick={addReview}
            className="text-sm text-blue-600 hover:underline"
          >
            Add Review
          </button>
        </p>
        {reviews.map((review, i) => (
          <div
            key={review.id}
            className="mb-3 p-2 border rounded flex flex-col gap-2 bg-gray-50"
          >
            <input
              type="text"
              placeholder="Reviewer (optional)"
              value={review.reviewer}
              onChange={(e) => updateReview(review.id, 'reviewer', e.target.value)}
              className="w-full px-3 py-1 border rounded"
            />
            <textarea
              placeholder="Comment (optional)"
              value={review.comment}
              onChange={(e) => updateReview(review.id, 'comment', e.target.value)}
              className="w-full px-3 py-1 border rounded"
              rows={2}
            />
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              placeholder="Rating"
              value={review.rating}
              onChange={(e) => updateReview(review.id, 'rating', e.target.value)}
              className="w-full px-3 py-1 border rounded"
            />
            {reviews.length > 1 && (
              <button
                type="button"
                onClick={() => deleteReview(review.id)}
                className="text-red-600 text-sm self-start hover:underline"
              >
                Delete Review
              </button>
            )}
          </div>
        ))}
      </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className={`px-5 py-2 rounded bg-pink-600 text-white ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-700'
          }`}
        >
          {loading ? (isEdit ? 'Updating...' : 'Adding...') : isEdit ? 'UPDATE' : 'ADD'}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={() => navigate('/list')}
            className="px-5 py-2 rounded border border-gray-400 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default Add;
