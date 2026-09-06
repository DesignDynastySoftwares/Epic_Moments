import { v2 as cloudinary } from "cloudinary";
import offerBannerModel from "../models/offerBannerModel.js";

// GET the offer banner (returns the single latest record, or null)
export const getOfferBanner = async (req, res) => {
  try {
    const banner = await offerBannerModel.findOne().sort({ createdAt: -1 });
    res.json({ success: true, banner });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

/**
 * CREATE or UPDATE the offer banner (upsert — only one banner is kept).
 *
 * Accepts JSON body:
 *  - canvasWidth, canvasHeight, background
 *  - elements: array. For image elements, a `newImageData` field may hold a
 *    base64 data URL to be uploaded to Cloudinary.
 */
export const saveOfferBanner = async (req, res) => {
  try {
    const { canvasWidth, canvasHeight, borderRadius, background, isActive, elements } = req.body;

    let banner = await offerBannerModel.findOne().sort({ createdAt: -1 });

    // Normalise elements
    let parsedElements = [];
    if (elements) {
      parsedElements = typeof elements === "string" ? JSON.parse(elements) : elements;
    }

    let uploadCount = 0;

    // Upload any base64 images for image elements
    for (const el of parsedElements) {
      if (el.type === "image" && el.newImageData) {
        try {
          const up = await cloudinary.uploader.upload(el.newImageData, {
            resource_type: "image",
            folder: "offerBanner",
          });
          // delete previous image for this element if present
          if (el.public_id) {
            try { await cloudinary.uploader.destroy(el.public_id); } catch {}
          }
          el.imageUrl = up.secure_url;
          el.public_id = up.public_id;
          uploadCount++;
        } catch (upErr) {
          console.error("❌ Cloudinary upload failed:", upErr.message);
          return res.json({
            success: false,
            message: "Image upload failed: " + upErr.message,
          });
        }
        delete el.newImageData; // don't store base64 in DB
      }
    }

    const data = {
      elements: parsedElements,
      ...(canvasWidth !== undefined && { canvasWidth: Number(canvasWidth) }),
      ...(canvasHeight !== undefined && { canvasHeight: Number(canvasHeight) }),
      ...(borderRadius !== undefined && { borderRadius: Number(borderRadius) }),
      ...(background !== undefined && { background }),
      ...(isActive !== undefined && { isActive: isActive === true || isActive === "true" }),
    };

    if (banner) {
      Object.assign(banner, data);
      banner.markModified("elements"); // Mixed array — force persist
      await banner.save();
    } else {
      banner = await offerBannerModel.create(data);
    }

    console.log(
      `✅ Offer banner saved — ${parsedElements.length} elements, ${uploadCount} image(s) uploaded`
    );

    res.json({ success: true, message: "Offer banner saved", banner });
  } catch (error) {
    console.error("❌ saveOfferBanner error:", error);
    res.json({ success: false, message: error.message });
  }
};
