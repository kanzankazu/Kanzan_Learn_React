// =============================================================
// Phase 2 — 02: useRef
// =============================================================
// useRef returns a mutable object { current: value } that persists
// across renders WITHOUT triggering a re-render when changed.
//
// Two main use cases:
// 1. Reference to a DOM element — access/manipulate the real DOM
// 2. Mutable instance variable — store values that shouldn't trigger renders
//    (timer IDs, previous values, counters, etc.)
//
// Key difference from useState:
//   useState → changing value triggers re-render
//   useRef   → changing .current does NOT trigger re-render
//
// Android/Compose analogy:
//   DOM ref     ~ View.findById() / ComposeView reference
//   Mutable ref ~ rememberUpdatedState / non-state var in ViewModel
// =============================================================

import { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────
// DEMO 1: DOM reference — focus, scroll, measure
// ─────────────────────────────────────────────────────────────

const DomRefDemo = () => {
  // Type parameter tells TypeScript what kind of element this ref points to
  const inputRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  // Imperatively focus the input — can't do this with props/state alone
  const handleFocusClick = () => {
    inputRef.current?.focus(); // ?. = optional chaining: safe if ref is null
    setFocused(true);
  };

  // Measure DOM element dimensions
  const handleMeasure = () => {
    const rect = colorRef.current?.getBoundingClientRect();
    if (rect) {
      alert(`Element size: ${Math.round(rect.width)}px × ${Math.round(rect.height)}px`);
    }
  };

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
        DOM refs — direct access to real DOM nodes:
      </p>

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <input
          ref={inputRef}
          style={{ flex: 1, padding: "8px", borderRadius: "6px", border: `1px solid ${focused ? "#6366f1" : "#2d2d44"}`, background: "#12121c", color: "#e2e8f0" }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Click the button to focus me..."
        />
        <button className="btn btn-primary" onClick={handleFocusClick}>Focus ↑</button>
      </div>

      {/* Measure this element */}
      <div
        ref={colorRef}
        style={{ padding: "16px", background: "linear-gradient(135deg, #6366f1, #a855f7)", borderRadius: "8px", textAlign: "center", cursor: "pointer" }}
        onClick={handleMeasure}
      >
        Click to measure my size
      </div>

      <div className="code-hint" style={{ marginTop: "12px" }}>{`// Ref is attached via the ref prop
const inputRef = useRef<HTMLInputElement>(null);
<input ref={inputRef} />

// Access DOM node imperatively
inputRef.current?.focus();
inputRef.current?.getBoundingClientRect();`}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 2: Mutable value — store without triggering re-render
// ─────────────────────────────────────────────────────────────

const MutableRefDemo = () => {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  // Store interval ID in a ref — changing it should NOT trigger re-render
  // If we used useState for this, each tick would cause 2 re-renders
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Also track render count with ref (useState would cause infinite loop!)
  const renderCountRef = useRef(0);
  renderCountRef.current += 1; // mutate directly — no setter needed

  const start = () => {
    if (intervalRef.current) return; // already running
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setTime(prev => prev + 100);
    }, 100);
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null; // reset ref
    }
    setRunning(false);
  };

  const reset = () => {
    stop();
    setTime(0);
  };

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
        Mutable ref — interval ID stored without triggering re-renders:
      </p>
      <div style={{ fontSize: "36px", fontWeight: 800, textAlign: "center", fontVariantNumeric: "tabular-nums", marginBottom: "12px" }}>
        {(time / 1000).toFixed(1)}s
      </div>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "12px" }}>
        <button className="btn btn-primary" onClick={running ? stop : start}>
          {running ? "⏸ Stop" : "▶ Start"}
        </button>
        <button className="btn btn-danger" onClick={reset}>↺ Reset</button>
      </div>
      <p style={{ color: "#7c85a2", fontSize: "12px", textAlign: "center" }}>
        Render count: <strong style={{ color: "#a5b4fc" }}>{renderCountRef.current}</strong>
        <span style={{ marginLeft: "8px", fontSize: "11px" }}>(only re-renders from state changes, not ref mutations)</span>
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 3: Previous value pattern
// ─────────────────────────────────────────────────────────────
// A classic pattern: useRef to remember the value from the last render.

function usePrevious<T>(value: T): T | undefined {
  const prevRef = useRef<T | undefined>(undefined);

  // useEffect runs AFTER the render, so prevRef.current
  // still has the OLD value during the current render.
  // After the render, we update it to the current value.
  useEffect(() => {
    prevRef.current = value;
  });

  return prevRef.current;
}

const PreviousValueDemo = () => {
  const [count, setCount] = useState(0);
  const prev = usePrevious(count);

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
        usePrevious hook — track the value from the last render:
      </p>
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <p>Previous: <strong style={{ color: "#7c85a2" }}>{prev ?? "—"}</strong></p>
        <p style={{ fontSize: "32px", fontWeight: 800, margin: "8px 0" }}>{count}</p>
        <p style={{ color: count > (prev ?? 0) ? "#4ade80" : "#f87171", fontSize: "13px" }}>
          {prev === undefined ? "—" : count > prev ? "▲ Increased" : count < prev ? "▼ Decreased" : "— No change"}
        </p>
      </div>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        <button className="btn btn-ghost" onClick={() => setCount(c => c - 1)}>−</button>
        <button className="btn btn-primary" onClick={() => setCount(c => c + 1)}>+</button>
        <button className="btn btn-ghost" onClick={() => setCount(c => c + 5)}>+5</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const UseRef = () => (
  <div>
    <div className="section">
      <h3>1. DOM Reference — focus, measure</h3>
      <DomRefDemo />
    </div>
    <div className="section">
      <h3>2. Mutable Instance Variable — no re-render</h3>
      <MutableRefDemo />
    </div>
    <div className="section">
      <h3>3. Previous Value Pattern</h3>
      <PreviousValueDemo />
    </div>
  </div>
);
