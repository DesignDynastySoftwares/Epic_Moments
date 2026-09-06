import EnquiryModel from "../models/enquiryModel.js";
import { sendEmail } from "../utils/sendEmail.js";

export const submitEnquiry = async (req, res) => {
  try {
    const { name, email, message, phone, subject } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Name, email and message are required" });
    }

    // Combine phone/subject into the stored message so nothing is lost
    const extras = [
      phone ? `Phone: ${phone}` : "",
      subject ? `Subject: ${subject}` : "",
    ]
      .filter(Boolean)
      .join(" | ");
    const fullMessage = extras ? `${extras}\n\n${message}` : message;

    const newEnquiry = new EnquiryModel({ name, email, message: fullMessage });
    await newEnquiry.save();

    // Notify admin by email (best-effort — won't block on failure)
    const adminEmail = process.env.EMAIL_USER;
    if (adminEmail) {
      sendEmail({
        to: adminEmail,
        subject: `New Enquiry from ${name}${subject ? " — " + subject : ""}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 20px; border: 1px solid #f0e0ea; border-radius: 12px;">
            <h2 style="color: #e8157e; margin: 0 0 12px;">New Contact Enquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
            ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
            <p><strong>Message:</strong></p>
            <p style="background:#fce4f0; padding:12px; border-radius:8px; color:#3d0066;">${message}</p>
          </div>
        `,
      }).catch((e) => console.error("Enquiry email failed:", e.message));
    }

    res.status(201).json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("submitEnquiry error:", error);
    res.status(500).json({ success: false, message: "Error sending enquiry" });
  }
};

export const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await EnquiryModel.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch enquiries", error });
  }
};
