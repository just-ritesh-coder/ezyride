const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const hasBearer = auth.startsWith("Bearer ");
    if (!hasBearer) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = auth.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      console.error("JWT verify error:", e.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }

    // Prefer to attach both for compatibility
    req.userId = decoded.id;

    const user = await User.findById(decoded.id).select(
      "_id fullName email phone vehicle preferences profilePicture createdAt"
    );
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = { protect };
