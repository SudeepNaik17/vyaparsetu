import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    totalPurchases: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    totalDue: { type: Number, default: 0 },
    lastPurchaseDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Customer", customerSchema);
