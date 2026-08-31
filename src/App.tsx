import { useState } from "react";

// Phase 0 imports
import { JsxBasics } from "./phase-0/01_jsx_basics";
import { FunctionalComponent } from "./phase-0/02_functional_component";
import { Props } from "./phase-0/03_props";
import { MiniProjectProfileCard } from "./phase-0/mini_project_profile_card";

// ── Types ─────────────────────────────────────────────────────

interface PhaseItem {
  id: string;
  label: string;
  component?: React.ComponentType;
}

interface Phase {
  id: string;
  label: string;
  status: "done" | "wip" | "todo";
  items: PhaseItem[];
}

// ── Data navigasi ─────────────────────────────────────────────

const phases: Phase[] = [
  {
    id: "phase-0",
    label: "Phase 0 — JSX & Component",
    status: "done",
    items: [
      { id: "jsx",       label: "01. JSX Basics",          component: JsxBasics },
      { id: "component", label: "02. Functional Component", component: FunctionalComponent },
      { id: "props",     label: "03. Props",               component: Props },
      { id: "mini-0",    label: "🎯 Mini: Profile Card",   component: MiniProjectProfileCard },
    ],
  },
  {
    id: "phase-1",
    label: "Phase 1 — State & Events",
    status: "todo",
    items: [
      { id: "usestate",   label: "01. useState" },
      { id: "events",     label: "02. Event Handling" },
      { id: "controlled", label: "03. Controlled Input" },
      { id: "lifting",    label: "04. Lifting State Up" },
      { id: "mini-1",     label: "🎯 Mini: Shopping Cart" },
    ],
  },
  {
    id: "phase-2",
    label: "Phase 2 — Core Hooks",
    status: "todo",
    items: [
      { id: "useeffect",  label: "01. useEffect" },
      { id: "useref",     label: "02. useRef" },
      { id: "usecontext", label: "03. useContext" },
      { id: "memo",       label: "04. useMemo & useCallback" },
      { id: "reducer",    label: "05. useReducer" },
      { id: "mini-2",     label: "🎯 Mini: Pomodoro Timer" },
    ],
  },
  {
    id: "phase-3",
    label: "Phase 3 — Custom Hooks",
    status: "todo",
    items: [
      { id: "custom",      label: "01. Custom Hooks" },
      { id: "composition", label: "02. Hook Composition" },
      { id: "rules",       label: "03. Rules of Hooks" },
      { id: "mini-3",      label: "🎯 Mini: GitHub Search" },
    ],
  },
  {
    id: "phase-4",
    label: "Phase 4 — Component Patterns",
    status: "todo",
    items: [
      { id: "compound",    label: "01. Compound Components" },
      { id: "renderprop",  label: "02. Render Props" },
      { id: "hoc",         label: "03. HOC" },
      { id: "mini-4",      label: "🎯 Mini: Accordion" },
    ],
  },
  {
    id: "phase-5",
    label: "Phase 5 — State Management",
    status: "todo",
    items: [
      { id: "context-reducer", label: "01. Context + useReducer" },
      { id: "zustand",         label: "02. Zustand" },
      { id: "jotai",           label: "03. Jotai" },
      { id: "mini-5",          label: "🎯 Mini: E-commerce" },
    ],
  },
  {
    id: "phase-6",
    label: "Phase 6 — Data Fetching",
    status: "todo",
    items: [
      { id: "fetch",   label: "01. fetch API" },
      { id: "tanstack", label: "02. TanStack Query" },
      { id: "swr",     label: "03. SWR" },
      { id: "mini-6",  label: "🎯 Mini: News Aggregator" },
    ],
  },
  {
    id: "phase-7",
    label: "Phase 7 — Forms",
    status: "todo",
    items: [
      { id: "rhf",    label: "01. React Hook Form" },
      { id: "zod",    label: "02. Validasi Zod" },
      { id: "mini-7", label: "🎯 Mini: Multi-step Form" },
    ],
  },
  {
    id: "phase-8",
    label: "Phase 8 — Performance",
    status: "todo",
    items: [
      { id: "memo-perf",   label: "01. React.memo" },
      { id: "codesplit",   label: "02. Code Splitting" },
      { id: "virtual",     label: "03. Virtualization" },
      { id: "mini-8",      label: "🎯 Mini: Data Table" },
    ],
  },
  {
    id: "phase-9",
    label: "Phase 9 — Testing",
    status: "todo",
    items: [
      { id: "vitest",   label: "01. Vitest + RTL" },
      { id: "patterns", label: "02. Testing Patterns" },
      { id: "mini-9",   label: "🎯 Mini: Test Suite" },
    ],
  },
];

// ── Status badge ──────────────────────────────────────────────
const statusEmoji: Record<Phase["status"], string> = {
  done: "✅",
  wip: "🔄",
  todo: "🔜",
};

// ── Coming Soon placeholder ───────────────────────────────────
const ComingSoon = ({ label }: { label: string }) => (
  <div className="coming-soon">
    <span>🚧</span>
    <p><strong>{label}</strong></p>
    <p>Not started yet</p>
  </div>
);

// ── App ───────────────────────────────────────────────────────

import React from "react";

function App() {
  const [activePhaseId, setActivePhaseId] = useState("phase-0");
  const [activeItemId, setActiveItemId] = useState("jsx");

  const activePhase = phases.find((p) => p.id === activePhaseId)!;
  const activeItem = activePhase.items.find((i) => i.id === activeItemId) ?? activePhase.items[0];
  const ActiveComponent = activeItem.component;

  const handlePhaseClick = (phase: Phase) => {
    setActivePhaseId(phase.id);
    setActiveItemId(phase.items[0].id);
  };

  return (
    <>
      {/* ── Top nav: phase selector ── */}
      <nav className="navigator">
        <h1>⚛️ Kanzan Learn React</h1>
        {phases.map((phase) => (
          <button
            key={phase.id}
            className={`nav-btn ${activePhaseId === phase.id ? "active" : ""} ${phase.status === "todo" ? "" : ""}`}
            onClick={() => handlePhaseClick(phase)}
          >
            {statusEmoji[phase.status]} {phase.id.replace("phase-", "P")}
          </button>
        ))}
      </nav>

      {/* ── Content area ── */}
      <main className="page">
        {/* Phase title */}
        <h2>{activePhase.label}</h2>
        <p className="subtitle">
          {statusEmoji[activePhase.status]}{" "}
          {activePhase.status === "done" ? "Completed" : activePhase.status === "wip" ? "In Progress" : "Not started"}
          {" · "}
          {activePhase.items.length} topics
        </p>

        {/* Item tabs */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "28px" }}>
          {activePhase.items.map((item) => (
            <button
              key={item.id}
              className={`nav-btn ${activeItemId === item.id ? "active" : ""}`}
              onClick={() => setActiveItemId(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Active content */}
        {ActiveComponent
          ? <ActiveComponent />
          : <ComingSoon label={activeItem.label} />
        }
      </main>
    </>
  );
}

export default App;
