import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ============================================================
   BannerCanvas — renders the admin-built Canva-style banner.
   Elements are absolutely positioned against a design canvas
   (canvasWidth × canvasHeight) and scaled responsively to fit
   the container width.
   ============================================================ */

const computeCountdown = (targetDate) => {
  if (!targetDate) return { d: 0, h: 0, m: 0, s: 0 };
  const target = new Date(targetDate).getTime();
  if (Number.isNaN(target)) return { d: 0, h: 0, m: 0, s: 0 };
  const diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
  return {
    d: Math.floor(diff / 86400),
    h: Math.floor((diff % 86400) / 3600),
    m: Math.floor((diff % 3600) / 60),
    s: diff % 60,
  };
};

const useCountdownTo = (targetDate) => {
  const [c, setC] = useState(() => computeCountdown(targetDate));
  useEffect(() => {
    setC(computeCountdown(targetDate)); // update immediately when date changes
    const t = setInterval(() => setC(computeCountdown(targetDate)), 1000);
    return () => clearInterval(t);
  }, [targetDate]);
  return c;
};

const TimerElement = ({ el }) => {
  const c = useCountdownTo(el.targetDate);
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
      {[{ v: c.d, u: "Days" }, { v: c.h, u: "Hrs" }, { v: c.m, u: "Min" }, { v: c.s, u: "Sec" }].map(({ v, u }) => (
        <div key={u} style={{ background: el.boxColor || "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 10px", textAlign: "center", minWidth: 46 }}>
          <div style={{ color: el.color || "#fff", fontWeight: 900, fontSize: 18, lineHeight: 1 }}>{String(v).padStart(2, "0")}</div>
          <div style={{ color: el.labelColor || "rgba(255,255,255,0.7)", fontSize: 9, textTransform: "uppercase" }}>{u}</div>
        </div>
      ))}
    </div>
  );
};

const BannerCanvas = ({ banner }) => {
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(1);

  const canvasW = banner?.canvasWidth || 1200;
  const canvasH = banner?.canvasHeight || 400;
  const elements = Array.isArray(banner?.elements) ? banner.elements : [];

  // Scale the design canvas to fit the wrapper width (keeps the admin's
  // exact width:height aspect ratio; only shrinks when the screen is narrower).
  useEffect(() => {
    const update = () => {
      if (!wrapRef.current) return;
      const w = wrapRef.current.clientWidth;
      setScale(Math.min(1, w / canvasW));
    };
    update();
    // Re-measure shortly after mount (layout may not be ready on first paint)
    const raf = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
    };
  }, [canvasW, canvasH]);

  // Hidden if inactive or has no elements
  if (banner?.isActive === false) return null;
  if (!elements.length) return null;

  const go = (link) => {
    if (!link) return;
    if (/^https?:\/\//i.test(link)) window.open(link, "_blank");
    else navigate(link);
  };

  return (
    <div
      ref={wrapRef}
      className="banner-canvas"
      style={{
        width: "100%",
        height: canvasH * scale,
        display: "flex",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: canvasW,
          height: canvasH,
          background: banner.background || "#1a1a2e",
          backgroundImage: banner.backgroundImage ? `url(${banner.backgroundImage})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: banner.borderRadius ?? 20,
          overflow: "hidden",
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          flexShrink: 0,
        }}
      >
        {elements
          .slice()
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
          .map((el) => {
            const base = {
              position: "absolute",
              left: el.x,
              top: el.y,
              width: el.w,
              height: el.h,
              zIndex: el.zIndex || 1,
              boxSizing: "border-box",
            };

            if (el.type === "text") {
              return (
                <div key={el.id} style={{
                  ...base,
                  display: "flex", alignItems: "center",
                  justifyContent: el.align === "center" ? "center" : el.align === "right" ? "flex-end" : "flex-start",
                  color: el.color, fontSize: el.fontSize, fontWeight: el.fontWeight,
                  fontStyle: el.fontStyle, textAlign: el.align, lineHeight: 1.2,
                }}>
                  {el.text}
                </div>
              );
            }

            if (el.type === "button") {
              return (
                <button key={el.id} onClick={() => go(el.link)} style={{
                  ...base,
                  border: "none", cursor: "pointer",
                  background: el.bg, color: el.color, fontSize: el.fontSize, fontWeight: 700,
                  borderRadius: el.radius, letterSpacing: "0.03em",
                }}>
                  {el.text} →
                </button>
              );
            }

            if (el.type === "image") {
              return el.imageUrl ? (
                <img key={el.id} src={el.imageUrl} alt="" style={{
                  ...base, objectFit: el.fit || "cover", borderRadius: el.radius || 0, display: "block",
                }} />
              ) : null;
            }

            if (el.type === "timer") {
              return <div key={el.id} style={base}><TimerElement el={el} /></div>;
            }

            return null;
          })}
      </div>
    </div>
  );
};

export default BannerCanvas;
