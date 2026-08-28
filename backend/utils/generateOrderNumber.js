// Produces an order number like "LH-20240824-4821"
// Date part makes it human-scannable in the admin table, random suffix avoids collisions.
const generateOrderNumber = () => {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `LH-${datePart}-${randomPart}`;
};

module.exports = generateOrderNumber;
