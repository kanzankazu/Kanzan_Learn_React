// =============================================================
// Phase 4 — Mini Project: Accordion
// =============================================================
// An accessible accordion built with the Compound Components pattern.
// Demonstrates Phase 4 patterns together:
// [x] Compound Components — Accordion.Item, .Header, .Content
// [x] Context — shared open/close state
// [x] Controlled pattern — single vs multiple open mode
// [x] Accessibility — ARIA attributes (aria-expanded, aria-controls)
//
// Component tree:
//   Accordion (context provider — owns open state)
//   └── Accordion.Item (registers itself, provides itemId)
//       ├── Accordion.Header (button, reads/sets state)
//       └── Accordion.Content (panel, reads state for visibility)
// =============================================================

import { createContext, useContext, useState } from "react";
import React from "react";
import { faker } from "@faker-js/faker";

faker.seed(55);

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

interface AccordionCtxValue {
  openItems: Set<string>;
  toggle: (id: string) => void;
  allowMultiple: boolean;
}

interface ItemCtxValue { itemId: string; }

const AccordionCtx = createContext<AccordionCtxValue | null>(null);
const ItemCtx = createContext<ItemCtxValue | null>(null);

const useAccordion = () => {
  const ctx = useContext(AccordionCtx);
  if (!ctx) throw new Error("Must be inside Accordion");
  return ctx;
};

const useAccordionItem = () => {
  const ctx = useContext(ItemCtx);
  if (!ctx) throw new Error("Must be inside Accordion.Item");
  return ctx;
};

// ─────────────────────────────────────────────────────────────
// Compound components
// ─────────────────────────────────────────────────────────────

interface AccordionProps {
  children: React.ReactNode;
  allowMultiple?: boolean;  // if true, multiple items can be open simultaneously
  defaultOpen?: string[];   // ids of initially open items
}

const Accordion = ({ children, allowMultiple = false, defaultOpen = [] }: AccordionProps) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggle = (id: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear(); // single mode: close all others
        next.add(id);
      }
      return next;
    });
  };

  return (
    <AccordionCtx.Provider value={{ openItems, toggle, allowMultiple }}>
      <div role="presentation" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {children}
      </div>
    </AccordionCtx.Provider>
  );
};

const AccordionItem = ({ children, id }: { children: React.ReactNode; id: string }) => (
  <ItemCtx.Provider value={{ itemId: id }}>
    <div style={{ border: "1px solid #2d2d44", borderRadius: "10px", overflow: "hidden" }}>
      {children}
    </div>
  </ItemCtx.Provider>
);

const AccordionHeader = ({ children }: { children: React.ReactNode }) => {
  const { openItems, toggle } = useAccordion();
  const { itemId } = useAccordionItem();
  const isOpen = openItems.has(itemId);
  const panelId = `accordion-panel-${itemId}`;

  return (
    <button
      // ARIA: aria-expanded tells screen readers if the panel is open
      aria-expanded={isOpen}
      // ARIA: aria-controls links button to the panel it controls
      aria-controls={panelId}
      onClick={() => toggle(itemId)}
      style={{
        width: "100%",
        padding: "14px 16px",
        background: isOpen ? "#1a1422" : "#1e1e2e",
        border: "none",
        color: isOpen ? "#a78bfa" : "#e2e8f0",
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "14px",
        fontWeight: isOpen ? 600 : 400,
        textAlign: "left",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {children}
      {/* Rotate icon based on open state */}
      <span style={{
        fontSize: "12px",
        color: "#6366f1",
        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s",
        flexShrink: 0,
      }}>
        ▾
      </span>
    </button>
  );
};

const AccordionContent = ({ children }: { children: React.ReactNode }) => {
  const { openItems } = useAccordion();
  const { itemId } = useAccordionItem();
  const isOpen = openItems.has(itemId);
  const panelId = `accordion-panel-${itemId}`;

  if (!isOpen) return null;

  return (
    <div
      id={panelId}
      role="region"
      style={{
        padding: "12px 16px",
        background: "#12121c",
        color: "#94a3b8",
        fontSize: "14px",
        lineHeight: "1.7",
        borderTop: "1px solid #2d2d44",
      }}
    >
      {children}
    </div>
  );
};

// Attach sub-components
Accordion.Item    = AccordionItem;
Accordion.Header  = AccordionHeader;
Accordion.Content = AccordionContent;

// ─────────────────────────────────────────────────────────────
// FAQ data (faker)
// ─────────────────────────────────────────────────────────────

const FAQ_ITEMS = Array.from({ length: 6 }, (_, i) => ({
  id: `faq-${i}`,
  question: faker.lorem.sentence({ min: 6, max: 12 }).replace(/\.$/, "?"),
  answer: faker.lorem.paragraph({ min: 2, max: 4 }),
}));

// ─────────────────────────────────────────────────────────────
// Demo page
// ─────────────────────────────────────────────────────────────

export const MiniProjectAccordion = () => {
  const [allowMultiple, setAllowMultiple] = useState(false);

  return (
    <div>
      {/* Controls */}
      <div style={{
        background: "#12121c",
        border: "1px solid #6366f1",
        borderRadius: "10px",
        padding: "14px 16px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
      }}>
        <p style={{ color: "#a5b4fc", fontWeight: 600, fontSize: "13px" }}>🎯 Accordion Mini Project</p>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#7c85a2" }}>
          <input
            type="checkbox"
            checked={allowMultiple}
            onChange={e => setAllowMultiple(e.target.checked)}
          />
          Allow multiple open
        </label>
        <span style={{ fontSize: "12px", color: "#4a4a6a" }}>
          Pattern: Compound Components + Context + ARIA
        </span>
      </div>

      {/* Accordion with default first item open */}
      <Accordion allowMultiple={allowMultiple} defaultOpen={["faq-0"]}>
        {FAQ_ITEMS.map(item => (
          <Accordion.Item key={item.id} id={item.id}>
            <Accordion.Header>{item.question}</Accordion.Header>
            <Accordion.Content>{item.answer}</Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>

      <div className="code-hint" style={{ marginTop: "20px" }}>{`// Usage — reads like HTML, state is implicit via Context
<Accordion allowMultiple defaultOpen={["faq-0"]}>
  <Accordion.Item id="faq-0">
    <Accordion.Header>What is React?</Accordion.Header>
    <Accordion.Content>React is a library for building UIs...</Accordion.Content>
  </Accordion.Item>
</Accordion>`}</div>
    </div>
  );
};
