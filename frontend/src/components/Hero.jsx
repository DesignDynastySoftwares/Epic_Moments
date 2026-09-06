import React from 'react';
import { assets } from '../assets/assets.js';
import './Hero.css';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className='hero-container'>
<div className='hero-left' data-aos="fade-right">
        <div className='hero-text'>
          <div className='hero-subtitle'>
            <h1 className='hero-label-1'data-aos="fade-left">Welcome to</h1>
            <h2 className="hero-label-3">epic moments</h2>
          </div>

          <div className="hero-title_description">
            <p>Every Gift Tells a Story. Make Yours Special and Personal.</p>
          </div>

          <Link to="/collection" className="Download-button">
            {/* Animated Rocket SVG */}
            <svg
              className="rocket-icon"
              data-aos="fade-right"
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h7"></path>
              <path d="M12 12v7"></path>
              <path d="M9 9l6-6 4 4-6 6"></path>
              <path d="M7 17l-2 2 1-4"></path>
            </svg>
            <span>GET STARTED</span>
          </Link>
        </div>
      </div>

      <div className='hero-right'>
        <img className='hero-image-test' src={assets.gift_box} alt="Hero" />
      </div>
    </div>
  );
};

export default Hero;
