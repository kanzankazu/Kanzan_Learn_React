// =============================================================
// Phase 1 — Mini Project: Shopping Cart
// =============================================================
// Combines all Phase 1 concepts:
// [x] useState — cart items, quantities, UI toggles
// [x] Event handling — add, remove, quantity change
// [x] Controlled input — search filter
// [x] Lifting state up — cart state shared between ProductList and CartSidebar
//
// Component tree:
//   ShoppingCart (parent — owns all state)
//   ├── SearchBar      (controlled input)
//   ├── ProductGrid    (reads products + cart, triggers add)
//   │   └── ProductCard (atom)
//   └── CartSidebar    (reads cart, triggers remove/clear)
//       └── CartItem   (atom)
// =============================================================

import { useState, useMemo } from "react";
import { faker } from "@faker-js/faker";

faker.seed(99);

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  emoji: string;
}

interface CartEntry {
  product: Product;
  qty: number;
}

// ─────────────────────────────────────────────────────────────
// Fake product catalog
// ─────────────────────────────────────────────────────────────

const EMOJIS = ["📱", "💻", "🎧", "⌨️", "🖱️", "📷", "🔋", "💾", "🖨️", "📺"];
const CATEGORIES = ["Mobile", "Computing", "Audio", "Accessories", "Storage"];

const PRODUCTS: Product[] = Array.from({ length: 9 }, (_, i) => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  price: parseFloat(faker.commerce.price({ min: 10, max: 300 })),
  category: CATEGORIES[i % CATEGORIES.length],
  emoji: EMOJIS[i % EMOJIS.length],
}));

// ─────────────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────────────

const ProductCard = ({
  product,
  inCart,
  onAdd,
}: {
  product: Product;
  inCart: boolean;
  onAdd: (product: Product) => void;
}) => (
  <div style={{
    background: "#1e1e2e",
    border: `1px solid ${inCart ? "#6366f1" : "#2d2d44"}`,
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  }}>
    <div style={{ fontSize: "32px", textAlign: "center" }}>{product.emoji}</div>
    <p style={{ fontWeight: 600, fontSize: "14px" }}>{product.name}</p>
    <p style={{ color: "#7c85a2", fontSize: "12px" }}>{product.category}</p>
    <p style={{ color: "#4ade80", fontWeight: 700 }}>${product.price.toFixed(2)}</p>
    <button
      className={`btn ${inCart ? "btn-ghost" : "btn-primary"}`}
      style={{ fontSize: "13px", marginTop: "auto" }}
      onClick={() => onAdd(product)}
    >
      {inCart ? "✅ In Cart" : "+ Add to Cart"}
    </button>
  </div>
);

const CartItem = ({
  entry,
  onRemove,
  onQtyChange,
}: {
  entry: CartEntry;
  onRemove: (id: string) => void;
  onQtyChange: (id: string, qty: number) => void;
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 0", borderBottom: "1px solid #2d2d44" }}>
    <span style={{ fontSize: "20px" }}>{entry.product.emoji}</span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {entry.product.name}
      </p>
      <p style={{ fontSize: "12px", color: "#4ade80" }}>${(entry.product.price * entry.qty).toFixed(2)}</p>
    </div>
    {/* Controlled qty input */}
    <input
      type="number"
      min={1}
      max={99}
      value={entry.qty}
      onChange={e => onQtyChange(entry.product.id, Math.max(1, parseInt(e.target.value) || 1))}
      style={{ width: "48px", padding: "4px", borderRadius: "4px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0", textAlign: "center" }}
    />
    <button className="btn btn-danger" style={{ padding: "4px 8px", fontSize: "12px" }} onClick={() => onRemove(entry.product.id)}>✕</button>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Main component — owns all state (lifting state up pattern)
// ─────────────────────────────────────────────────────────────

export const MiniProjectShoppingCart = () => {
  // All shared state lives here — passed down to all children
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [search, setSearch] = useState("");  // controlled input
  const [showCart, setShowCart] = useState(false);

  // Derived values — computed from state, no extra useState needed
  const cartIds = new Set(cart.map(e => e.product.id));
  const totalItems = cart.reduce((sum, e) => sum + e.qty, 0);
  const totalPrice = cart.reduce((sum, e) => sum + e.product.price * e.qty, 0);

  // useMemo: only recompute when products or search changes
  const filteredProducts = useMemo(
    () => PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  // Handlers — defined in parent, passed as callbacks to children
  const handleAdd = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(e => e.product.id === product.id);
      if (existing) {
        // Already in cart — increase qty
        return prev.map(e => e.product.id === product.id ? { ...e, qty: e.qty + 1 } : e);
      }
      // New item — add with qty 1
      return [...prev, { product, qty: 1 }];
    });
  };

  const handleRemove = (id: string) =>
    setCart(prev => prev.filter(e => e.product.id !== id));

  const handleQtyChange = (id: string, qty: number) =>
    setCart(prev => prev.map(e => e.product.id === id ? { ...e, qty } : e));

  const handleClear = () => setCart([]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <input
          style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0", fontSize: "14px" }}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
        />
        <button
          className="btn btn-primary"
          style={{ position: "relative", flexShrink: 0 }}
          onClick={() => setShowCart(prev => !prev)}
        >
          🛒 Cart
          {totalItems > 0 && (
            <span style={{ position: "absolute", top: "-6px", right: "-6px", background: "#ef4444", color: "#fff", borderRadius: "999px", fontSize: "11px", padding: "1px 5px", fontWeight: 700 }}>
              {totalItems}
            </span>
          )}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: showCart ? "1fr 280px" : "1fr", gap: "16px", alignItems: "start" }}>
        {/* Product grid */}
        <div>
          {filteredProducts.length === 0 ? (
            <p style={{ color: "#4a4a6a", textAlign: "center", padding: "40px" }}>No products found</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  inCart={cartIds.has(product.id)}
                  onAdd={handleAdd}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cart sidebar — only rendered when showCart is true */}
        {showCart && (
          <div style={{ background: "#1e1e2e", border: "1px solid #2d2d44", borderRadius: "12px", padding: "16px", position: "sticky", top: "80px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <p style={{ fontWeight: 600 }}>Cart ({totalItems})</p>
              {cart.length > 0 && (
                <button className="btn btn-danger" style={{ padding: "4px 10px", fontSize: "12px" }} onClick={handleClear}>
                  Clear All
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <p style={{ color: "#4a4a6a", textAlign: "center", padding: "20px 0" }}>Your cart is empty</p>
            ) : (
              <>
                {cart.map(entry => (
                  <CartItem key={entry.product.id} entry={entry} onRemove={handleRemove} onQtyChange={handleQtyChange} />
                ))}
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #2d2d44" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                    <span>Total</span>
                    <span style={{ color: "#4ade80" }}>${totalPrice.toFixed(2)}</span>
                  </div>
                  <button className="btn btn-primary" style={{ width: "100%", marginTop: "12px" }} onClick={() => alert("Checkout!")}>
                    Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
