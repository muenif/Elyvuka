const express = require("express");
const {
  getProducts,
  getRandomProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProductImage,
  deleteProduct,
} = require("../controllers/productController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", getProducts);
router.get("/random", getRandomProducts);
router.get("/:slug", getProduct);
router.post("/", protect, upload.array("images", 5), createProduct);
router.put("/:id", protect, upload.array("images", 5), updateProduct);
router.delete("/:id/images/:publicId", protect, deleteProductImage);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
