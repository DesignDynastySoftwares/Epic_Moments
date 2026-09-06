import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import CollectionItems from "./CollectionItems.jsx";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import "./Collection.css";
import "./CollectionItem.css";

const Wishlist = () => {
  const { favorites } = useContext(ShopContext);
  const navigate = useNavigate();

  const items = Array.isArray(favorites) ? favorites : [];

  return (
    <>
      <Helmet>
        <title>Epic Moments | My Wishlist</title>
      </Helmet>

      {/* Banner */}
      <div className="cl-banner">
        <div className="cl-banner__inner">
          <span className="cl-banner__eyebrow">SAVED FOR LATER</span>
          <h1 className="cl-banner__title">My Wishlist</h1>
          <p className="cl-banner__sub">
            {items.length} {items.length === 1 ? "item" : "items"} you love
          </p>
        </div>
      </div>

      <div className="cl-layout">
        <div className="cl-main" style={{ width: "100%" }}>
          {items.length > 0 ? (
            <div className="cl-grid">
              {items.map((item) => (
                <CollectionItems
                  key={item._id}
                  id={item._id}
                  media={item.media}
                  name={item.name}
                  price={item.price}
                  category={item.category}
                  rating={item.rating}
                  reviews={item.reviews}
                  bestseller={item.bestseller}
                />
              ))}
            </div>
          ) : (
            <div className="cl-empty">
              <span className="cl-empty__icon">🤍</span>
              <p>Your wishlist is empty.</p>
              <button className="cl-empty__btn" onClick={() => navigate("/collections")}>
                Browse Products
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Wishlist;
