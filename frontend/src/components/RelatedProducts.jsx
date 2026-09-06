import React, { useContext, useEffect, useMemo, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";
import "./RelatedProducts.css";

const normalize = (v) =>
  (typeof v === "string" ? v.trim().toLowerCase() : "").replace(/\s+/g, " ");

const toStringish = (v) => {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") return v.name || v.title || v.label || "";
  return "";
};

const guessTypeFromUrl = (url = "") => {
  const ext = url.split("?")[0].split("#")[0].split(".").pop()?.toLowerCase();
  if (!ext) return "image";
  if (["mp4", "webm", "ogg"].includes(ext)) return "video";
  if (["mp3", "wav", "m4a", "ogg"].includes(ext)) return "audio";
  return ["jpg", "jpeg", "png", "gif", "webp", "avif", "bmp"].includes(ext)
    ? "image"
    : "image";
};

const mapMedia = (item) => {
  if (Array.isArray(item?.media) && item.media.length) return item.media;
  if (Array.isArray(item?.image) && item.image.length) {
    return item.image.map((url) => ({ type: guessTypeFromUrl(url), url }));
  }
  return [];
};

const getCategory = (item) => toStringish(item?.category);
const getSubCategory = (item) =>
  toStringish(item?.subCategory ?? item?.subcategory);

const RelatedProducts = ({
  category,
  subCategory,
  currentProductId = null,
  limit = 12,
  titleText1 = "RELATED",
  titleText2 = "PRODUCTS",
}) => {
  const { products = [] } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  const normCategory = normalize(category);
  const normSubCategory = normalize(subCategory);

  const computed = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];

    const pool = products.filter((p) => p?._id !== currentProductId);

    let strict = pool.filter(
      (p) =>
        normalize(getCategory(p)) === normCategory &&
        (normSubCategory ? normalize(getSubCategory(p)) === normSubCategory : true)
    );

    if (strict.length === 0 && normCategory) {
      strict = pool.filter((p) => normalize(getCategory(p)) === normCategory);
    }

    if (strict.length === 0) {
      strict = pool.slice(0, limit);
    }

    const withMedia = strict
      .map((p) => ({ ...p, media: mapMedia(p) }))
      .filter((p) => Array.isArray(p.media) && p.media.length > 0);

    return withMedia.slice(0, limit);
  }, [products, normCategory, normSubCategory, currentProductId, limit]);

  useEffect(() => {
    setRelated(computed);
  }, [computed]);

  if (related.length === 0) return null;

  return (
    <section className="rp-section">
      {/* header */}
      <div className="rp-hd">
        <span className="rp-hd__eyebrow">YOU MAY ALSO LIKE</span>
      </div>

      {/* grid */}
      <div className="rp-grid">
        {related.map((item) => (
          <div key={item._id} className="rp-grid__item">
            <ProductItem
              id={item._id}
              name={item.name}
              price={item.price}
              description={item.description}
              media={item.media}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
