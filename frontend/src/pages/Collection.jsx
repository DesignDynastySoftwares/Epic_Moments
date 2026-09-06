import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import CollectionItems from "./CollectionItems.jsx";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./Collection.css";
import "./CollectionItem.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const categoryFromUrl = params.get("category");

  const [category, setCategory] = useState(categoryFromUrl ? [categoryFromUrl] : []);
  const [sortType, setSortType] = useState("relevant");
  const [filterProducts, setFilterProducts] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [showFilter, setShowFilter] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategoryList = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/category`);
        if (res.data?.success && Array.isArray(res.data.categories)) {
          setCategoryList(res.data.categories);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategoryList();
  }, []);

  // Sync URL category to state
  useEffect(() => {
    if (categoryFromUrl) setCategory([categoryFromUrl]);
  }, [categoryFromUrl]);

  // Filter + sort
  useEffect(() => {
    if (!products || products.length === 0) {
      setFilterProducts([]);
      return;
    }
    let filtered = [...products];

    if (showSearch && search) {
      filtered = filtered.filter((item) =>
        item.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      filtered = filtered.filter((item) => {
        const productCategory =
          typeof item.category === "string" ? item.category : item.category?.name || "";
        return category.some((cat) => cat.toLowerCase() === productCategory.toLowerCase());
      });
    }

    if (sortType === "low-high") filtered.sort((a, b) => a.price - b.price);
    else if (sortType === "high-low") filtered.sort((a, b) => b.price - a.price);

    setFilterProducts(filtered);
  }, [products, category, search, showSearch, sortType]);

  const toggleCategory = (value) => {
    setCategory((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const clearFilters = () => setCategory([]);

  const categoryTitle = category.length > 0 ? category.join(", ") : "All Products";
  const pageTitle = "Epic Moments | Personalized Gifts & Photography";
  let keywordSet = ["personalized gifts", "custom gifts", "photo frames", "EpicMoments"];
  if (category.length > 0) keywordSet = [...keywordSet, ...category];
  if (search) keywordSet.push(search);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={`Browse ${categoryTitle} from EpicMoments${search ? ` related to "${search}"` : ""}. Discover unique, handcrafted, and personalized gifts for every occasion.`}
        />
        <meta name="keywords" content={keywordSet.join(", ")} />
      </Helmet>


      {showFilter && <div className="cl-overlay" onClick={() => setShowFilter(false)} />}

      <div className="cl-layout">
       
        {/* ── Sidebar Filter ── */}
        <aside className={`cl-sidebar ${showFilter ? "open" : ""}`}>
          <div className="cl-sidebar__head">
            <h3>Filters</h3>
            <button className="cl-sidebar__close" onClick={() => setShowFilter(false)} aria-label="Close filters">✕</button>
          </div>

          <div className="cl-filter-group">
            <div className="cl-filter-group__top">
              <p className="cl-filter-group__title">Categories</p>
              {category.length > 0 && (
                <button className="cl-clear" onClick={clearFilters}>Clear</button>
              )}
            </div>

            <div className="cl-cat-list">
              {categoryList.length > 0 ? (
                categoryList.map((cat) => (
                  <button
                    key={cat._id}
                    className={`cl-cat-pill ${category.includes(cat.name) ? "active" : ""}`}
                    onClick={() => toggleCategory(cat.name)}
                  >
                    {cat.name}
                    {category.includes(cat.name) && <span className="cl-cat-pill__check">✓</span>}
                  </button>
                ))
              ) : (
                <p className="cl-muted">No categories available</p>
              )}
            </div>
          </div>
        </aside>

        {/* ── Products ── */}
        <div className="cl-main">
          <div className="cl-toolbar">
            <h1 className="cl-toolbar__title">All Products</h1>
            <button className="cl-filter-btn" onClick={() => setShowFilter(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
              </svg>
              Filters
            </button>

            <div className="cl-sort">
              <label>Sort</label>
              <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
                <option value="relevant">Relevant</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="cl-grid">
            {filterProducts.length > 0 ? (
              filterProducts.map((item) => (
                <CollectionItems
                  key={item._id}
                  id={item._id}
                  media={item.media}
                  name={item.name}
                  price={item.price}
                  description={item.description}
                  category={item.category}
                  rating={item.rating}
                  reviews={item.reviews}
                  customers={item.customers}
                  bestseller={item.bestseller}
                />
              ))
            ) : (
              <div className="cl-empty">
                <span className="cl-empty__icon">🎁</span>
                <p>No products found.</p>
                {category.length > 0 && (
                  <button className="cl-empty__btn" onClick={clearFilters}>Clear filters</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Collection;
