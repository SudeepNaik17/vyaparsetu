import jwt from "jsonwebtoken";
import User from "../model/User.model.js";
export async function protect(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Session expired. Please log in." });
  }
  const user = await User.findById(decoded.userId);
  if (!user || (user.tokenVersion || 0) !== (decoded.version || 0))
    return res
      .status(401)
      .json({ success: false, message: "Session expired. Please log in." });
  req.user = user;
  next();
}
export const requireOwner = (req, res, next) =>
  req.user?.role === "owner"
    ? next()
    : res
        .status(403)
        .json({ success: false, message: "Owner access required" });
export const getShopOwnerId = (user) =>
  user.role === "owner" ? user._id : user.ownerId;
