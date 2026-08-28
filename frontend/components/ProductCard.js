import { useRouter } from "next/router";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export default function ProductCard({ product, priority = false }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const image = product.images?.[0]?.url;
  const inStock = product.stock > 0;

  const go = () => router.push(`/product/${product.slug}`);

  return (
    <div className="card" role="button" tabIndex={0} onClick={go} style={{ cursor: "pointer" }}>
      {!inStock && <span className="out-of-stock-tag">Out of stock</span>}
      <div className="thumb" style={{ position: "relative" }}>
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 700px) 45vw, 220px"
            style={{ objectFit: "cover", borderRadius: 8 }}
            loading={priority ? "eager" : "lazy"}
            priority={priority}
          />
        ) : (
          "💻"
        )}
      </div>
      <div className="card-title">{product.name}</div>
      <span className="card-spec">
        {[product.specs?.processor, product.specs?.ram, product.specs?.storage].filter(Boolean).join(" · ") || product.brand}
      </span>
      <div className="price-row">
        <span className="price">KSh {product.price?.toLocaleString()}</span>
        <button
          className="mini-btn"
          disabled={!inStock}
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
            addToast(`${product.name} added to cart`, { type: "success" });
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
