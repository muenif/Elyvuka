const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  createOrder,
  trackOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Guest checkout has no account to gate abuse, so throttle order creation per IP.
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many orders placed. Please try again later." },
});

router.post("/", orderLimiter, createOrder);
router.get("/track", trackOrder);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrder);
router.put("/:id/status", protect, updateOrderStatus);

module.exports = router;
