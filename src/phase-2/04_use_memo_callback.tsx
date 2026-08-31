// =============================================================
// Phase 2 — 04: useMemo & useCallback
// =============================================================
// Both hooks are about MEMOIZATION — caching a computed value
// so it's only recomputed when its dependencies change.
//
// useMemo(fn, deps)     → memoizes the RETURN VALUE of fn
// useCallback(fn, deps) → memoizes the FUNCTION REFERENCE itself
//
// When to use:
//   useMemo    → expensive computations (sorting, filtering large arrays)
//   useCallback → stable function references passed to memo'd children
//
// When NOT to use (over-optimization):
//   ❌ useMemo(() => a + b, [a, b])  — too cheap, adds overhead
//   ❌ useCallback on every function — most components don't need it
//
// Rule of thumb: profile first, optimize second.
// React re-renders are fast. Memoization has its own cost.
//
// Android/Compose analogy:
//   useMemo    ~ derivedStateOf { }
//   useCallback ~ rememberUpdatedState + stable lambda reference
// =============================================================

import { useState, useMemo, useCallback, memo } from "react";
import { makeFakeUsers } from "../lib/fake-data";

// ─────────────────────────────────────────────────────────────
// DEMO 1: useMemo — expensive computation
// ─────────────────────────────────────────────────────────────

const fakeUsers = makeFakeUsers(20);

const ExpensiveComputationDemo = () => {
  const [filter, setFilter] = useState("");
  const [darkMode, setDarkMode] = useState(false); // unrelated state for demo

  // WITHOUT useMemo: this runs on EVERY render, even when darkMode changes
  // const filtered = fakeUsers.filter(u => u.name.toLowerCase().includes(filter.toLowerCase()));

  // WITH useMemo: only recomputes when filter or fakeUsers changes
  // darkMode toggle does NOT trigger recomputation
  const filteredUsers = useMemo(() => {
    // Simulate a heavier operation
    return fakeUsers
      .filter(u => u.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filter]); // fakeUsers is module-level constant so not in deps

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        useMemo: filtered list only recomputes when filter changes (not on theme toggle):
      </p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <input
          style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0" }}
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter by name..."
        />
        <button className="btn btn-ghost" onClick={() => setDarkMode(d => !d)}>
          {darkMode ? "☀️" : "🌙"} (unrelated re-render)
        </button>
      </div>
      <p style={{ fontSize: "12px", color: "#a5b4fc", marginBottom: "8px" }}>
        {filteredUsers.length} of {fakeUsers.length} users
      </p>
      <ul style={{ listStyle: "none", maxHeight: "160px", overflowY: "auto" }}>
        {filteredUsers.map(u => (
          <li key={u.id} style={{ padding: "4px 0", fontSize: "13px", color: "#94a3b8", borderBottom: "1px solid #1a1a2e" }}>
            {u.name} — {u.jobTitle}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 2: useCallback — stable function for memo'd child
// ─────────────────────────────────────────────────────────────

// React.memo (aka memo) — skips re-render if props haven't changed
// For this to work, callback props must have STABLE references (useCallback)
const ExpensiveChild = memo(({ onAction, label }: { onAction: (msg: string) => void; label: string }) => {
  // Track how many times this child actually re-renders
  const renderRef = { current: 0 };
  renderRef.current++;

  return (
    <div style={{ padding: "10px", background: "#12121c", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "13px", color: "#94a3b8" }}>{label}</span>
      <button className="btn btn-primary" style={{ fontSize: "12px", padding: "4px 10px" }} onClick={() => onAction(label)}>
        Click
      </button>
    </div>
  );
});

const UseCallbackDemo = () => {
  const [count, setCount] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  // WITHOUT useCallback: new function reference on every render
  // → memo'd children ALWAYS re-render (memo is defeated)
  // const handleActionBad = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 4));

  // WITH useCallback: stable reference, only recreated if deps change
  // → memo'd children only re-render when this actually changes
  const handleAction = useCallback((msg: string) => {
    setLog(prev => [`Clicked: ${msg}`, ...prev].slice(0, 4));
  }, []); // empty deps: function never changes

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        useCallback gives stable function reference to memo&apos;d children:
      </p>
      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
        <button className="btn btn-ghost" onClick={() => setCount(c => c + 1)}>
          Increment parent ({count}) — children should NOT re-render
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
        <ExpensiveChild label="Child A" onAction={handleAction} />
        <ExpensiveChild label="Child B" onAction={handleAction} />
      </div>
      <div style={{ fontSize: "12px", color: "#7c85a2" }}>
        {log.map((entry, i) => <div key={i}>→ {entry}</div>)}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 3: When NOT to memoize
// ─────────────────────────────────────────────────────────────

const OverOptimizationDemo = () => (
  <div className="demo-box">
    <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
      Anti-patterns — don&apos;t memoize these:
    </p>
    <div className="code-hint">{`// ❌ Too cheap — string concat doesn't need useMemo
const fullName = useMemo(() => \`\${first} \${last}\`, [first, last]);
const fullName = \`\${first} \${last}\`; // ✅ just do this

// ❌ Not passed to memo'd child — useCallback is pointless
const handleClick = useCallback(() => setOpen(true), []);
const handleClick = () => setOpen(true); // ✅ simpler

// ✅ DO memoize: filtering/sorting large arrays
const sorted = useMemo(() => [...bigList].sort(fn), [bigList]);

// ✅ DO memoize: passed to React.memo wrapped child
const onSave = useCallback((data) => dispatch(save(data)), [dispatch]);`}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const UseMemoCallback = () => (
  <div>
    <div className="section">
      <h3>1. useMemo — Cache Expensive Computation</h3>
      <ExpensiveComputationDemo />
    </div>
    <div className="section">
      <h3>2. useCallback — Stable Function Reference</h3>
      <UseCallbackDemo />
    </div>
    <div className="section">
      <h3>3. When NOT to Memoize</h3>
      <OverOptimizationDemo />
    </div>
  </div>
);
