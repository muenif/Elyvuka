const asyncHandler = require("../utils/asyncHandler");
const Order = require("../models/Order");
const Product = require("../models/Product");
const generateOrderNumber = require("../utils/generateOrderNumber");
const sendEmail = require("../utils/sendEmail");
const { customerConfirmationEmail, adminNewOrderEmail } = require("../utils/orderEmailTemplates");

//const DELIVERY_FEE = 300;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @desc    Place a guest order (pay on delivery)
// @route   POST /api/orders
// @access  Public
const createOrder = asyncHandler(async (req, res) => {
  const { customer, items } = req.body;

  if (!customer?.name || !customer?.phone || !customer?.email || !customer?.address || !customer?.area) {
    res.status(400);
    throw new Error("Name, email, phone, address and area are required");
  }
  if (!EMAIL_RE.test(customer.email.trim())) {
    res.status(400);
    throw new Error("Please provide a valid email address");
  }
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("Order must contain at least one item");
  }

  // Re-fetch products server-side so price/stock can never be spoofed from the client.
  const productIds = items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds } });

  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = products.find((p) => p._id.toString() === item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }
    if (product.stock < item.qty) {
      res.status(400);
      throw new Error(`Not enough stock for ${product.name}. Available: ${product.stock}`);
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      qty: item.qty,
      image: product.images?.[0]?.url,
    });
    subtotal += product.price * item.qty;
  }

  const total = subtotal //+ DELIVERY_FEE;

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    customer,
    items: orderItems,
    subtotal,
   // deliveryFee: DELIVERY_FEE,
    total,
  });

  // Decrement stock now that the order is confirmed as placed.
  await Promise.all(
    orderItems.map((item) =>
      Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } })
    )
  );

  // Wait for both sends so delivery completes before confirming the order.
  await Promise.all([
    sendEmail({
      to: order.customer.email,
      subject: `Order confirmed - ${order.orderNumber}`,
      html: customerConfirmationEmail(order),
    }),
    sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New order - ${order.orderNumber}`,
      html: adminNewOrderEmail(order),
    }),
  ]);

  res.status(201).json({ success: true, data: order });
});

// @desc    Track an order publicly by order number + phone
// @route   GET /api/orders/track?orderNumber=&phone=
// @access  Public
const trackOrder = asyncHandler(async (req, res) => {
  const { orderNumber, phone } = req.query;
  if (!orderNumber || !phone) {
    res.status(400);
    throw new Error("Order number and phone are required");
  }

  const order = await Order.findOne({ orderNumber, "customer.phone": phone });
  if (!order) {
    res.status(404);
    throw new Error("No matching order found");
  }

  res.json({ success: true, data: order });
});

// @desc    Get all orders (filter by status, paginated)
// @route   GET /api/orders?status=&page=&limit=
// @access  Private (admin)
const getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Number(limit) || 20, 100);
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Order.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: orders.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: orders,
  });
});

// @desc    Get a single order
// @route   GET /api/orders/:id
// @access  Private (admin)
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json({ success: true, data: order });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!Order.ORDER_STATUSES.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${Order.ORDER_STATUSES.join(", ")}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status;
  await order.save();

  res.json({ success: true, data: order });
});

module.exports = {
  createOrder,
  trackOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
};
