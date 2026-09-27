import mongoose from "mongoose";

const udhaarSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sales",
      default: null,
    },
    amount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    balance: { type: Number, required: true, min: 0 },
    note: { type: String, default: "" },
    dueDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },
    payments: [
      {
        amount: { type: Number, required: true, min: 0 },
        paidAt: { type: Date, default: Date.now },
        note: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Udhaar", udhaarSchema);
