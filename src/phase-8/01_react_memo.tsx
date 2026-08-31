// =============================================================
// Phase 8 — 01: React.memo
// =============================================================
// React.memo is a Higher-Order Component that memoizes a component.
// It skips re-rendering if the props haven't changed (shallow comparison).
//
// Without React.memo:
//   Parent re-renders → ALL children re-render (even with same props)
//
// With React.memo:
//   Parent re-renders → child re-renders ONLY if its props changed
//
// Shallow comparison: compares each prop with Object.is()
//   primitive (string, number, boolean) → compared by VALUE ✅
//   object/array  → compared by REFERENCE ❌ (new object = always re-renders)
//   function      → compared by REFERENCE ❌ (new function = always re-renders)
//
// Therefore: React.memo alone is not enough for object/function props.
// Pair with useMemo (for objects) and useCallback (for functions).
//
// When to use React.memo:
//   ✅ Pure presentational components that render often
//   ✅ Components in a frequently-updating list
//   ✅ Components with expensive render trees
//   ❌ Components that almost always receive new props
//   ❌ Cheap/fast-rendering components (memo overhead > benefit)
// =============================================================

import { useState, useCallback, useMemo, memo } from "react";
import { makeFakeUsers } from "../lib/fake-data";

const fakeUsers = makeFakeUsers(8);

// ─────────────────────────────────────────────────────────────
// DEMO 1: Without memo vs With memo — render counter
// ─────────────────────────────────────────────────────────────

// Track renders with a ref-like approach (module-level counter per component)
let renderCountA = 0;
let renderCountB = 0;

// NOT memoized — re-renders every time Parent re-renders
const ChildWithoutMemo = ({ label }: { label: string }) => {
  renderCountA++;
  return (
    <div style={{ padding: "10px 12px", background: "#12121c", borderRadius: "6px" }}>
      <span style={{ fontSize: "13px" }}>{label}</span>
      <span style={{ marginLeft: "8px", color: "#f87171", fontSize: "12px" }}>
        Renders: {renderCountA}
      </span>
    </div>
  );
};

// MEMOIZED — only re-renders when its props change
const ChildWithMemo = memo(({ label }: { label: string }) => {
  renderCountB++;
  return (
    <div style={{ padding: "10px 12px", background: "#12121c", borderRadius: "6px" }}>
      <span style={{ fontSize: "13px" }}>{label}</span>
      <span style={{ marginLeft: "8px", color: "#4ade80", fontSize: "12px" }}>
        Renders: {renderCountB}
      </span>
    </div>
  );
});

const MemoComparisonDemo = () => {
  const [count, setCount] = useState(0);
  // label never changes — but ChildWithoutMemo still re-renders on count change
  const stableLabel = "I have stable props";

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "10px" }}>
        Click the button to re-render parent. Both children have <strong>stable props</strong>:
      </p>
      <button className="btn btn-primary" style={{ marginBottom: "12px" }} onClick={() => setCount(c => c + 1)}>
        Re-render parent ({count})
      </button>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <p style={{ fontSize: "12px", color: "#f87171" }}>Without memo — re-renders every time:</p>
        <ChildWithoutMemo label={stableLabel} />
        <p style={{ fontSize: "12px", color: "#4ade80", marginTop: "6px" }}>With memo — skips re-render (props unchanged):</p>
        <ChildWithMemo label={stableLabel} />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 2: memo + useCallback for function props
// ─────────────────────────────────────────────────────────────

let cardRenderCount = 0;

// memo'd child — but will still re-render if onSelect is a new function ref
const UserCard = memo(({ name, role, onSelect }: {
  name: string;
  role: string;
  onSelect: (name: string) => void;
}) => {
  cardRenderCount++;
  return (
    <div
      onClick={() => onSelect(name)}
      style={{ padding: "10px", background: "#12121c", borderRadius: "6px", cursor: "pointer", marginBottom: "4px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
        <span>{name}</span>
        <span style={{ color: "#7c85a2", fontSize: "11px" }}>{role}</span>
      </div>
      <span style={{ fontSize: "11px", color: "#4a4a6a" }}>render #{cardRenderCount}</span>
    </div>
  );
});

const MemoWithCallbackDemo = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  // useCallback: stable reference — memo'd UserCard won't re-render when filter changes
  const handleSelect = useCallback((name: string) => {
    setSelected(name);
  }, []); // empty deps: function never changes

  const filtered = fakeUsers.filter(u =>
    u.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        memo + useCallback: typing in search re-renders parent but NOT memo&apos;d cards (stable callback):
      </p>
      <input
        style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0", marginBottom: "10px", fontSize: "13px" }}
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Filter — triggers parent re-render..."
      />
      {selected && (
        <p style={{ color: "#4ade80", fontSize: "13px", marginBottom: "8px" }}>
          Selected: <strong>{selected}</strong>
        </p>
      )}
      {filtered.slice(0, 4).map(u => (
        <UserCard key={u.id} name={u.name} role={u.jobTitle} onSelect={handleSelect} />
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 3: Custom comparison function
// ─────────────────────────────────────────────────────────────

interface Profile { id: string; name: string; score: number; metadata: Record<string, unknown>; }

// Custom comparator: only re-render if id or score changes
// Ignores changes to the `metadata` object (expensive to compare deeply)
const ProfileCard = memo(
  ({ profile }: { profile: Profile }) => (
    <div style={{ padding: "10px", background: "#12121c", borderRadius: "6px", fontSize: "13px" }}>
      <span>{profile.name}</span>
      <span style={{ color: "#a5b4fc", marginLeft: "12px" }}>Score: {profile.score}</span>
    </div>
  ),
  // Custom equality: return true = SKIP re-render, false = DO re-render
  (prevProps, nextProps) =>
    prevProps.profile.id === nextProps.profile.id &&
    prevProps.profile.score === nextProps.profile.score
    // metadata changes are intentionally IGNORED
);

const CustomComparatorDemo = () => {
  const [score, setScore] = useState(100);
  const [tick, setTick] = useState(0);

  const profile: Profile = useMemo(() => ({
    id: "user-1",
    name: fakeUsers[0].name,
    score,
    // metadata is a new object every render — but our comparator ignores it
    metadata: { lastSeen: new Date().toISOString(), tick },
  }), [score, tick]);

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "10px" }}>
        Custom comparator — only re-renders on id/score change, not metadata:
      </p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button className="btn btn-primary" onClick={() => setScore(s => s + 10)}>
          +10 Score (triggers re-render)
        </button>
        <button className="btn btn-ghost" onClick={() => setTick(t => t + 1)}>
          Update metadata only (skipped)
        </button>
      </div>
      <ProfileCard profile={profile} />
      <p style={{ fontSize: "12px", color: "#7c85a2", marginTop: "8px" }}>
        Metadata tick: {tick} (component doesn&apos;t see this change)
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const ReactMemo = () => (
  <div>
    <div className="section">
      <h3>1. Without vs With React.memo</h3>
      <MemoComparisonDemo />
    </div>
    <div className="section">
      <h3>2. memo + useCallback for Function Props</h3>
      <MemoWithCallbackDemo />
    </div>
    <div className="section">
      <h3>3. Custom Comparison Function</h3>
      <CustomComparatorDemo />
    </div>
  </div>
);
