import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: { type: String, required: true },
    args: { type: mongoose.Schema.Types.Mixed, required: true },
    summary: String,
    language: String,
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed"],
      default: "pending",
    },
    result: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);
export default mongoose.model("AIDraft", schema);
