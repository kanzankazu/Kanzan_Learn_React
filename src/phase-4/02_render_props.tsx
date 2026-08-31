// =============================================================
// Phase 4 — 02: Render Props
// =============================================================
// Render Props is a pattern for sharing stateful logic between
// components by passing a FUNCTION as a prop that returns JSX.
//
// The component with the logic calls that function to render,
// passing its internal state as arguments.
//
// Pattern:
//   <Component render={(state) => <UI using state />} />
//   or via children:
//   <Component>{(state) => <UI using state />}</Component>
//
// Modern note: Custom Hooks have largely replaced Render Props
// because hooks are simpler and more composable. However:
//   - Render Props still appear in older codebases
//   - Some libraries still use it (e.g., react-final-form)
//   - Understanding it helps read/maintain legacy code
//
// Android/Compose analogy:
//   content: @Composable (State) -> Unit
//   Like passing a composable lambda that receives scope data
// =============================================================

import { useState, useEffect } from "react";
import React from "react";

// ─────────────────────────────────────────────────────────────
// EXAMPLE 1: Mouse tracker — via render prop
// ─────────────────────────────────────────────────────────────

interface MousePosition { x: number; y: number; }

// This component handles ALL mouse tracking logic
// The UI is completely delegated to the render prop
interface MouseTrackerProps {
  render: (position: MousePosition) => React.ReactNode;
}

const MouseTracker = ({ render }: MouseTrackerProps) => {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  return (
    <div
      onMouseMove={e => setPosition({ x: e.clientX, y: e.clientY })}
      style={{ height: "120px", border: "1px dashed #2d2d44", borderRadius: "8px", position: "relative", overflow: "hidden", cursor: "crosshair" }}
    >
      {/* Call the render prop with current state */}
      {render(position)}
    </div>
  );
};

// Same logic, different UIs — the render prop makes this possible
const MouseTrackerDemo = () => (
  <div className="demo-box">
    <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
      Same MouseTracker logic, two different render outputs:
    </p>

    {/* UI 1: text coordinates */}
    <p style={{ fontSize: "12px", color: "#7c85a2", marginBottom: "6px" }}>Text display:</p>
    <MouseTracker
      render={({ x, y }) => (
        <div style={{ padding: "12px", color: "#a5b4fc" }}>
          Move mouse here: <strong>{x}, {y}</strong>
        </div>
      )}
    />

    <div style={{ marginTop: "12px" }} />

    {/* UI 2: dot that follows the cursor */}
    <p style={{ fontSize: "12px", color: "#7c85a2", marginBottom: "6px" }}>Dot follower:</p>
    <MouseTracker
      render={({ x, y }) => (
        <div
          style={{
            position: "absolute",
            // Normalize position relative to the tracker box
            left: Math.min(x % 300, 280),
            top: Math.min(y % 120, 100),
            width: "12px", height: "12px",
            borderRadius: "50%",
            background: "#6366f1",
            pointerEvents: "none",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 12px #6366f1",
          }}
        />
      )}
    />
  </div>
);

// ─────────────────────────────────────────────────────────────
// EXAMPLE 2: children as render prop (function as children)
// ─────────────────────────────────────────────────────────────
// A common variation: children is a function instead of a prop.
// <Counter>{(count, inc) => <button onClick={inc}>{count}</button>}</Counter>

interface CounterRenderProps {
  children: (count: number, increment: () => void, decrement: () => void) => React.ReactNode;
  initialValue?: number;
}

const Counter = ({ children, initialValue = 0 }: CounterRenderProps) => {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  // Pass state + callbacks to the children function
  return <>{children(count, increment, decrement)}</>;
};

const ChildrenAsFunctionDemo = () => (
  <div className="demo-box">
    <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
      Children as a function — same Counter logic, different UIs:
    </p>

    {/* UI 1: Simple buttons */}
    <p style={{ fontSize: "12px", color: "#7c85a2", marginBottom: "6px" }}>Button style:</p>
    <Counter initialValue={5}>
      {(count, inc, dec) => (
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
          <button className="btn btn-ghost" onClick={dec}>−</button>
          <span style={{ fontWeight: 700, minWidth: "40px", textAlign: "center" }}>{count}</span>
          <button className="btn btn-primary" onClick={inc}>+</button>
        </div>
      )}
    </Counter>

    {/* UI 2: Progress bar style */}
    <p style={{ fontSize: "12px", color: "#7c85a2", marginBottom: "6px" }}>Progress bar style (max 10):</p>
    <Counter>
      {(count, inc, dec) => (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
            <button className="btn btn-ghost" style={{ padding: "2px 10px" }} onClick={dec}>−</button>
            <span>{count} / 10</span>
            <button className="btn btn-primary" style={{ padding: "2px 10px" }} onClick={inc}>+</button>
          </div>
          <div style={{ height: "8px", background: "#2d2d44", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(count * 10, 100)}%`, background: "#6366f1", borderRadius: "4px", transition: "width 0.2s" }} />
          </div>
        </div>
      )}
    </Counter>
  </div>
);

// ─────────────────────────────────────────────────────────────
// EXAMPLE 3: Render props vs Custom Hook comparison
// ─────────────────────────────────────────────────────────────

// The same "online status" logic implemented two ways
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return isOnline;
}

const ComparisonDemo = () => {
  const isOnline = useOnlineStatus();
  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
        Modern approach: custom hook is simpler than render prop for logic reuse:
      </p>
      <div className="code-hint">{`// RENDER PROP approach (older)
const OnlineStatus = ({ render }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  // ... event listeners setup ...
  return render(isOnline); // call the prop to render
};
// Usage:
<OnlineStatus render={(online) => <Badge online={online} />} />

// CUSTOM HOOK approach (modern — same logic, simpler)
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  // ... event listeners setup ...
  return isOnline; // just return the value
}
// Usage:
const MyComponent = () => {
  const isOnline = useOnlineStatus();
  return <Badge online={isOnline} />;
};`}</div>
      <p style={{ marginTop: "12px", fontSize: "13px" }}>
        Your current status:{" "}
        <span style={{ color: isOnline ? "#4ade80" : "#f87171", fontWeight: 600 }}>
          {isOnline ? "🟢 Online" : "🔴 Offline"}
        </span>
        <span style={{ color: "#7c85a2", fontSize: "12px", marginLeft: "8px" }}>
          (disconnect your network to see it change)
        </span>
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const RenderProps = () => (
  <div>
    <div className="section">
      <h3>1. Mouse Tracker — render prop</h3>
      <MouseTrackerDemo />
    </div>
    <div className="section">
      <h3>2. Counter — children as function</h3>
      <ChildrenAsFunctionDemo />
    </div>
    <div className="section">
      <h3>3. Render Props vs Custom Hooks</h3>
      <ComparisonDemo />
    </div>
  </div>
);
