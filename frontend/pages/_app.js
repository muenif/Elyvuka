import Head from "next/head";
import "../styles/globals.css";
import { CartProvider } from "../context/CartContext";
import { ToastProvider } from "../context/ToastContext";
import { AdminAuthProvider } from "../context/AdminAuthContext";
import Toasts from "../components/Toasts";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>ELYVUKA</title>
      </Head>
      <ToastProvider>
        <CartProvider>
          <AdminAuthProvider>
            <Component {...pageProps} />
            <Toasts />
          </AdminAuthProvider>
        </CartProvider>
      </ToastProvider>
    </>
  );
}
