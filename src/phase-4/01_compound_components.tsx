// =============================================================
// Phase 4 — 01: Compound Components
// =============================================================
// Compound Components is a pattern where multiple components work
// together to form a cohesive UI, sharing implicit state via Context.
//
// The parent component:
//   - Owns the shared state
//   - Exposes sub-components as static properties
//
// Why use it?
//   - Flexible API: consumer controls the layout/order of sub-parts
//   - No prop drilling — sub-components get state from context
//   - Expressive usage: reads like natural HTML structure
//
// Classic examples: <select>/<option>, <table>/<tr>/<td>
//
// Android/Compose analogy:
//   TabRow + Tab composables sharing selection state
//   ModalBottomSheet + content composables
// =============================================================

import { createContext, useContext, useState } from "react";
import React from "react";

// ─────────────────────────────────────────────────────────────
// EXAMPLE 1: Tabs compound component
// ─────────────────────────────────────────────────────────────

// Step 1: Context for shared state between sub-components
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}
const TabsContext = createContext<TabsContextValue | null>(null);
const useTabs = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs sub-components must be inside <Tabs>");
  return ctx;
};

// Step 2: Parent component — owns state, provides context
interface TabsProps { children: React.ReactNode; defaultTab: string; }
const Tabs = ({ children, defaultTab }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
};

// Step 3: Sub-components — consume context, no explicit props for shared state
const TabList = ({ children }: { children: React.ReactNode }) => (
  <div role="tablist" style={{ display: "flex", gap: "2px", borderBottom: "1px solid #2d2d44", marginBottom: "16px" }}>
    {children}
  </div>
);

const Tab = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === id;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(id)}
      style={{
        padding: "8px 16px",
        border: "none",
        borderBottom: `2px solid ${isActive ? "#6366f1" : "transparent"}`,
        background: "transparent",
        color: isActive ? "#a5b4fc" : "#7c85a2",
        cursor: "pointer",
        fontWeight: isActive ? 600 : 400,
        transition: "all 0.15s",
        fontSize: "14px",
      }}
    >
      {children}
    </button>
  );
};

const TabPanel = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { activeTab } = useTabs();
  // Don't render at all when not active — saves memory
  if (activeTab !== id) return null;
  return <div role="tabpanel">{children}</div>;
};

// Step 4: Attach sub-components as static properties (dot notation API)
Tabs.List  = TabList;
Tabs.Tab   = Tab;
Tabs.Panel = TabPanel;

const TabsDemo = () => (
  <div className="demo-box">
    <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
      Sub-components share state via Context — consumer controls layout:
    </p>
    {/* Usage reads naturally — like HTML semantics */}
    <Tabs defaultTab="overview">
      <Tabs.List>
        <Tabs.Tab id="overview">Overview</Tabs.Tab>
        <Tabs.Tab id="skills">Skills</Tabs.Tab>
        <Tabs.Tab id="contact">Contact</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel id="overview">
        <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.7" }}>
          Overview panel content. The active tab state lives in the parent Tabs component and is shared to Tab (for highlighting) and TabPanel (for visibility) via Context — no props needed.
        </p>
      </Tabs.Panel>
      <Tabs.Panel id="skills">
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["React", "TypeScript", "Node.js", "GraphQL"].map(s => (
            <span key={s} className="badge badge-purple">{s}</span>
          ))}
        </div>
      </Tabs.Panel>
      <Tabs.Panel id="contact">
        <p style={{ color: "#94a3b8", fontSize: "14px" }}>📧 contact@example.com · 🌐 example.com</p>
      </Tabs.Panel>
    </Tabs>
  </div>
);

// ─────────────────────────────────────────────────────────────
// EXAMPLE 2: Disclosure (expand/collapse) compound component
// ─────────────────────────────────────────────────────────────

interface DisclosureCtxValue { isOpen: boolean; toggle: () => void; }
const DisclosureCtx = createContext<DisclosureCtxValue | null>(null);
const useDisclosure = () => {
  const ctx = useContext(DisclosureCtx);
  if (!ctx) throw new Error("Must be inside Disclosure");
  return ctx;
};

const Disclosure = ({ children, defaultOpen = false }: { children: React.ReactNode; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <DisclosureCtx.Provider value={{ isOpen, toggle: () => setIsOpen(o => !o) }}>
      <div style={{ border: "1px solid #2d2d44", borderRadius: "10px", overflow: "hidden", marginBottom: "8px" }}>
        {children}
      </div>
    </DisclosureCtx.Provider>
  );
};

const DisclosureButton = ({ children }: { children: React.ReactNode }) => {
  const { isOpen, toggle } = useDisclosure();
  return (
    <button
      onClick={toggle}
      style={{ width: "100%", padding: "12px 16px", background: "#1e1e2e", border: "none", color: "#e2e8f0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px", fontWeight: 600 }}
    >
      {children}
      <span style={{ transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none", color: "#6366f1" }}>▾</span>
    </button>
  );
};

const DisclosurePanel = ({ children }: { children: React.ReactNode }) => {
  const { isOpen } = useDisclosure();
  if (!isOpen) return null;
  return (
    <div style={{ padding: "12px 16px", background: "#12121c", color: "#94a3b8", fontSize: "14px", lineHeight: "1.7", borderTop: "1px solid #2d2d44" }}>
      {children}
    </div>
  );
};

Disclosure.Button = DisclosureButton;
Disclosure.Panel  = DisclosurePanel;

const DisclosureDemo = () => (
  <div className="demo-box">
    <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
      Disclosure compound component — open/close state shared implicitly:
    </p>
    <Disclosure defaultOpen>
      <Disclosure.Button>What is React?</Disclosure.Button>
      <Disclosure.Panel>React is a JavaScript library for building user interfaces. It lets you build complex UIs from small, isolated pieces of code called components.</Disclosure.Panel>
    </Disclosure>
    <Disclosure>
      <Disclosure.Button>What is a compound component?</Disclosure.Button>
      <Disclosure.Panel>A pattern where multiple components share implicit state via Context. The parent owns state, sub-components consume it. The consumer controls layout.</Disclosure.Panel>
    </Disclosure>
    <Disclosure>
      <Disclosure.Button>When should I use this pattern?</Disclosure.Button>
      <Disclosure.Panel>Use it when you have a group of related UI elements that share state but need flexibility in how they&apos;re arranged. Tabs, Accordions, Dropdowns, and Step Wizards are classic use cases.</Disclosure.Panel>
    </Disclosure>
  </div>
);

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const CompoundComponents = () => (
  <div>
    <div className="section">
      <h3>1. Tabs — dot notation API</h3>
      <TabsDemo />
    </div>
    <div className="section">
      <h3>2. Disclosure — expand/collapse</h3>
      <DisclosureDemo />
    </div>
  </div>
);
