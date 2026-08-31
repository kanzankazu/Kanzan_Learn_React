// =============================================================
// Phase 5 — Mini Project: E-commerce Store
// =============================================================
// Full e-commerce page with multiple Zustand stores.
// Demonstrates real-world state management patterns.
//
// Stores:
// [x] useProductStore — product list, filter, sort
// [x] useCartStore    — cart items with persist (from 02_zustand.tsx)
// [x] useWishlistStore — wishlist with persist
// [x] useAuthStore    — current user
//
// Patterns demonstrated:
// [x] Multiple independent stores
// [x] Selective subscriptions for performance
// [x] devtools + persist middleware
// [x] Store actions that read other store state
// =============================================================

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { faker } from "@faker-js/faker";

faker.seed(123);

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  rating: number;
  emoji: string;
}

// ─────────────────────────────────────────────────────────────
// Product catalog (fake data)
// ─────────────────────────────────────────────────────────────

const CATEGORIES = ["Electronics", "Books", "Clothing", "Home", "Sports"];
const EMOJIS = ["📱", "💻", "📚", "👕", "🏠", "⚽", "🎧", "📷", "🖥️", "⌨️", "🔋", "🎮"];

const ALL_PRODUCTS: Product[] = Array.from({ length: 12 }, (_, i) => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  price: parseFloat(faker.commerce.price({ min: 9, max: 299 })),
  category: CATEGORIES[i % CATEGORIES.length],
  rating: parseFloat((faker.number.float({ min: 3, max: 5 })).toFixed(1)),
  emoji: EMOJIS[i % EMOJIS.length],
}));

// ─────────────────────────────────────────────────────────────
// Auth Store
// ─────────────────────────────────────────────────────────────

interface AuthStore {
  user: { name: string; email: string } | null;
  login: () => void;
  logout: () => void;
}

const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      user: null,
      login: () => set({ user: { name: faker.person.fullName(), email: faker.internet.email() } }, false, "login"),
      logout: () => set({ user: null }, false, "logout"),
    }),
    { name: "AuthStore" }
  )
);

// ─────────────────────────────────────────────────────────────
// Filter Store
// ─────────────────────────────────────────────────────────────

interface FilterStore {
  search: string;
  category: string;
  sort: "price-asc" | "price-desc" | "rating" | "name";
  setSearch: (q: string) => void;
  setCategory: (cat: string) => void;
  setSort: (sort: FilterStore["sort"]) => void;
  reset: () => void;
}

const useFilterStore = create<FilterStore>()(
  devtools(
    (set) => ({
      search: "", category: "All", sort: "name",
      setSearch: (search) => set({ search }, false, "setSearch"),
      setCategory: (category) => set({ category }, false, "setCategory"),
      setSort: (sort) => set({ sort }, false, "setSort"),
      reset: () => set({ search: "", category: "All", sort: "name" }, false, "reset"),
    }),
    { name: "FilterStore" }
  )
);

// ─────────────────────────────────────────────────────────────
// Cart Store (simple, persisted)
// ─────────────────────────────────────────────────────────────

interface CartEntry { productId: string; name: string; price: number; qty: number; emoji: string; }
interface MiniCartStore {
  items: CartEntry[];
  add: (p: Product) => void;
  remove: (id: string) => void;
  clear: () => void;
  total: () => number;
}

const useMiniCartStore = create<MiniCartStore>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        add: (p) => set(s => {
          const ex = s.items.find(i => i.productId === p.id);
          if (ex) return { items: s.items.map(i => i.productId === p.id ? { ...i, qty: i.qty + 1 } : i) };
          return { items: [...s.items, { productId: p.id, name: p.name, price: p.price, qty: 1, emoji: p.emoji }] };
        }, false, "addToCart"),
        remove: (id) => set(s => ({ items: s.items.filter(i => i.productId !== id) }), false, "removeFromCart"),
        clear: () => set({ items: [] }, false, "clearCart"),
        total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      }),
      { name: "mini-cart" }
    ),
    { name: "CartStore" }
  )
);

// ─────────────────────────────────────────────────────────────
// Wishlist Store (persisted)
// ─────────────────────────────────────────────────────────────

interface WishlistStore {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
}

const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => set(s => ({ ids: s.ids.includes(id) ? s.ids.filter(i => i !== id) : [...s.ids, id] })),
      has: (id) => get().ids.includes(id),
    }),
    { name: "wishlist" }
  )
);

// ─────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────

const TopBar = () => {
  const user = useAuthStore(s => s.user);
  const login = useAuthStore(s => s.login);
  const logout = useAuthStore(s => s.logout);
  const itemCount = useMiniCartStore(s => s.items.reduce((n, i) => n + i.qty, 0));
  const wishCount = useWishlistStore(s => s.ids.length);

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", padding: "10px 14px", background: "#1e1e2e", borderRadius: "10px" }}>
      <span style={{ fontWeight: 700, color: "#a5b4fc" }}>🛒 FakeShop</span>
      <div style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13px" }}>
        <span style={{ color: "#f472b6" }}>❤️ {wishCount}</span>
        <span style={{ color: "#4ade80" }}>🛒 {itemCount}</span>
        {user ? (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ color: "#7c85a2" }}>👤 {user.name.split(" ")[0]}</span>
            <button className="btn btn-danger" style={{ fontSize: "11px", padding: "3px 8px" }} onClick={logout}>Logout</button>
          </div>
        ) : (
          <button className="btn btn-primary" style={{ fontSize: "12px", padding: "4px 10px" }} onClick={login}>Login</button>
        )}
      </div>
    </div>
  );
};

const Filters = () => {
  const { search, category, sort, setSearch, setCategory, setSort, reset } = useFilterStore();
  const inputStyle = { padding: "6px 10px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0", fontSize: "13px" };

  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
      <input style={{ ...inputStyle, flex: 1, minWidth: "140px" }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
      <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
        <option value="All">All</option>
        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
      </select>
      <select style={inputStyle} value={sort} onChange={e => setSort(e.target.value as FilterStore["sort"])}>
        <option value="name">Name</option>
        <option value="price-asc">Price ↑</option>
        <option value="price-desc">Price ↓</option>
        <option value="rating">Rating</option>
      </select>
      <button className="btn btn-ghost" style={{ fontSize: "12px" }} onClick={reset}>Reset</button>
    </div>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const add = useMiniCartStore(s => s.add);
  const inCart = useMiniCartStore(s => s.items.some(i => i.productId === product.id));
  const { toggle, has } = useWishlistStore();
  const wished = has(product.id);

  return (
    <div style={{ background: "#1e1e2e", border: `1px solid ${inCart ? "#6366f1" : "#2d2d44"}`, borderRadius: "10px", padding: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "28px" }}>{product.emoji}</span>
        <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px" }} onClick={() => toggle(product.id)}>
          {wished ? "❤️" : "🤍"}
        </button>
      </div>
      <p style={{ fontWeight: 600, fontSize: "13px" }}>{product.name}</p>
      <p style={{ fontSize: "11px", color: "#7c85a2" }}>{product.category}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#4ade80", fontWeight: 700 }}>${product.price}</span>
        <span style={{ color: "#fbbf24", fontSize: "12px" }}>★ {product.rating}</span>
      </div>
      <button
        className={`btn ${inCart ? "btn-ghost" : "btn-primary"}`}
        style={{ fontSize: "12px", marginTop: "4px" }}
        onClick={() => add(product)}
      >
        {inCart ? "✅ In Cart (+1)" : "Add to Cart"}
      </button>
    </div>
  );
};

const CartSummary = () => {
  const { items, remove, clear, total } = useMiniCartStore();
  if (items.length === 0) return <p style={{ color: "#4a4a6a", fontSize: "13px" }}>Cart is empty</p>;
  return (
    <div>
      {items.map(item => (
        <div key={item.productId} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 0", borderBottom: "1px solid #1a1a2e", fontSize: "12px" }}>
          <span>{item.emoji}</span>
          <span style={{ flex: 1 }}>{item.name}</span>
          <span style={{ color: "#7c85a2" }}>×{item.qty}</span>
          <span style={{ color: "#4ade80" }}>${(item.price * item.qty).toFixed(2)}</span>
          <button style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }} onClick={() => remove(item.productId)}>✕</button>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontWeight: 700 }}>
        <span>Total</span>
        <span style={{ color: "#4ade80" }}>${total().toFixed(2)}</span>
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        <button className="btn btn-primary" style={{ flex: 1, fontSize: "13px" }} onClick={() => alert("Checkout!")}>Checkout</button>
        <button className="btn btn-danger" style={{ fontSize: "13px" }} onClick={clear}>Clear</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────

export const MiniProjectEcommerceStore = () => {
  const { search, category, sort } = useFilterStore();

  const filtered = ALL_PRODUCTS
    .filter(p => (category === "All" || p.category === category) &&
      (search === "" || p.name.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) =>
      sort === "price-asc" ? a.price - b.price :
      sort === "price-desc" ? b.price - a.price :
      sort === "rating" ? b.rating - a.rating :
      a.name.localeCompare(b.name)
    );

  return (
    <div>
      <TopBar />
      <Filters />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: "16px", alignItems: "start" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "10px" }}>
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          {filtered.length === 0 && <p style={{ color: "#4a4a6a", gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>No products found</p>}
        </div>
        <div style={{ background: "#1e1e2e", border: "1px solid #2d2d44", borderRadius: "10px", padding: "14px", position: "sticky", top: "80px" }}>
          <p style={{ fontWeight: 600, marginBottom: "10px", fontSize: "14px" }}>🛒 Cart</p>
          <CartSummary />
        </div>
      </div>
    </div>
  );
};
