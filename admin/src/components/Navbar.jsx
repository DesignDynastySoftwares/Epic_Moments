// components/Navbar.jsx
import React, { useEffect } from 'react';
import { assets } from '../assets/assets';
import './nav-2.css';
import { FiBell, FiMenu } from 'react-icons/fi';

const Navbar = ({ setToken, newOrdersCount, onMenuToggle }) => {
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar-container');
      if (!navbar) return;
      if (window.scrollY > lastScrollY) {
        navbar.style.top = '-80px';
      } else {
        navbar.style.top = '0';
      }
      lastScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="navbar-container">
      <button
        className="navbar-menu-btn"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <FiMenu />
      </button>
      <img
        className="navbar-logo"
        src={assets.logo_epicmoments}
        alt="Epic Moments Logo"
      />
      <div className="notification-wrapper">
        <FiBell className="notification-bell" />
        {newOrdersCount > 0 && (
          <span className="notification-badge">{newOrdersCount}</span>
        )}
      </div>
      <button onClick={() => setToken('')} className="logout-btn">
        Logout
      </button>
    </div>
  );
};

export default Navbar;
