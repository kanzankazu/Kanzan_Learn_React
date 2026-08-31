// =============================================================
// Phase 3 — 03: Rules of Hooks
// =============================================================
// React's Rules of Hooks are enforced by the eslint-plugin-react-hooks.
// Breaking them causes subtle bugs that are hard to track down.
//
// RULE 1: Only call hooks at the TOP LEVEL
//   - Never inside if/else, loops, or nested functions
//   - React relies on call ORDER to associate state with hooks
//
// RULE 2: Only call hooks from REACT FUNCTIONS
//   - Functional components ✅
//   - Custom hooks ✅
//   - Regular JS functions ❌
//   - Class components ❌
//
// RULE 3: Custom hook names MUST start with "use"
//   - This is how React and the linter identifies hooks
//
// WHY these rules?
//   React maintains a linked list of hook states per component.
//   Each render must call hooks in the SAME ORDER so React can
//   match the state to the right hook call.
//   If you put a hook inside an if-block, the order changes
//   across renders → React assigns state to the wrong hook.
// =============================================================

import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────────
// DEMO: Visualize hook call order
// ─────────────────────────────────────────────────────────────

// This component demonstrates how React tracks hooks by ORDER
const HookOrderDemo = () => {
  // Hook #1: Always called first
  const [nameInput, setNameInput] = useState("Alice");
  // Hook #2: Always called second
  const [count, setCount] = useState(0);
  // Hook #3: Always called third
  const [isVisible, setIsVisible] = useState(true);

  // Hook #4: Always called fourth — effect
  useEffect(() => {
    // This runs because count is in deps
  }, [count]);

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
        React tracks hooks by their call ORDER (1st, 2nd, 3rd...). Order must be identical on every render:
      </p>
      <div style={{ fontFamily: "monospace", fontSize: "13px", lineHeight: "1.8" }}>
        {[
          { n: 1, hook: "useState(nameInput)", value: nameInput },
          { n: 2, hook: "useState(count)",    value: String(count) },
          { n: 3, hook: "useState(isVisible)", value: String(isVisible) },
          { n: 4, hook: "useEffect([count])",  value: "side effect" },
        ].map(item => (
          <div key={item.n} style={{ display: "flex", gap: "8px", padding: "4px 8px", borderRadius: "4px", background: "#12121c", marginBottom: "4px" }}>
            <span style={{ color: "#6366f1", minWidth: "20px" }}>#{item.n}</span>
            <span style={{ color: "#f472b6" }}>{item.hook}</span>
            <span style={{ color: "#4ade80", marginLeft: "auto" }}>→ {item.value}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input
          style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#1a1a2e", color: "#e2e8f0", fontSize: "13px" }}
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
        />
        <button className="btn btn-ghost" onClick={() => setCount(c => c + 1)}>Count +</button>
        <button className="btn btn-ghost" onClick={() => setIsVisible(v => !v)}>Toggle</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Code examples: Right vs Wrong patterns
// ─────────────────────────────────────────────────────────────

const RulesCodeExamples = () => (
  <div>
    <div className="demo-box" style={{ marginBottom: "12px" }}>
      <p style={{ color: "#f87171", fontWeight: 600, marginBottom: "8px", fontSize: "13px" }}>
        ❌ WRONG — breaks the rules:
      </p>
      <div className="code-hint">{`// Rule 1 broken: hook inside if-block
function BadComponent({ show }) {
  if (show) {
    const [val, setVal] = useState(""); // ERROR!
    // On first render: hook #1 = useState
    // If show becomes false: hook #1 is SKIPPED
    // React loses track of which state belongs here
  }
  return <div />;
}

// Rule 1 broken: hook inside loop
function BadList({ items }) {
  items.forEach(item => {
    const [checked, setChecked] = useState(false); // ERROR!
    // Loop count can change — hook order changes
  });
}

// Rule 2 broken: hook in regular function
function notAHook() {
  const [x, setX] = useState(0); // ERROR! Not a React function
}

// Rule 3 broken: custom hook without "use" prefix
function fetchData(url) {   // ERROR! Should be useFetchData
  const [data, setData] = useState(null);
  useEffect(() => { ... }, [url]);
  return data;
}`}</div>
    </div>

    <div className="demo-box">
      <p style={{ color: "#4ade80", fontWeight: 600, marginBottom: "8px", fontSize: "13px" }}>
        ✅ CORRECT — move conditions INSIDE the hook:
      </p>
      <div className="code-hint">{`// Always call the hook; put the condition INSIDE
function GoodComponent({ show }) {
  const [val, setVal] = useState(""); // always called
  // Condition goes inside — not around the hook call
  useEffect(() => {
    if (show) { /* do something */ }
  }, [show]);
  return show ? <div>{val}</div> : null;
}

// For lists: use a separate component per item
function GoodList({ items }) {
  return items.map(item => <GoodItem key={item.id} item={item} />);
}
function GoodItem({ item }) {
  const [checked, setChecked] = useState(false); // fine!
  return <li onClick={() => setChecked(c => !c)}>{item.name}</li>;
}

// Rule 3: name starts with "use"
function useFetchData(url) {  // correct!
  const [data, setData] = useState(null);
  useEffect(() => { ... }, [url]);
  return data;
}`}</div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const RulesOfHooks = () => (
  <div>
    <div className="section">
      <h3>Hook Call Order Visualization</h3>
      <HookOrderDemo />
    </div>
    <div className="section">
      <h3>Right vs Wrong Patterns</h3>
      <RulesCodeExamples />
    </div>
  </div>
);
