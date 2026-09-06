import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { assets } from '../assets/assets.js';
import { Link, NavLink } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { ShopContext } from '../context/ShopContext.jsx';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const profileRef = useRef(null);

  const { getCartCount, navigate, token, setToken, setCartItems, setSearch, favorites } = useContext(ShopContext);

  const logout = useCallback(() => {
    navigate('/login');
    try { localStorage.removeItem('token'); } catch {}
    setToken('');
    setCartItems({});
    setProfileOpen(false);
  }, [navigate, setToken, setCartItems]);

  useEffect(() => {
    const handle = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Close sidebar on route change / ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchValue);
    navigate('/collections');
  };

  const handleSidebarSearch = (e) => {
    e.preventDefault();
    setSearch(sidebarSearch);
    navigate('/collections');
    setMenuOpen(false);
  };

  return (
    <>
      <header className="em-nav">
        {/* ── Logo ── */}
        <Link to="/" className="em-nav__logo" aria-label="Epic Moments home">
          <img src={assets.logo_epicmoments} alt="Epic Moments" width="140" height="48" />
        </Link>

        {/* ── Desktop center nav links ── */}
        <nav className="em-nav__links" aria-label="Main navigation">
          <NavLink to="/" end>HOME</NavLink>
          <NavLink to="/collections">COLLECTION</NavLink>
          <NavLink to="/about">ABOUT</NavLink>
          <NavLink to="/contact">CONTACT</NavLink>
          <NavLink to="/privacypolicy">PRIVACY POLICY</NavLink>
          <NavLink to="/termsandconditions">TERMS & CONDITIONS</NavLink>
        </nav>

        {/* ── Right section ── */}
        <div className="em-nav__right">

          {/* Search box — desktop & tablet */}
          <div className="em-nav__search">
            <form className="em-nav__search-form" onSubmit={handleSearch} role="search">
              <input
                type="text"
                placeholder="Search gifts..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="em-nav__search-input"
                aria-label="Search products"
              />
              <button type="submit" className="em-nav__search-icon-btn" aria-label="Submit search">
                🔍
              </button>
            </form>
          </div>

          {/* Profile — desktop only */}
          <div className="em-nav__profile" ref={profileRef}>
            <button
              onClick={() => { if (!token) navigate('/login'); else setProfileOpen(p => !p); }}
              aria-label="Account"
            >
              <img src={assets.profile_icon} alt="Account" />
            </button>
            {token && profileOpen && (
              <div className="em-nav__profile-menu">
                <p onClick={() => { navigate('/orders'); setProfileOpen(false); }}>My Orders</p>
                <p onClick={logout}>Logout</p>
              </div>
            )}
          </div>

          {/* Wishlist */}
          <Link to="/wishlist" className="em-nav__wish" aria-label="Wishlist">
            <FaHeart />
            {favorites && favorites.length > 0 && (
              <span className="em-nav__cart-badge">{favorites.length}</span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="em-nav__cart" aria-label="Cart">
            <img src={assets.cart_icon} alt="Cart" />
            {getCartCount() > 0 && (
              <span className="em-nav__cart-badge" aria-label={`${getCartCount()} items`}>
                {getCartCount()}
              </span>
            )}
          </Link>

          {/* Hamburger — tablet & mobile */}
          <button
            className="em-nav__menu-btn"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* ── Mobile search bar (below navbar, mobile only) ── */}
      <div className="em-nav__mobile-search">
        <form className="em-nav__search-form" onSubmit={handleSearch} role="search">
          <input
            type="text"
            placeholder="Search gifts..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="em-nav__search-input"
            aria-label="Search products"
          />
          <button type="submit" className="em-nav__search-icon-btn" aria-label="Submit search">
            🔍
          </button>
        </form>
      </div>

      {/* ════ MOBILE / TABLET SIDEBAR ════ */}
      {menuOpen && (
        <div
          className="em-nav__overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`em-nav__sidebar${menuOpen ? ' open' : ''}`} aria-label="Mobile menu">

        {/* Sidebar header */}
        <div className="em-nav__sidebar-top">
          <img src={assets.logo_epicmoments} alt="Epic Moments" />
          <button onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
        </div>

        {/* Sidebar search */}
        <div className="em-nav__sidebar-search">
          <form onSubmit={handleSidebarSearch} role="search">
            <input
              type="text"
              placeholder="Search gifts, frames, albums..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              aria-label="Search products"
            />
            <button type="submit" aria-label="Search">🔍</button>
          </form>
        </div>

        {/* Nav links */}
        <nav className="em-nav__sidebar-links">
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>
            <span className="em-nav__sidebar-icon">🏠</span> Home
          </NavLink>
          <NavLink to="/collections" onClick={() => setMenuOpen(false)}>
            <span className="em-nav__sidebar-icon">🛍️</span> Collection
          </NavLink>
          <NavLink to="/about" onClick={() => setMenuOpen(false)}>
            <span className="em-nav__sidebar-icon">ℹ️</span> About
          </NavLink>
          <NavLink to="/contact" onClick={() => setMenuOpen(false)}>
            <span className="em-nav__sidebar-icon">📞</span> Contact
          </NavLink>
          <NavLink to="/privacypolicy" onClick={() => setMenuOpen(false)}>
            <span className="em-nav__sidebar-icon">🔒</span> Privacy Policy
          </NavLink>
          <NavLink to="/termsandconditions" onClick={() => setMenuOpen(false)}>
            <span className="em-nav__sidebar-icon">📋</span> Terms & Conditions
          </NavLink>
        </nav>

        {/* Sidebar footer — auth */}
        <div className="em-nav__sidebar-footer">
          {token ? (
            <>
              <button
                className="em-nav__sidebar-orders"
                onClick={() => { navigate('/orders'); setMenuOpen(false); }}
              >
                📦 My Orders
              </button>
              <button
                className="em-nav__sidebar-logout"
                onClick={() => { logout(); setMenuOpen(false); }}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="em-nav__sidebar-login"
              onClick={() => { navigate('/login'); setMenuOpen(false); }}
            >
              Login / Register
            </button>
          )}
        </div>

      </aside>
    </>
  );
};

export default Navbar;
