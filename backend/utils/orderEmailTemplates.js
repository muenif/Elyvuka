const formatKSh = (amount) => `KSh ${Number(amount).toLocaleString("en-KE")}`;

const itemsRows = (items) =>
  items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #DCE5DE;">${item.name} x${item.qty}</td>
        <td style="padding:8px 0;border-bottom:1px solid #DCE5DE;text-align:right;">${formatKSh(
          item.price * item.qty
        )}</td>
      </tr>`
    )
    .join("");

const customerConfirmationEmail = (order) => `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#12201A;">
    <div style="background:#0F3D2E;padding:20px;border-radius:10px 10px 0 0;">
      <span style="color:#fff;font-size:18px;font-weight:bold;">ELYVUKA</span>
    </div>
    <div style="border:1px solid #DCE5DE;border-top:none;padding:24px;border-radius:0 0 10px 10px;">
      <h2 style="color:#0F3D2E;margin-top:0;">Thanks, ${order.customer.name}! Your order is in.</h2>
      <p>We've received order <strong>${order.orderNumber}</strong> and our team will call
      <strong>${order.customer.phone}</strong> shortly to confirm delivery details.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        ${itemsRows(order.items)}
        <tr><td style="padding:10px 0 0;">Delivery fee</td><td style="padding:10px 0 0;text-align:right;">${formatKSh(
          order.deliveryFee
        )}</td></tr>
        <tr><td style="padding:10px 0;font-weight:bold;border-top:1px solid #DCE5DE;">Total (pay on delivery)</td>
          <td style="padding:10px 0;font-weight:bold;text-align:right;border-top:1px solid #DCE5DE;">${formatKSh(
            order.total
          )}</td></tr>
      </table>
      <p style="font-size:13px;color:#4A5A52;">Delivering to: ${order.customer.address}, ${order.customer.area}</p>
      <p style="font-size:13px;color:#4A5A52;">Pay cash or M-Pesa when the rider hands over your order.</p>
    </div>
  </div>
`;

const adminNewOrderEmail = (order) => `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#12201A;">
    <h2 style="color:#0F3D2E;">New order: ${order.orderNumber}</h2>
    <p><strong>${order.customer.name}</strong> · ${order.customer.phone}</p>
    <p>${order.customer.address}, ${order.customer.area}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${itemsRows(order.items)}
      <tr><td style="padding:10px 0;font-weight:bold;border-top:1px solid #DCE5DE;">Total</td>
        <td style="padding:10px 0;font-weight:bold;text-align:right;border-top:1px solid #DCE5DE;">${formatKSh(
          order.total
        )}</td></tr>
    </table>
    <p>Open the admin dashboard to confirm this order.</p>
  </div>
`;

module.exports = { customerConfirmationEmail, adminNewOrderEmail };
