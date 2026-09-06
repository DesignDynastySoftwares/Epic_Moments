import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets.js';
import { useLocation } from 'react-router-dom';
import './SearchBar.css'; // 👈 Make sure to import the CSS

const SearchBar = () => {
  const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext);
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('collection')) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [location]);

  return (
    <div className={`search-bar-container ${showSearch && visible ? 'open' : ''}`}>
      <div className="relative search-wrapper">
        <div className="search-bar-inner">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            type="text"
            placeholder="Search"
          />
          <img className="search-icon" src={assets.search_icon} alt="Search" />
        </div>
        <img
          onClick={() => setShowSearch(false)}
          className="close-icon"
          src={assets.cross_icon}
          alt="Close"
        />
      </div>
    </div>
  );
};

export default SearchBar;
