import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, select: false },
    shopName: String,
    role: { type: String, enum: ["owner", "worker"], default: "owner" },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    tokenVersion: { type: Number, default: 0 },
    settings: {
      language: { type: String, enum: ["en", "hi", "kn"], default: "en" },
      theme: {
        type: String,
        enum: ["Light", "Dark", "System"],
        default: "Light",
      },
      notifications: {
        stock: { type: Boolean, default: true },
        expiry: { type: Boolean, default: true },
        udhaar: { type: Boolean, default: true },
        summary: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true },
);
schema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: "string" } } },
);
schema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } },
);
export default mongoose.model("User", schema);
