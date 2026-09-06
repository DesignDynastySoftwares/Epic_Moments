import React from "react";
import { assets } from "../assets/assets.js";
import "./Loader.css";

// Split a word into animated letter spans (letter-by-letter reveal)
const AnimatedWord = ({ text, accent = false, startDelay = 0 }) => (
  <span className={`em-loader__word${accent ? " em-loader__word--accent" : ""}`}>
    {text.split("").map((ch, i) => (
      <span
        key={i}
        className="em-loader__letter"
        style={{ animationDelay: `${startDelay + i * 0.06}s` }}
      >
        {ch}
      </span>
    ))}
  </span>
);

const Loader = () => {
  return (
    <div className="em-loader">
      {/* soft glowing accents */}
      <span className="em-loader__glow em-loader__glow--1" aria-hidden="true" />
      <span className="em-loader__glow em-loader__glow--2" aria-hidden="true" />

      {/* floating sparkles — the "moments" being captured */}
      <span className="em-loader__spark em-loader__spark--1" aria-hidden="true" />
      <span className="em-loader__spark em-loader__spark--2" aria-hidden="true" />
      <span className="em-loader__spark em-loader__spark--3" aria-hidden="true" />
      <span className="em-loader__spark em-loader__spark--4" aria-hidden="true" />
      <span className="em-loader__spark em-loader__spark--5" aria-hidden="true" />

      <div className="em-loader__inner">
        {/* logo with rotating ring */}
        <div className="em-loader__logo-wrap">
          <span className="em-loader__ring" aria-hidden="true" />
          <img
            src={assets.logo_epicmoments}
            alt="Epic Moments"
            className="em-loader__logo"
          />
        </div>

        {/* brand mark — letter-by-letter reveal + shine sweep */}
        <h1 className="em-loader__brand">
          <AnimatedWord text="Epic" startDelay={0.35} />
          <AnimatedWord text="Moments" accent startDelay={0.6} />
        </h1>

        <p className="em-loader__tagline">Turning memories into something special</p>

        {/* progress shimmer bar */}
        <div className="em-loader__bar" role="progressbar" aria-label="Loading">
          <span className="em-loader__bar-fill" />
        </div>
      </div>
    </div>
  );
};

export default Loader;
