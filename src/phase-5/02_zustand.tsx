// =============================================================
// Phase 5 — 02: Zustand
// =============================================================
// Zustand is a minimal, fast state management library (~1KB).
// It uses a simple store API with no boilerplate.
//
// Core API:
//   create((set, get) => ({ ...state, ...actions }))
//
// Key differences from Context + useReducer:
//   + Much less boilerplate
//   + Selective subscription — only re-renders what subscribes
//   + Built-in devtools (with devtools middleware)
//   + Built-in persist (with persist middleware)
//   + Store is a plain hook — works outside React trees too
//
// install: npm install zustand
//
// Android/Compose analogy:
//   StateFlow in ViewModel ~ Zustand store
//   collectAsState()       ~ useStore(selector)
// =============================================================

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { faker } from "@faker-js/faker";

faker.seed(66);

// ─────────────────────────────────────────────────────────────
// STORE 1: Counter store — simplest possible store
// ─────────────────────────────────────────────────────────────
// State + actions live together in one create() call

interface CounterStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  incrementBy: (amount: number) => void;
  reset: () => void;
}

// devtools: connects to Redux DevTools browser extension
const useCounterStore = create<CounterStore>()(
  devtools(
    (set) => ({
      count: 0,
      // set() is like setState — merges new values into the store
      increment: () => set(state => ({ count: state.count + 1 }), false, "increment"),
      decrement: () => set(state => ({ count: state.count - 1 }), false, "decrement"),
      incrementBy: (amount) => set(state => ({ count: state.count + amount }), false, "incrementBy"),
      reset: () => set({ count: 0 }, false, "reset"),
    }),
    { name: "CounterStore" } // name shown in DevTools
  )
);

const CounterStoreDemo = () => {
  // Subscribe to the ENTIRE store (re-renders on any change)
  const { count, increment, decrement, incrementBy, reset } = useCounterStore();

  return (
    <div className="demo-box">
      <div style={{ fontSize: "48px", fontWeight: 800, textAlign: "center", marginBottom: "16px" }}>{count}</div>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn btn-ghost" onClick={decrement}>−1</button>
        <button className="btn btn-primary" onClick={increment}>+1</button>
        <button className="btn btn-ghost" onClick={() => incrementBy(5)}>+5</button>
        <button className="btn btn-ghost" onClick={() => incrementBy(10)}>+10</button>
        <button className="btn btn-danger" onClick={reset}>Reset</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// STORE 2: Cart store — persist middleware
// ─────────────────────────────────────────────────────────────

interface CartItem { id: string; name: string; price: number; qty: number; }
interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  // Derived: computed from state using get()
  total: () => number;
  itemCount: () => number;
}

// persist: automatically syncs store to localStorage
const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        addItem: (item) => set(state => {
          const existing = state.items.find(i => i.id === item.id);
          if (existing) {
            return { items: state.items.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) };
          }
          return { items: [...state.items, { ...item, qty: 1 }] };
        }, false, "addItem"),
        removeItem: (id) => set(state => ({ items: state.items.filter(i => i.id !== id) }), false, "removeItem"),
        updateQty: (id, qty) => set(state => ({ items: state.items.map(i => i.id === id ? { ...i, qty } : i) }), false, "updateQty"),
        clearCart: () => set({ items: [] }, false, "clearCart"),
        // get() reads current state from inside the store
        total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
        itemCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      }),
      { name: "cart-storage" } // localStorage key
    ),
    { name: "CartStore" }
  )
);

const SHOP_ITEMS = Array.from({ length: 6 }, () => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  price: parseFloat(faker.commerce.price({ min: 5, max: 100 })),
}));

const CartStoreDemo = () => {
  const { items, addItem, removeItem, updateQty, clearCart, total, itemCount } = useCartStore();
  const inCart = new Set(items.map(i => i.id));

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
        Cart persists to localStorage via <code style={{ color: "#f472b6" }}>persist</code> middleware:
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {/* Products */}
        <div>
          <p style={{ fontSize: "12px", color: "#7c85a2", marginBottom: "8px" }}>Products</p>
          {SHOP_ITEMS.map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #1a1a2e", fontSize: "13px" }}>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
              <span style={{ color: "#4ade80", margin: "0 8px" }}>${item.price}</span>
              <button
                className={`btn ${inCart.has(item.id) ? "btn-ghost" : "btn-primary"}`}
                style={{ fontSize: "11px", padding: "2px 8px" }}
                onClick={() => addItem(item)}
              >
                {inCart.has(item.id) ? "+1" : "Add"}
              </button>
            </div>
          ))}
        </div>

        {/* Cart */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <p style={{ fontSize: "12px", color: "#7c85a2" }}>Cart ({itemCount()})</p>
            {items.length > 0 && <button className="btn btn-danger" style={{ fontSize: "11px", padding: "2px 8px" }} onClick={clearCart}>Clear</button>}
          </div>
          {items.length === 0 ? (
            <p style={{ color: "#4a4a6a", fontSize: "13px" }}>Empty</p>
          ) : (
            items.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 0", borderBottom: "1px solid #1a1a2e", fontSize: "12px" }}>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                <input
                  type="number" min={1} max={99} value={item.qty}
                  onChange={e => updateQty(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: "36px", padding: "2px", borderRadius: "4px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0", textAlign: "center" }}
                />
                <button style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }} onClick={() => removeItem(item.id)}>✕</button>
              </div>
            ))
          )}
          {items.length > 0 && (
            <p style={{ color: "#4ade80", fontWeight: 700, fontSize: "14px", marginTop: "8px" }}>
              Total: ${total().toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO: Selective subscription — only re-render what changed
// ─────────────────────────────────────────────────────────────

// This component only subscribes to `count` — won't re-render if cart changes
const CountDisplay = () => {
  const count = useCounterStore(state => state.count); // selector
  return (
    <div style={{ padding: "8px 12px", background: "#12121c", borderRadius: "6px", fontSize: "13px", color: "#a5b4fc" }}>
      Count from store (selective): <strong>{count}</strong>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const Zustand = () => (
  <div>
    <div className="section">
      <h3>1. Simple Counter Store</h3>
      <CounterStoreDemo />
    </div>
    <div className="section">
      <h3>2. Cart Store with persist middleware</h3>
      <CartStoreDemo />
    </div>
    <div className="section">
      <h3>3. Selective Subscription</h3>
      <div className="demo-box">
        <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
          Selector: <code style={{ color: "#f472b6" }}>useCounterStore(state =&gt; state.count)</code> — only re-renders when count changes:
        </p>
        <CountDisplay />
        <div className="code-hint" style={{ marginTop: "8px" }}>{`// Subscribe to full store (re-renders on any change)
const store = useCounterStore();

// Subscribe to one field only (only re-renders when that field changes)
const count = useCounterStore(state => state.count);
const items = useCartStore(state => state.items);`}</div>
      </div>
    </div>
  </div>
);
