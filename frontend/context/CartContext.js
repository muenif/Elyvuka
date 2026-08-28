import { createContext, useContext, useEffect, useState } from "react";
import { createOrder } from "../services/orderService";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Read localStorage only after mount, never during the initial render,
  // so server and client markup match on first paint (no hydration mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem("lh_cart");
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {
      // ignore corrupt cart data
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("lh_cart", JSON.stringify(items));
    } catch (e) {}
  }, [items, hydrated]);

  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((p) => p._id === product._id);
      if (found) {
        return prev.map((p) => (p._id === product._id ? { ...p, qty: p.qty + qty } : p));
      }
      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.url,
          qty,
        },
      ];
    });
  };

  const removeFromCart = (id) => setItems((prev) => prev.filter((p) => p._id !== id));
  const updateQty = (id, qty) =>
    setItems((prev) => prev.map((p) => (p._id === id ? { ...p, qty: Math.max(1, qty) } : p)));
  const clearCart = () => setItems([]);

  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.qty * (i.price || 0), 0);

  // Talks to the real backend - server re-validates price/stock, so what we
  // send here is just product ids + quantities, never trusted prices.
  const placeOrder = async (customer) => {
    const payload = {
      customer,
      items: items.map((i) => ({ product: i._id, qty: i.qty })),
    };
    const res = await createOrder(payload);
    clearCart();
    return res.data;
  };

  return (
    <CartContext.Provider
      value={{ items, hydrated, addToCart, removeFromCart, updateQty, clearCart, count, subtotal, placeOrder }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
