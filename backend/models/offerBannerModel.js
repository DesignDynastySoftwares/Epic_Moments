import mongoose from "mongoose";

/**
 * Single-record banner (only one document is used — the latest one).
 *
 * The banner is a free-form canvas of absolutely-positioned elements
 * (Canva-style). Each element in `elements` looks like:
 * {
 *   id: "el_123",
 *   type: "text" | "image" | "button" | "timer",
 *   x, y, w, h, rotation, zIndex,
 *   // text:   text, fontSize, fontWeight, fontStyle, color, align, fontFamily
 *   // image:  imageUrl, public_id, radius, fit
 *   // button: text, link, bg, color, fontSize, radius
 *   // timer:  targetDate, color, bg, boxColor, labelColor
 * }
 *
 * Legacy fields are kept so the old simple banner still works as a fallback.
 */
const offerBannerSchema = new mongoose.Schema(
  {
    // ── Canva-style canvas ──
    canvasWidth: { type: Number, default: 1200 },
    canvasHeight: { type: Number, default: 400 },
    borderRadius: { type: Number, default: 20 },
    background: { type: String, default: "#1a1a2e" }, // css color or gradient
    backgroundImage: { type: String, default: "" },
    backgroundPublicId: { type: String, default: "" },

    // free-form elements — stored as flexible objects
    elements: { type: [mongoose.Schema.Types.Mixed], default: [] },

    // ── Legacy simple-banner fields (fallback) ──
    image: { type: String, default: "" },
    public_id: { type: String, default: "" },
    heading: { type: String, default: "Make Every Moment Unforgettable" },
    description: {
      type: String,
      default: "Personalized gifts for your loved ones that they will cherish forever.",
    },
    buttonText: { type: String, default: "Shop Now" },
    buttonLink: { type: String, default: "/collections" },
    discount: { type: String, default: "20%" },
    label: { type: String, default: "Limited Time Offer" },
    targetDate: { type: Date, default: null },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, minimize: false }
);

export default mongoose.model("offerBanner", offerBannerSchema);
