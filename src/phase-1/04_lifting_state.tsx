// =============================================================
// Phase 1 — 04: Lifting State Up
// =============================================================
// When two sibling components need to share the same state,
// move (lift) the state to their closest common ancestor.
// The parent holds the state and passes it down via props.
//
// Data flow:
//   Parent (state owner)
//   ├── ChildA (reads state, triggers changes via callback)
//   └── ChildB (reads state, displays it)
//
// "Lifting state up" is the React solution to:
//   "ChildA changed something, and ChildB needs to reflect it"
//
// Android/Compose analogy:
//   ViewModel shared between two Composables via hoisted state
//   ~ Parent component holding state + passing to siblings
// =============================================================

import { useState } from "react";
import { makeFakeUsers } from "../lib/fake-data";

const fakeUsers = makeFakeUsers(4);

// ─────────────────────────────────────────────────────────────
// DEMO 1: Simple counter shared between two children
// ─────────────────────────────────────────────────────────────

// ChildA: CONTROLS the state (has the buttons)
const CounterControls = ({
  count,
  onIncrement,
  onDecrement,
  onReset,
}: {
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
}) => (
  <div style={{ padding: "12px", background: "#12121c", borderRadius: "8px" }}>
    <p style={{ color: "#7c85a2", fontSize: "12px", marginBottom: "8px" }}>ChildA — Controls</p>
    <div style={{ display: "flex", gap: "8px" }}>
      <button className="btn btn-ghost" onClick={onDecrement}>−</button>
      <button className="btn btn-primary" onClick={onIncrement}>+</button>
      <button className="btn btn-danger" onClick={onReset}>Reset</button>
    </div>
    <p style={{ color: "#7c85a2", fontSize: "12px", marginTop: "8px" }}>
      Sees count: <strong style={{ color: "#a5b4fc" }}>{count}</strong>
    </p>
  </div>
);

// ChildB: DISPLAYS the state (only reads)
const CounterDisplay = ({ count }: { count: number }) => (
  <div style={{ padding: "12px", background: "#12121c", borderRadius: "8px", textAlign: "center" }}>
    <p style={{ color: "#7c85a2", fontSize: "12px", marginBottom: "8px" }}>ChildB — Display</p>
    <div style={{ fontSize: "48px", fontWeight: 800, color: count > 0 ? "#4ade80" : count < 0 ? "#f87171" : "#e2e8f0" }}>
      {count}
    </div>
    <p style={{ color: "#7c85a2", fontSize: "12px", marginTop: "8px" }}>
      {count > 0 ? "Positive" : count < 0 ? "Negative" : "Zero"}
    </p>
  </div>
);

// PARENT: Owns the state — both children receive it via props
const LiftedCounterDemo = () => {
  // State lives HERE — not in either child
  const [count, setCount] = useState(0);

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
        State lives in the <strong>Parent</strong>. Both children receive it via props:
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <CounterControls
          count={count}
          onIncrement={() => setCount(c => c + 1)}
          onDecrement={() => setCount(c => c - 1)}
          onReset={() => setCount(0)}
        />
        <CounterDisplay count={count} />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 2: Team selector — real-world lifting pattern
// ─────────────────────────────────────────────────────────────

interface Member {
  id: string;
  name: string;
  role: string;
}

// Child: List of selectable members
const MemberList = ({
  members,
  selectedId,
  onSelect,
}: {
  members: Member[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) => (
  <div style={{ padding: "12px", background: "#12121c", borderRadius: "8px" }}>
    <p style={{ color: "#7c85a2", fontSize: "12px", marginBottom: "8px" }}>Team Members</p>
    {members.map(m => (
      <div
        key={m.id}
        onClick={() => onSelect(m.id)}
        style={{
          padding: "8px 10px",
          borderRadius: "6px",
          cursor: "pointer",
          background: selectedId === m.id ? "#2e1d5e" : "transparent",
          color: selectedId === m.id ? "#a78bfa" : "#94a3b8",
          marginBottom: "4px",
        }}
      >
        {m.name}
      </div>
    ))}
  </div>
);

// Child: Detail view of selected member
const MemberDetail = ({ member }: { member: Member | null }) => (
  <div style={{ padding: "12px", background: "#12121c", borderRadius: "8px" }}>
    <p style={{ color: "#7c85a2", fontSize: "12px", marginBottom: "8px" }}>Selected Member</p>
    {member ? (
      <div>
        <p style={{ fontWeight: 600 }}>{member.name}</p>
        <p style={{ color: "#7c85a2", fontSize: "13px", marginTop: "4px" }}>{member.role}</p>
      </div>
    ) : (
      <p style={{ color: "#4a4a6a" }}>No member selected</p>
    )}
  </div>
);

// Parent: owns the selection state
const TeamSelectorDemo = () => {
  const members: Member[] = fakeUsers.map(u => ({
    id: u.id,
    name: u.name,
    role: u.jobTitle,
  }));

  // selectedId lives here — both children need it
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedMember = members.find(m => m.id === selectedId) ?? null;

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
        Click a member to select — the selection state is lifted to the parent:
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <MemberList members={members} selectedId={selectedId} onSelect={setSelectedId} />
        <MemberDetail member={selectedMember} />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const LiftingState = () => (
  <div>
    <div className="section">
      <h3>1. Counter Shared Between Two Siblings</h3>
      <LiftedCounterDemo />
    </div>
    <div className="section">
      <h3>2. Team Selector — Real-world Pattern</h3>
      <TeamSelectorDemo />
    </div>
  </div>
);
