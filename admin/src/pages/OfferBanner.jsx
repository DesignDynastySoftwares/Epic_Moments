import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";

/* ============================================================
   CANVA-STYLE OFFER BANNER BUILDER
   - Add text / image / button / timer elements
   - Drag to move, corner handle to resize
   - Right panel edits the selected element
   - Save serializes elements (+ uploads new images) to backend
   ============================================================ */

const uid = () => "el_" + Math.random().toString(36).slice(2, 9);

// default new element factory
const makeElement = (type) => {
  const base = { id: uid(), type, x: 60, y: 60, w: 220, h: 60, zIndex: 1 };
  switch (type) {
    case "text":
      return { ...base, text: "New Text", fontSize: 28, fontWeight: 700, fontStyle: "normal", color: "#ffffff", align: "left" };
    case "button":
      return { ...base, w: 180, h: 50, text: "Shop Now", link: "/collections", bg: "#e8157e", color: "#ffffff", fontSize: 16, radius: 8 };
    case "timer":
      return { ...base, w: 300, h: 90, targetDate: "", color: "#ffffff", bg: "rgba(255,255,255,0.1)", boxColor: "rgba(255,255,255,0.1)", labelColor: "rgba(255,255,255,0.7)" };
    case "image":
      return { ...base, w: 180, h: 180, imageUrl: "", public_id: "", radius: 12, fit: "cover", _newFile: null };
    default:
      return base;
  }
};

// Convert an ISO date string / Date into the value a
// <input type="datetime-local"> expects: "yyyy-MM-ddThh:mm"
const toLocalInput = (dateVal) => {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// live countdown for timer preview
const getCountdown = (targetDate) => {
  if (!targetDate) return { d: 0, h: 0, m: 0, s: 0 };
  const diff = Math.max(0, Math.floor((new Date(targetDate).getTime() - Date.now()) / 1000));
  return {
    d: Math.floor(diff / 86400),
    h: Math.floor((diff % 86400) / 3600),
    m: Math.floor((diff % 3600) / 60),
    s: diff % 60,
  };
};

const OfferBanner = ({ token }) => {
  const [canvasW, setCanvasW] = useState(1200);
  const [canvasH, setCanvasH] = useState(400);
  const [borderRadius, setBorderRadius] = useState(20);
  const [background, setBackground] = useState("#1a1a2e");
  const [isActive, setIsActive] = useState(true);
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0); // re-render timers

  const canvasRef = useRef(null);
  const dragState = useRef(null);
  const fileInputRef = useRef(null);
  const pickTargetId = useRef(null);

  const selected = elements.find((e) => e.id === selectedId) || null;

  // Open the OS file dialog for a specific image element
  const pickImageFor = (id) => {
    pickTargetId.current = id;
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // allow re-selecting the same file
      fileInputRef.current.click();
    }
  };

  // When a file is chosen, attach it to the target element
  const onFilePicked = (e) => {
    const file = e.target.files && e.target.files[0];
    const id = pickTargetId.current;
    if (file && id) {
      setElements((prev) => prev.map((el) => (el.id === id ? { ...el, _newFile: file } : el)));
    }
    pickTargetId.current = null;
  };

  // ── Load existing banner ──
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/offerbanner/get`);
        if (res.data.success && res.data.banner) {
          const b = res.data.banner;
          setCanvasW(b.canvasWidth || 1200);
          setCanvasH(b.canvasHeight || 400);
          setBorderRadius(b.borderRadius ?? 20);
          setBackground(b.background || "#1a1a2e");
          setIsActive(b.isActive !== false);
          if (Array.isArray(b.elements) && b.elements.length) {
            setElements(
              b.elements.map((el) => {
                const next = { ...el, _newFile: null };
                // Convert stored ISO date back into datetime-local format
                // ("yyyy-MM-ddThh:mm") so the picker shows it correctly.
                if (el.type === "timer" && el.targetDate) {
                  next.targetDate = toLocalInput(el.targetDate);
                }
                return next;
              })
            );
          }
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // tick every second so timer previews update
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Update a single element ──
  const updateEl = useCallback((id, patch) => {
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const addElement = (type) => {
    const el = makeElement(type);
    setElements((prev) => [...prev, { ...el, zIndex: prev.length + 1 }]);
    setSelectedId(el.id);
  };

  const deleteEl = (id) => {
    setElements((prev) => prev.filter((e) => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // ── Drag / resize handlers ──
  const onPointerDownEl = (e, el, mode) => {
    e.stopPropagation();
    setSelectedId(el.id);
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = rect.width / canvasW;
    dragState.current = {
      id: el.id,
      mode, // "move" | "resize"
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
      origW: el.w,
      origH: el.h,
      scale,
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const onPointerMove = (e) => {
    const s = dragState.current;
    if (!s) return;
    const dx = (e.clientX - s.startX) / s.scale;
    const dy = (e.clientY - s.startY) / s.scale;
    if (s.mode === "move") {
      updateEl(s.id, { x: Math.round(s.origX + dx), y: Math.round(s.origY + dy) });
    } else {
      updateEl(s.id, {
        w: Math.max(30, Math.round(s.origW + dx)),
        h: Math.max(20, Math.round(s.origH + dy)),
      });
    }
  };

  const onPointerUp = () => {
    dragState.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };

  // ── Save ──
  const onSave = async () => {
    setLoading(true);
    try {
      // Convert any newly-selected image files to base64 so they travel
      // inside the JSON payload (avoids multipart fieldname issues entirely).
      const fileToBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

      const serialisable = await Promise.all(
        elements.map(async (el) => {
          const { _newFile, ...rest } = el;
          if (el.type === "image" && _newFile) {
            rest.newImageData = await fileToBase64(_newFile); // data:image/...;base64,...
          }
          // Send timer date as a full ISO string for unambiguous storage
          if (el.type === "timer") {
            rest.targetDate = el.targetDate ? new Date(el.targetDate).toISOString() : "";
          }
          return rest;
        })
      );

      const payload = {
        canvasWidth: canvasW,
        canvasHeight: canvasH,
        borderRadius,
        background,
        isActive,
        elements: serialisable,
      };

      const res = await axios.post(`${backendUrl}/api/offerbanner/save`, payload, {
        headers: { "Content-Type": "application/json", token },
      });

      console.log("Banner save response:", res.data);

      if (res.data.success) {
        toast.success("Banner saved");
        if (Array.isArray(res.data.banner?.elements)) {
          const imgCount = res.data.banner.elements.filter(
            (e) => e.type === "image" && e.imageUrl
          ).length;
          console.log(`Saved with ${imgCount} image(s) that have URLs`);
          setElements(
            res.data.banner.elements.map((el) => {
              const next = { ...el, _newFile: null };
              // Re-convert ISO date to datetime-local so the picker keeps showing it
              if (el.type === "timer" && el.targetDate) {
                next.targetDate = toLocalInput(el.targetDate);
              }
              return next;
            })
          );
        }
      } else {
        toast.error(res.data.message || "Save failed");
      }
    } catch (err) {
      // Surface the real backend error instead of a generic message
      const msg = err?.response?.data?.message || err?.message || "Save failed";
      console.error("Banner save error:", err?.response?.data || err);
      toast.error(`Save failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Render a single element on the canvas ──
  const renderEl = (el) => {
    const style = {
      position: "absolute",
      left: el.x,
      top: el.y,
      width: el.w,
      height: el.h,
      zIndex: el.zIndex || 1,
      cursor: "move",
      boxSizing: "border-box",
      outline: selectedId === el.id ? "2px solid #2f80ed" : "1px dashed rgba(255,255,255,0.25)",
    };

    let inner = null;
    if (el.type === "text") {
      inner = (
        <div style={{
          width: "100%", height: "100%", display: "flex", alignItems: "center",
          justifyContent: el.align === "center" ? "center" : el.align === "right" ? "flex-end" : "flex-start",
          color: el.color, fontSize: el.fontSize, fontWeight: el.fontWeight,
          fontStyle: el.fontStyle, textAlign: el.align, lineHeight: 1.2, overflow: "hidden",
        }}>
          {el.text}
        </div>
      );
    } else if (el.type === "button") {
      inner = (
        <div style={{
          width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          background: el.bg, color: el.color, fontSize: el.fontSize, fontWeight: 700,
          borderRadius: el.radius, letterSpacing: "0.03em",
        }}>
          {el.text} →
        </div>
      );
    } else if (el.type === "image") {
      const src = el._newFile ? URL.createObjectURL(el._newFile) : el.imageUrl;
      inner = src ? (
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: el.fit, borderRadius: el.radius, display: "block", pointerEvents: "none" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#33334d", color: "#ccc", fontSize: 11, textAlign: "center", padding: 6, borderRadius: el.radius }}>
          Double-click to add image
        </div>
      );
    } else if (el.type === "timer") {
      const c = getCountdown(el.targetDate);
      inner = (
        <div style={{ width: "100%", height: "100%", display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
          {[{ v: c.d, u: "Days" }, { v: c.h, u: "Hrs" }, { v: c.m, u: "Min" }, { v: c.s, u: "Sec" }].map(({ v, u }) => (
            <div key={u} style={{ background: el.boxColor, borderRadius: 10, padding: "8px 10px", textAlign: "center", minWidth: 46 }}>
              <div style={{ color: el.color, fontWeight: 900, fontSize: 18, lineHeight: 1 }}>{String(v).padStart(2, "0")}</div>
              <div style={{ color: el.labelColor, fontSize: 9, textTransform: "uppercase" }}>{u}</div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        key={el.id}
        style={style}
        onPointerDown={(e) => onPointerDownEl(e, el, "move")}
        onDoubleClick={(e) => {
          if (el.type === "image") {
            e.stopPropagation();
            pickImageFor(el.id);
          }
        }}
      >
        {inner}
        {/* resize handle */}
        {selectedId === el.id && (
          <div
            onPointerDown={(e) => onPointerDownEl(e, el, "resize")}
            style={{
              position: "absolute", right: -6, bottom: -6, width: 14, height: 14,
              background: "#2f80ed", borderRadius: 3, cursor: "nwse-resize", zIndex: 999,
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Hidden global file input used by all image elements */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onFilePicked}
      />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold">Offer Banner Builder</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-pink-500"
            />
            Show on website
          </label>
          <button
            onClick={onSave}
            disabled={loading}
            className="bg-black text-white px-5 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Banner"}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap bg-gray-100 p-3 rounded">
        <span className="text-sm font-medium mr-1">Add:</span>
        <button onClick={() => addElement("text")}   className="px-3 py-1.5 bg-white border rounded text-sm">＋ Text</button>
        <button onClick={() => addElement("image")}  className="px-3 py-1.5 bg-white border rounded text-sm">＋ Image</button>
        <button onClick={() => addElement("button")} className="px-3 py-1.5 bg-white border rounded text-sm">＋ Button</button>
        <button onClick={() => addElement("timer")}  className="px-3 py-1.5 bg-white border rounded text-sm">＋ Timer</button>

        <span className="text-sm font-medium ml-4 mr-1">Background:</span>
        <input type="color" value={/^#/.test(background) ? background : "#1a1a2e"} onChange={(e) => setBackground(e.target.value)} className="w-9 h-8 border rounded" />
        <input type="text" value={background} onChange={(e) => setBackground(e.target.value)} className="border rounded px-2 py-1 text-sm w-56" placeholder="#1a1a2e or gradient(...)" />
      </div>

      {/* Canvas size + radius */}
      <div className="flex items-center gap-4 flex-wrap bg-gray-100 p-3 rounded">
        <label className="text-sm flex items-center gap-2">
          Width
          <input type="number" min="200" value={canvasW} onChange={(e) => setCanvasW(Number(e.target.value) || 0)} className="border rounded px-2 py-1 w-24" />
        </label>
        <label className="text-sm flex items-center gap-2">
          Height
          <input type="number" min="100" value={canvasH} onChange={(e) => setCanvasH(Number(e.target.value) || 0)} className="border rounded px-2 py-1 w-24" />
        </label>
        <label className="text-sm flex items-center gap-2">
          Border radius
          <input type="number" min="0" value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value) || 0)} className="border rounded px-2 py-1 w-20" />
        </label>
      </div>

      <div className="flex gap-4 flex-wrap">
        {/* Canvas (true pixel size, scrollable on small screens) */}
        <div className="flex-1 min-w-[320px] overflow-auto">
          <div
            ref={canvasRef}
            onPointerDown={() => setSelectedId(null)}
            style={{
              position: "relative",
              width: canvasW,
              height: canvasH,
              maxWidth: "100%",
              background,
              borderRadius,
              overflow: "hidden",
              userSelect: "none",
              boxShadow: "0 4px 18px rgba(0,0,0,0.15)",
            }}
          >
            {elements
              .slice()
              .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
              .map(renderEl)}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Drag elements to move • drag the blue corner to resize • click empty area to deselect.
            The banner scales responsively on the website.
          </p>
        </div>

        {/* Properties panel */}
        <div className="w-full md:w-72 shrink-0 border rounded p-3 bg-white">
          {!selected ? (
            <p className="text-sm text-gray-400">Select an element to edit its properties, or add one from the toolbar.</p>
          ) : (
            <PropertiesPanel el={selected} updateEl={updateEl} deleteEl={deleteEl} pickImageFor={pickImageFor} />
          )}
        </div>
      </div>
    </div>
  );
};

/* ── A labelled field row (module-level so it is NOT recreated on every
   render — recreating it remounts inputs and drops keystrokes) ── */
const Row = ({ label, children }) => (
  <div className="flex flex-col gap-1 mb-3">
    <label className="text-xs font-medium text-gray-600">{label}</label>
    {children}
  </div>
);

/* ── Properties panel ── */
const PropertiesPanel = ({ el, updateEl, deleteEl, pickImageFor }) => {
  const set = (patch) => updateEl(el.id, patch);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold capitalize">{el.type} settings</span>
        <button onClick={() => deleteEl(el.id)} className="text-red-500 text-sm hover:underline">Delete</button>
      </div>

      {/* Position + size */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <label className="text-xs">X<input type="number" value={el.x} onChange={(e) => set({ x: Number(e.target.value) })} className="w-full border rounded px-2 py-1" /></label>
        <label className="text-xs">Y<input type="number" value={el.y} onChange={(e) => set({ y: Number(e.target.value) })} className="w-full border rounded px-2 py-1" /></label>
        <label className="text-xs">W<input type="number" value={el.w} onChange={(e) => set({ w: Number(e.target.value) })} className="w-full border rounded px-2 py-1" /></label>
        <label className="text-xs">H<input type="number" value={el.h} onChange={(e) => set({ h: Number(e.target.value) })} className="w-full border rounded px-2 py-1" /></label>
      </div>

      {/* TEXT */}
      {el.type === "text" && (
        <>
          <Row label="Text"><textarea value={el.text} onChange={(e) => set({ text: e.target.value })} className="border rounded px-2 py-1" rows={2} /></Row>
          <Row label="Font size"><input type="number" value={el.fontSize} onChange={(e) => set({ fontSize: Number(e.target.value) })} className="border rounded px-2 py-1" /></Row>
          <Row label="Weight">
            <select value={el.fontWeight} onChange={(e) => set({ fontWeight: Number(e.target.value) })} className="border rounded px-2 py-1">
              {[400, 500, 600, 700, 800, 900].map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </Row>
          <Row label="Style">
            <select value={el.fontStyle} onChange={(e) => set({ fontStyle: e.target.value })} className="border rounded px-2 py-1">
              <option value="normal">Normal</option>
              <option value="italic">Italic</option>
            </select>
          </Row>
          <Row label="Align">
            <select value={el.align} onChange={(e) => set({ align: e.target.value })} className="border rounded px-2 py-1">
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </Row>
          <Row label="Color"><input type="color" value={el.color} onChange={(e) => set({ color: e.target.value })} className="w-12 h-8 border rounded" /></Row>
        </>
      )}

      {/* IMAGE */}
      {el.type === "image" && (
        <>
          <Row label="Image">
            <button
              type="button"
              onClick={() => pickImageFor(el.id)}
              className="px-3 py-2 bg-pink-500 text-white rounded text-sm hover:bg-pink-600"
            >
              {el._newFile || el.imageUrl ? "Change Image" : "Choose Image"}
            </button>
            {el._newFile && (
              <span className="text-xs text-green-600 mt-1 block">✓ New image selected — click Save Banner</span>
            )}
          </Row>
          <Row label="Fit">
            <select value={el.fit} onChange={(e) => set({ fit: e.target.value })} className="border rounded px-2 py-1">
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="fill">Fill</option>
            </select>
          </Row>
          <Row label="Corner radius"><input type="number" value={el.radius} onChange={(e) => set({ radius: Number(e.target.value) })} className="border rounded px-2 py-1" /></Row>
        </>
      )}

      {/* BUTTON */}
      {el.type === "button" && (
        <>
          <Row label="Button text"><input type="text" value={el.text} onChange={(e) => set({ text: e.target.value })} className="border rounded px-2 py-1" /></Row>
          <Row label="Link (URL)"><input type="text" value={el.link} onChange={(e) => set({ link: e.target.value })} className="border rounded px-2 py-1" placeholder="/collections" /></Row>
          <Row label="Font size"><input type="number" value={el.fontSize} onChange={(e) => set({ fontSize: Number(e.target.value) })} className="border rounded px-2 py-1" /></Row>
          <Row label="Corner radius"><input type="number" value={el.radius} onChange={(e) => set({ radius: Number(e.target.value) })} className="border rounded px-2 py-1" /></Row>
          <div className="flex gap-3">
            <Row label="BG"><input type="color" value={el.bg} onChange={(e) => set({ bg: e.target.value })} className="w-12 h-8 border rounded" /></Row>
            <Row label="Text"><input type="color" value={el.color} onChange={(e) => set({ color: e.target.value })} className="w-12 h-8 border rounded" /></Row>
          </div>
        </>
      )}

      {/* TIMER */}
      {el.type === "timer" && (
        <>
          <Row label="Countdown end date & time">
            <input type="datetime-local" value={el.targetDate || ""} onChange={(e) => set({ targetDate: e.target.value })} className="border rounded px-2 py-1" />
          </Row>
          <div className="flex gap-3">
            <Row label="Number"><input type="color" value={el.color} onChange={(e) => set({ color: e.target.value })} className="w-12 h-8 border rounded" /></Row>
            <Row label="Box"><input type="color" value={/^#/.test(el.boxColor) ? el.boxColor : "#333333"} onChange={(e) => set({ boxColor: e.target.value })} className="w-12 h-8 border rounded" /></Row>
          </div>
        </>
      )}
    </div>
  );
};

export default OfferBanner;
