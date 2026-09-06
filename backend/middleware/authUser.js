// middleware/authUser.js
import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "User not authorized", code: "NO_TOKEN" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;

    next();
  } catch (error) {
    const code = error.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN";
    return res.status(401).json({ success: false, message: "Session expired. Please login again.", code });
  }
};

export default authUser;
