// =============================================================
// Phase 8 — 03: Virtualization
// =============================================================
// Virtualization (windowing) renders ONLY the visible items in a list,
// not all 10,000 items at once. Invisible items are not in the DOM.
//
// Problem without virtualization:
//   10,000 rows × 50px = 500,000px tall div
//   All 10,000 DOM nodes exist → browser slows to a crawl
//   Initial render: several seconds
//   Scroll: janky, high paint time
//
// With virtualization:
//   Only ~20 rows visible in the viewport → only 20 DOM nodes
//   As user scrolls: remove top rows, add bottom rows
//   Initial render: milliseconds
//   Scroll: 60fps smooth
//
// Library: @tanstack/react-virtual
//   install: npm install @tanstack/react-virtual
//
// Alternative: react-window (lighter), react-virtuoso (easier API)
//
// Android analogy:
//   RecyclerView + ViewHolder recycling ~ react-virtual windowing
// =============================================================

import { useState, useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { faker } from "@faker-js/faker";

faker.seed(200);

// ─────────────────────────────────────────────────────────────
// Data: 5,000 rows
// ─────────────────────────────────────────────────────────────

interface Row { id: string; name: string; email: string; score: number; status: "active" | "inactive" | "pending"; }

const BIG_LIST: Row[] = Array.from({ length: 5000 }, (_, i) => ({
  id: `row-${i}`,
  name: faker.person.fullName(),
  email: faker.internet.email(),
  score: faker.number.int({ min: 0, max: 100 }),
  status: faker.helpers.arrayElement(["active", "inactive", "pending"] as const),
}));

const STATUS_COLOR: Record<Row["status"], string> = {
  active: "#4ade80", inactive: "#6b7280", pending: "#fbbf24",
};

// ─────────────────────────────────────────────────────────────
// DEMO 1: Virtualized list — 5,000 rows
// ─────────────────────────────────────────────────────────────

const VirtualListDemo = () => {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(
    () => BIG_LIST.filter(r =>
      filter === "" ||
      r.name.toLowerCase().includes(filter.toLowerCase()) ||
      r.status === filter
    ),
    [filter]
  );

  // scrollable container ref — virtualizer needs to measure the container
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: filtered.length,           // total number of items
    getScrollElement: () => parentRef.current, // the scrollable element
    estimateSize: () => 48,           // estimated row height in px
    overscan: 5,                      // render 5 extra rows above/below viewport
  });

  return (
    <div className="demo-box">
      <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          style={{ flex: 1, minWidth: "120px", padding: "6px 10px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0", fontSize: "13px" }}
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Search..."
        />
        {["active", "inactive", "pending"].map(s => (
          <button
            key={s}
            className={`btn ${filter === s ? "btn-primary" : "btn-ghost"}`}
            style={{ fontSize: "11px", padding: "4px 8px" }}
            onClick={() => setFilter(f => f === s ? "" : s)}
          >
            {s}
          </button>
        ))}
        <span style={{ fontSize: "12px", color: "#7c85a2" }}>
          {filtered.length.toLocaleString()} / {BIG_LIST.length.toLocaleString()} rows
        </span>
      </div>

      {/* The scroll container — fixed height, overflow hidden */}
      <div
        ref={parentRef}
        style={{ height: "320px", overflowY: "auto", border: "1px solid #2d2d44", borderRadius: "6px" }}
      >
        {/*
         * Inner div MUST have the total height of ALL items.
         * This gives the scrollbar the correct size without rendering all DOM nodes.
         */}
        <div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
          {/* Only the visible virtual items are rendered */}
          {virtualizer.getVirtualItems().map(vItem => {
            const row = filtered[vItem.index];
            return (
              <div
                key={vItem.key}
                // Absolute positioning: each item placed at its exact scroll position
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${vItem.size}px`,
                  transform: `translateY(${vItem.start}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "0 12px",
                  borderBottom: "1px solid #1a1a2e",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "#4a4a6a", minWidth: "48px", fontSize: "11px" }}>
                  #{vItem.index + 1}
                </span>
                <span style={{ flex: 1 }}>{row.name}</span>
                <span style={{ color: "#7c85a2", fontSize: "12px", display: "none", flex: 1 }}
                  className="hide-mobile">{row.email}</span>
                <span style={{
                  padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600,
                  color: STATUS_COLOR[row.status],
                  background: `${STATUS_COLOR[row.status]}22`,
                }}>
                  {row.status}
                </span>
                <span style={{ color: "#a5b4fc", fontSize: "12px", minWidth: "32px", textAlign: "right" }}>
                  {row.score}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p style={{ fontSize: "12px", color: "#7c85a2", marginTop: "8px" }}>
        Only ~{Math.ceil(320 / 48) + 10} DOM nodes rendered regardless of total count.
        Scroll to verify smooth performance.
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 2: Non-virtualized comparison — shows the problem
// ─────────────────────────────────────────────────────────────

const NonVirtualizedDemo = () => {
  const [rendered, setRendered] = useState(false);
  const [rowCount, setRowCount] = useState(500);

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        Without virtualization — all DOM nodes rendered at once:
      </p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "center" }}>
        <select
          style={{ padding: "6px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0", fontSize: "13px" }}
          value={rowCount}
          onChange={e => { setRowCount(Number(e.target.value)); setRendered(false); }}
        >
          <option value={100}>100 rows</option>
          <option value={500}>500 rows</option>
          <option value={1000}>1,000 rows</option>
          <option value={5000}>5,000 rows ⚠️ slow</option>
        </select>
        <button className="btn btn-danger" onClick={() => setRendered(true)}>
          Render {rowCount.toLocaleString()} rows (no virtualization)
        </button>
      </div>
      {rendered && (
        <div style={{ height: "200px", overflowY: "auto", border: "1px solid #2d2d44", borderRadius: "6px" }}>
          {BIG_LIST.slice(0, rowCount).map(row => (
            <div key={row.id} style={{ padding: "6px 12px", borderBottom: "1px solid #1a1a2e", fontSize: "12px", color: "#94a3b8" }}>
              {row.name} — {row.email}
            </div>
          ))}
        </div>
      )}
      {rendered && (
        <p style={{ fontSize: "12px", color: "#f87171", marginTop: "6px" }}>
          {rowCount.toLocaleString()} DOM nodes in memory. At 5,000+ rows, scroll becomes janky.
        </p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const Virtualization = () => (
  <div>
    <div className="section">
      <h3>1. Virtualized List — 5,000 rows, smooth scroll</h3>
      <VirtualListDemo />
    </div>
    <div className="section">
      <h3>2. Without Virtualization — the problem</h3>
      <NonVirtualizedDemo />
    </div>
  </div>
);
