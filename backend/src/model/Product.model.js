import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productName: { type: String, required: true, trim: true },
    productType: { type: String, default: "general", trim: true },
    category: { type: String, default: "Other", trim: true },
    purchasePrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    profitMargin: { type: Number, default: 0 },
    stockQuantity: { type: Number, default: 0, min: 0 },
    lowStockLimit: { type: Number, default: 5, min: 0 },
    expiryDate: { type: Date, default: null },
    brand: { type: String, default: "", trim: true },
    supplier: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

productSchema.pre("save", function () {
  this.profitMargin =
    this.sellingPrice > 0
      ? Number(
          (
            ((this.sellingPrice - this.purchasePrice) / this.sellingPrice) *
            100
          ).toFixed(2),
        )
      : 0;
});

export default mongoose.model("Product", productSchema);
