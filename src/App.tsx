import { useState } from "react";

// Phase 0 imports
import { JsxBasics } from "./phase-0/01_jsx_basics";
import { FunctionalComponent } from "./phase-0/02_functional_component";
import { Props } from "./phase-0/03_props";
import { MiniProjectProfileCard } from "./phase-0/mini_project_profile_card";

// Phase 9 imports
import { VitestRTL } from "./phase-9/01_vitest_rtl";
import { TestingPatterns } from "./phase-9/02_testing_patterns";
import { MiniProjectTestSuite } from "./phase-9/mini_project_test_suite";

// Phase 8 imports
import { ReactMemo } from "./phase-8/01_react_memo";
import { CodeSplitting } from "./phase-8/02_code_splitting";
import { Virtualization } from "./phase-8/03_virtualization";
import { MiniProjectDataTable } from "./phase-8/mini_project_data_table";

// Phase 7 imports
import { ReactHookForm } from "./phase-7/01_react_hook_form";
import { ZodValidation } from "./phase-7/02_zod_validation";
import { MiniProjectMultistepForm } from "./phase-7/mini_project_multistep_form";

// Phase 6 imports
import { FetchPatterns } from "./phase-6/01_fetch_patterns";
import { TanstackQuery } from "./phase-6/02_tanstack_query";
import { SWR } from "./phase-6/03_swr";
import { MiniProjectNewsFeed } from "./phase-6/mini_project_news_feed";

// Phase 5 imports
import { ContextReducer } from "./phase-5/01_context_reducer";
import { Zustand } from "./phase-5/02_zustand";
import { Jotai } from "./phase-5/03_jotai";
import { MiniProjectEcommerceStore } from "./phase-5/mini_project_ecommerce_store";

// Phase 4 imports
import { CompoundComponents } from "./phase-4/01_compound_components";
import { RenderProps } from "./phase-4/02_render_props";
import { HigherOrderComponents } from "./phase-4/03_hoc";
import { MiniProjectAccordion } from "./phase-4/mini_project_accordion";

// Phase 3 imports
import { CustomHooks } from "./phase-3/01_custom_hooks";
import { HookComposition } from "./phase-3/02_hook_composition";
import { RulesOfHooks } from "./phase-3/03_rules_of_hooks";
import { MiniProjectUserSearch } from "./phase-3/mini_project_user_search";

// Phase 2 imports
import { UseEffect } from "./phase-2/01_use_effect";
import { UseRef } from "./phase-2/02_use_ref";
import { UseContext } from "./phase-2/03_use_context";
import { UseMemoCallback } from "./phase-2/04_use_memo_callback";
import { UseReducer } from "./phase-2/05_use_reducer";
import { MiniProjectPomodoro } from "./phase-2/mini_project_pomodoro";
import { UseState } from "./phase-1/01_use_state";
import { EventHandling } from "./phase-1/02_event_handling";
import { ControlledInput } from "./phase-1/03_controlled_input";
import { LiftingState } from "./phase-1/04_lifting_state";
import { MiniProjectShoppingCart } from "./phase-1/mini_project_shopping_cart";

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
    status: "done",
    items: [
      { id: "usestate",   label: "01. useState",          component: UseState },
      { id: "events",     label: "02. Event Handling",    component: EventHandling },
      { id: "controlled", label: "03. Controlled Input",  component: ControlledInput },
      { id: "lifting",    label: "04. Lifting State Up",  component: LiftingState },
      { id: "mini-1",     label: "🎯 Mini: Shopping Cart", component: MiniProjectShoppingCart },
    ],
  },
  {
    id: "phase-2",
    label: "Phase 2 — Core Hooks",
    status: "done",
    items: [
      { id: "useeffect",  label: "01. useEffect",          component: UseEffect },
      { id: "useref",     label: "02. useRef",             component: UseRef },
      { id: "usecontext", label: "03. useContext",         component: UseContext },
      { id: "memo",       label: "04. useMemo & useCallback", component: UseMemoCallback },
      { id: "reducer",    label: "05. useReducer",         component: UseReducer },
      { id: "mini-2",     label: "🎯 Mini: Pomodoro Timer", component: MiniProjectPomodoro },
    ],
  },
  {
    id: "phase-3",
    label: "Phase 3 — Custom Hooks",
    status: "done",
    items: [
      { id: "custom",      label: "01. Custom Hooks",       component: CustomHooks },
      { id: "composition", label: "02. Hook Composition",   component: HookComposition },
      { id: "rules",       label: "03. Rules of Hooks",     component: RulesOfHooks },
      { id: "mini-3",      label: "🎯 Mini: User Search",   component: MiniProjectUserSearch },
    ],
  },
  {
    id: "phase-4",
    label: "Phase 4 — Component Patterns",
    status: "done",
    items: [
      { id: "compound",   label: "01. Compound Components", component: CompoundComponents },
      { id: "renderprop", label: "02. Render Props",        component: RenderProps },
      { id: "hoc",        label: "03. HOC",                 component: HigherOrderComponents },
      { id: "mini-4",     label: "🎯 Mini: Accordion",      component: MiniProjectAccordion },
    ],
  },
  {
    id: "phase-5",
    label: "Phase 5 — State Management",
    status: "done",
    items: [
      { id: "context-reducer", label: "01. Context + useReducer",  component: ContextReducer },
      { id: "zustand",         label: "02. Zustand",               component: Zustand },
      { id: "jotai",           label: "03. Jotai",                 component: Jotai },
      { id: "mini-5",          label: "🎯 Mini: E-commerce Store", component: MiniProjectEcommerceStore },
    ],
  },
  {
    id: "phase-6",
    label: "Phase 6 — Data Fetching",
    status: "done",
    items: [
      { id: "fetch",    label: "01. Fetch Patterns",    component: FetchPatterns },
      { id: "tanstack", label: "02. TanStack Query",    component: TanstackQuery },
      { id: "swr",      label: "03. SWR",               component: SWR },
      { id: "mini-6",   label: "🎯 Mini: News Feed",    component: MiniProjectNewsFeed },
    ],
  },
  {
    id: "phase-7",
    label: "Phase 7 — Forms",
    status: "done",
    items: [
      { id: "rhf",    label: "01. React Hook Form",    component: ReactHookForm },
      { id: "zod",    label: "02. Zod Validation",     component: ZodValidation },
      { id: "mini-7", label: "🎯 Mini: Multi-step Form", component: MiniProjectMultistepForm },
    ],
  },
  {
    id: "phase-8",
    label: "Phase 8 — Performance",
    status: "done",
    items: [
      { id: "memo-perf",  label: "01. React.memo",           component: ReactMemo },
      { id: "codesplit",  label: "02. Code Splitting",       component: CodeSplitting },
      { id: "virtual",    label: "03. Virtualization",       component: Virtualization },
      { id: "mini-8",     label: "🎯 Mini: Data Table",      component: MiniProjectDataTable },
    ],
  },
  {
    id: "phase-9",
    label: "Phase 9 — Testing",
    status: "done",
    items: [
      { id: "vitest",   label: "01. Vitest + RTL",       component: VitestRTL },
      { id: "patterns", label: "02. Testing Patterns",   component: TestingPatterns },
      { id: "mini-9",   label: "🎯 Mini: Test Suite",    component: MiniProjectTestSuite },
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
