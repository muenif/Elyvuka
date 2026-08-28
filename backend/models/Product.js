const mongoose = require("mongoose");

const specsSchema = new mongoose.Schema(
  {
    processor: String,
    ram: String,
    storage: String,
    display: String,
    graphics: String,
    battery: String,
    warranty: String,
  },
  { _id: false }
);

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    brand: { type: String, trim: true },
    description: { type: String, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, unique: true, sparse: true, trim: true },
    specs: specsSchema,
    images: [imageSchema],
    isFeatured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", brand: "text", description: "text" });
productSchema.index({ category: 1 });

// Convenience field the admin table and cards use directly.
productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});
productSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
