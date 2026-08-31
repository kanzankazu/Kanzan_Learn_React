// =============================================================
// Phase 5 — 03: Jotai
// =============================================================
// Jotai takes an atomic approach to state management.
// State is broken into tiny "atoms" — minimal units of state.
// Components subscribe only to the atoms they use.
//
// Core API:
//   atom(initialValue)         → primitive atom
//   atom(get => derived)       → derived (read-only) atom
//   atomWithStorage(key, init) → persisted atom
//   useAtom(atom)              → [value, setter] (like useState)
//   useAtomValue(atom)         → value only (read-only consumer)
//   useSetAtom(atom)           → setter only (write-only)
//
// Key difference from Zustand:
//   Jotai: bottom-up — compose state from small atoms
//   Zustand: top-down — one store with all state
//
// install: npm install jotai
//
// Android/Compose analogy:
//   Atom ~ StateFlow / MutableStateFlow
//   Derived atom ~ derivedStateOf / combine()
// =============================================================

import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { faker } from "@faker-js/faker";

faker.seed(88);

// ─────────────────────────────────────────────────────────────
// ATOMS — defined outside components (global singletons)
// ─────────────────────────────────────────────────────────────

// Primitive atoms — hold a single value
const countAtom  = atom(0);
const nameAtom   = atom(faker.person.firstName());
const darkAtom   = atom(true);

// Derived (computed) atom — reads from other atoms
// The get function is called whenever dependencies change
const doubleAtom = atom(get => get(countAtom) * 2);
const greetAtom  = atom(get => `Hello, ${get(nameAtom)}! Count: ${get(countAtom)}`);

// Atom with localStorage persistence
const visitCountAtom = atomWithStorage("visit_count", 0);

// ─────────────────────────────────────────────────────────────
// DEMO 1: Basic atom usage
// ─────────────────────────────────────────────────────────────

const AtomBasicsDemo = () => {
  // useAtom returns [value, setter] — same API as useState
  const [count, setCount] = useAtom(countAtom);
  const [name, setName]   = useAtom(nameAtom);

  // useAtomValue — read-only (no setter returned)
  const double  = useAtomValue(doubleAtom);
  const greeting = useAtomValue(greetAtom);

  // useSetAtom — write-only (no value returned, saves re-render for write-only callers)
  const setDark = useSetAtom(darkAtom);

  return (
    <div className="demo-box">
      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" }}>
        <button className="btn btn-ghost" onClick={() => setCount(c => c - 1)}>−</button>
        <span style={{ fontWeight: 700, minWidth: "40px", textAlign: "center", fontSize: "20px" }}>{count}</span>
        <button className="btn btn-primary" onClick={() => setCount(c => c + 1)}>+</button>
        <span style={{ color: "#7c85a2", fontSize: "13px" }}>× 2 = <strong style={{ color: "#a78bfa" }}>{double}</strong></span>
      </div>

      <input
        style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0", marginBottom: "10px" }}
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Your name..."
      />

      <p style={{ color: "#4ade80", fontSize: "13px", marginBottom: "10px" }}>{greeting}</p>

      <button className="btn btn-ghost" style={{ fontSize: "12px" }} onClick={() => setDark(d => !d)}>
        Toggle dark (write-only setter)
      </button>

      <div className="code-hint" style={{ marginTop: "12px" }}>{`// Atoms are global singletons — defined once, used anywhere
const countAtom = atom(0);
const doubleAtom = atom(get => get(countAtom) * 2); // derived

// In component A:
const [count, setCount] = useAtom(countAtom);

// In component B — same atom, in sync:
const count = useAtomValue(countAtom);`}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 2: Multiple components sharing atoms
// ─────────────────────────────────────────────────────────────
// The power of Jotai: two separate components, same atom,
// automatically in sync — no prop drilling, no context setup

const CounterA = () => {
  const [count, setCount] = useAtom(countAtom);
  return (
    <div style={{ padding: "10px", background: "#12121c", borderRadius: "6px" }}>
      <p style={{ fontSize: "12px", color: "#7c85a2", marginBottom: "6px" }}>Component A</p>
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <button className="btn btn-ghost" style={{ padding: "3px 10px" }} onClick={() => setCount(c => c - 1)}>−</button>
        <strong style={{ minWidth: "30px", textAlign: "center" }}>{count}</strong>
        <button className="btn btn-primary" style={{ padding: "3px 10px" }} onClick={() => setCount(c => c + 1)}>+</button>
      </div>
    </div>
  );
};

const CounterB = () => {
  // Same atom — always in sync with CounterA
  const count = useAtomValue(countAtom);
  const double = useAtomValue(doubleAtom);
  return (
    <div style={{ padding: "10px", background: "#12121c", borderRadius: "6px" }}>
      <p style={{ fontSize: "12px", color: "#7c85a2", marginBottom: "6px" }}>Component B (read-only)</p>
      <p style={{ fontSize: "14px" }}>Count: <strong style={{ color: "#a5b4fc" }}>{count}</strong></p>
      <p style={{ fontSize: "14px" }}>Double: <strong style={{ color: "#a78bfa" }}>{double}</strong></p>
    </div>
  );
};

const SharedAtomDemo = () => (
  <div className="demo-box">
    <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
      Two components share the same atom — no Provider, no props needed:
    </p>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
      <CounterA />
      <CounterB />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// DEMO 3: Persisted atom
// ─────────────────────────────────────────────────────────────

const PersistedDemo = () => {
  const [visits, setVisits] = useAtom(visitCountAtom);

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        <code style={{ color: "#f472b6" }}>atomWithStorage</code> — survives page refresh (localStorage):
      </p>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={{ fontSize: "14px" }}>Visits: <strong style={{ color: "#4ade80" }}>{visits}</strong></span>
        <button className="btn btn-primary" onClick={() => setVisits(v => v + 1)}>Add Visit</button>
        <button className="btn btn-danger" onClick={() => setVisits(0)}>Reset</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const Jotai = () => (
  <div>
    <div className="section">
      <h3>1. Primitive + Derived Atoms</h3>
      <AtomBasicsDemo />
    </div>
    <div className="section">
      <h3>2. Shared Atoms Across Components</h3>
      <SharedAtomDemo />
    </div>
    <div className="section">
      <h3>3. atomWithStorage — Persisted State</h3>
      <PersistedDemo />
    </div>
  </div>
);
