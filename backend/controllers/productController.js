const slugify = require("slugify");
const asyncHandler = require("../utils/asyncHandler");
const Product = require("../models/Product");
const { cloudinary, uploadBufferToCloudinary } = require("../config/cloudinary");

// @desc    Get products with search, filters, and pagination
// @route   GET /api/products?search=&category=&minPrice=&maxPrice=&brand=&page=&limit=&sort=
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    inStock,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  const query = { status: "active" };

  if (search) {
    // Escape regex special characters so user input can't break the pattern
    // or be used for a ReDoS-style attack, then do a real partial, case-insensitive
    // match across the fields shoppers actually search by - $text only matches
    // whole indexed words, so "elite" would never match "EliteBook".
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(escaped, "i");
    query.$or = [{ name: pattern }, { brand: pattern }, { description: pattern }, { sku: pattern }];
  }
  if (category) query.category = category;
  if (brand) query.brand = brand;
  if (inStock === "true") query.stock = { $gt: 0 };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
  };
  const sortBy = sortMap[sort] || { createdAt: -1 };

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Number(limit) || 12, 50);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query).populate("category", "name slug").sort(sortBy).skip(skip).limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: products,
  });
});

// @desc    Get a handful of random active products (home page "popular right now")
// @route   GET /api/products/random?limit=8
// @access  Public
const getRandomProducts = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 8, 20);

  // Match the same visibility rule as the regular listing (status: "active"
  // only) - requiring stock > 0 here caused "Popular right now" to show
  // nothing whenever products had stock unset/0, even though those same
  // products appeared fine via category browsing (which has no stock filter).
  const products = await Product.aggregate([
    { $match: { status: "active" } },
    { $sample: { size: limit } },
  ]);

  res.json({ success: true, count: products.length, data: products });
});

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate("category", "name slug");
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ success: true, data: product });
});

// @desc    Create product (multipart/form-data, field "images" up to 5 files)
// @route   POST /api/products
// @access  Private (admin)
const createProduct = asyncHandler(async (req, res) => {
  const { name, brand, description, category, price, stock, sku } = req.body;

  if (!name || !category || !price) {
    res.status(400);
    throw new Error("Name, category and price are required");
  }

  let specs = {};
  if (req.body.specs) {
    specs = typeof req.body.specs === "string" ? JSON.parse(req.body.specs) : req.body.specs;
  }

  const images = await Promise.all(
    (req.files || []).map((file) => uploadBufferToCloudinary(file.buffer))
  );

  const product = await Product.create({
    name,
    slug: slugify(`${name}-${Date.now()}`, { lower: true, strict: true }),
    brand,
    description,
    category,
    price,
    stock: stock || 0,
    // An empty string is still a value as far as MongoDB's sparse unique
    // index is concerned - only a genuinely *missing* field is exempt from
    // the uniqueness check. So blank input must become `undefined`, not "".
    sku: sku && sku.trim() ? sku.trim() : undefined,
    specs,
    images,
  });

  res.status(201).json({ success: true, data: product });
});

// @desc    Update product. New files in "images" are appended unless replaceImages=true
// @route   PUT /api/products/:id
// @access  Private (admin)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const fields = ["name", "brand", "description", "category", "price", "stock", "status", "isFeatured"];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  // Same sparse-unique-index caveat as createProduct: blank must mean
  // "no SKU" (field absent), not an empty string that collides with every
  // other product that also left SKU blank.
  if (req.body.sku !== undefined) {
    product.sku = req.body.sku && req.body.sku.trim() ? req.body.sku.trim() : undefined;
  }

  if (req.body.name) {
    product.slug = slugify(`${req.body.name}-${product._id}`, { lower: true, strict: true });
  }

  if (req.body.specs) {
    product.specs = typeof req.body.specs === "string" ? JSON.parse(req.body.specs) : req.body.specs;
  }

  if (req.files && req.files.length > 0) {
    const newImages = await Promise.all(
      req.files.map((file) => uploadBufferToCloudinary(file.buffer))
    );

    if (req.body.replaceImages === "true") {
      // Remove old images from Cloudinary before replacing.
      await Promise.all(
        product.images.map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => {}))
      );
      product.images = newImages;
    } else {
      product.images.push(...newImages);
    }
  }

  await product.save();
  res.json({ success: true, data: product });
});

// @desc    Delete product (and its Cloudinary images)
// @route   DELETE /api/products/:id
// @access  Private (admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await Promise.all(
    product.images.map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => {}))
  );
  await product.deleteOne();

  res.json({ success: true, data: {} });
});

// @desc    Delete a single image from a product, leaving the rest intact
// @route   DELETE /api/products/:id/images/:publicId
// @access  Private (admin)
const deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // publicId contains slashes (e.g. elyvuka/products/abc123) so it arrives
  // URL-encoded in the route param - decode before matching/destroying.
  const publicId = decodeURIComponent(req.params.publicId);
  const exists = product.images.some((img) => img.publicId === publicId);
  if (!exists) {
    res.status(404);
    throw new Error("Image not found on this product");
  }

  await cloudinary.uploader.destroy(publicId).catch(() => {});
  product.images = product.images.filter((img) => img.publicId !== publicId);
  await product.save();

  res.json({ success: true, data: product });
});

module.exports = {
  getProducts,
  getRandomProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProductImage,
  deleteProduct,
};
