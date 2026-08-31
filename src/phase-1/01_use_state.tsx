// =============================================================
// Phase 1 — 01: useState
// =============================================================
// useState is the most fundamental React hook.
// It lets you add reactive state to a functional component.
//
// Signature:
//   const [state, setState] = useState(initialValue);
//
// Rules:
// - state is READ-ONLY — never mutate directly
// - setState triggers a re-render with the new value
// - For objects/arrays: always create a NEW copy (immutability)
// - For state that depends on previous state: use functional update
//
// Android/Compose analogy:
//   val count by remember { mutableStateOf(0) }
//   ~ const [count, setCount] = useState(0)
// =============================================================

import { useState } from "react";
import { makeFakeUser, makeFakeUsers } from "../lib/fake-data";

const fakeUser = makeFakeUser();
const fakeUsers = makeFakeUsers(3);

// ─────────────────────────────────────────────────────────────
// DEMO 1: Primitive state — number
// ─────────────────────────────────────────────────────────────

const CounterDemo = () => {
  // useState returns a tuple: [currentValue, setterFunction]
  // TypeScript infers the type from initial value: number
  const [count, setCount] = useState(0);

  return (
    <div className="demo-box">
      <p style={{ fontSize: "32px", fontWeight: 700, textAlign: "center", marginBottom: "16px" }}>
        {count}
      </p>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        {/* Direct value update */}
        <button className="btn btn-ghost" onClick={() => setCount(count - 1)}>−</button>

        {/*
         * Functional update form: setState(prev => newValue)
         * USE THIS when new state depends on previous state.
         * It's always safe because React guarantees "prev" is
         * the latest committed state, even in async contexts.
         */}
        <button className="btn btn-primary" onClick={() => setCount(prev => prev + 1)}>+</button>

        {/* Reset to initial value */}
        <button className="btn btn-danger" onClick={() => setCount(0)}>Reset</button>
      </div>
      <div className="code-hint" style={{ marginTop: "12px" }}>{`// Direct update — fine for simple cases
setCount(count + 1);

// Functional update — always safe, prefer for derived state
setCount(prev => prev + 1);`}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 2: Boolean state — toggle
// ─────────────────────────────────────────────────────────────

const ToggleDemo = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDark, setIsDark] = useState(false);

  return (
    <div className="demo-box">
      {/* Toggle pattern: negate the current boolean */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
        <button
          className="btn btn-primary"
          onClick={() => setIsVisible(prev => !prev)}
        >
          {isVisible ? "Hide" : "Show"} Content
        </button>

        <button
          className="btn btn-ghost"
          onClick={() => setIsDark(prev => !prev)}
        >
          {isDark ? "🌙 Dark" : "☀️ Light"} Mode
        </button>
      </div>

      {/* Conditional render — content only appears when isVisible is true */}
      {isVisible && (
        <div style={{
          padding: "12px",
          borderRadius: "8px",
          background: isDark ? "#1a1a2e" : "#f1f5f9",
          color: isDark ? "#e2e8f0" : "#1e293b",
          transition: "all 0.2s",
        }}>
          <p>Hello, <strong>{fakeUser.name}</strong>! This content toggles.</p>
          <p style={{ fontSize: "13px", marginTop: "4px", opacity: 0.7 }}>
            Theme: {isDark ? "Dark" : "Light"}
          </p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 3: Object state — updating fields immutably
// ─────────────────────────────────────────────────────────────

interface UserForm {
  name: string;
  email: string;
  role: "user" | "admin";
}

const ObjectStateDemo = () => {
  const [form, setForm] = useState<UserForm>({
    name: fakeUser.name,
    email: fakeUser.email,
    role: "user",
  });

  // Helper to update a single field without losing others
  // Spread operator {...prev} copies all fields, then [field] overrides one
  const updateField = <K extends keyof UserForm>(field: K, value: UserForm[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
        Object state — use spread to update immutably:
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <input
          style={{ padding: "8px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0" }}
          value={form.name}
          onChange={e => updateField("name", e.target.value)}
          placeholder="Name"
        />
        <input
          style={{ padding: "8px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0" }}
          value={form.email}
          onChange={e => updateField("email", e.target.value)}
          placeholder="Email"
        />
        <select
          style={{ padding: "8px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0" }}
          value={form.role}
          onChange={e => updateField("role", e.target.value as UserForm["role"])}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {/* Live preview of current state */}
      <div className="code-hint" style={{ marginTop: "12px" }}>
        {JSON.stringify(form, null, 2)}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 4: Array state — CRUD operations immutably
// ─────────────────────────────────────────────────────────────

const ArrayStateDemo = () => {
  // Initialize with faker names — no real data
  const [items, setItems] = useState<string[]>(fakeUsers.map(u => u.name));
  const [input, setInput] = useState("");

  const addItem = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    // NEVER push() — create a new array with spread
    setItems(prev => [...prev, trimmed]);
    setInput("");
  };

  const removeItem = (index: number) => {
    // filter creates a new array — immutable
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setItems(prev => {
      const next = [...prev]; // copy first
      [next[index - 1], next[index]] = [next[index], next[index - 1]]; // swap
      return next;
    });
  };

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
        Array state — always use spread/filter/map, never mutate directly:
      </p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <input
          style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0" }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addItem()}
          placeholder="Add item..."
        />
        <button className="btn btn-primary" onClick={addItem}>Add</button>
      </div>
      <ul style={{ listStyle: "none" }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", borderBottom: "1px solid #2d2d44" }}>
            <button className="btn btn-ghost" style={{ padding: "2px 8px", fontSize: "12px" }} onClick={() => moveUp(i)}>↑</button>
            <span style={{ flex: 1 }}>{item}</span>
            <button className="btn btn-danger" style={{ padding: "2px 8px", fontSize: "12px" }} onClick={() => removeItem(i)}>✕</button>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p style={{ color: "#4a4a6a", textAlign: "center", padding: "12px" }}>Empty list</p>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const UseState = () => (
  <div>
    <div className="section">
      <h3>1. Primitive State (number)</h3>
      <CounterDemo />
    </div>
    <div className="section">
      <h3>2. Boolean State (toggle)</h3>
      <ToggleDemo />
    </div>
    <div className="section">
      <h3>3. Object State (immutable update)</h3>
      <ObjectStateDemo />
    </div>
    <div className="section">
      <h3>4. Array State (CRUD immutably)</h3>
      <ArrayStateDemo />
    </div>
  </div>
);
