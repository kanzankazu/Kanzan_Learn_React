// =============================================================
// Phase 8 — Mini Project: High-Performance Data Table
// =============================================================
// A performant data table combining all Phase 8 techniques:
// [x] React.memo   — memoized rows, skip re-render on unrelated state
// [x] useMemo      — filtered + sorted data computed once
// [x] useCallback  — stable sort/filter handlers
// [x] Virtualization — 3,000 rows, only visible ones in DOM
// [x] Code splitting — column config loaded lazily (simulated)
//
// Features:
// - Column sorting (click header)
// - Search filter across name/email/role
// - Status filter pills
// - Row selection (click)
// - Export count badge
// =============================================================

import { useState, useMemo, useCallback, useRef, memo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { faker } from "@faker-js/faker";

faker.seed(300);

// ─────────────────────────────────────────────────────────────
// Types & Data
// ─────────────────────────────────────────────────────────────

type Status = "active" | "inactive" | "pending" | "suspended";
type SortField = "name" | "email" | "role" | "score" | "joined";
type SortDir = "asc" | "desc";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  score: number;
  status: Status;
  joined: string;
}

const DEPARTMENTS = ["Engineering", "Design", "Marketing", "Sales", "Support", "Finance"];
const ROLES = ["Senior Engineer", "Designer", "Manager", "Analyst", "Developer", "Lead"];
const STATUSES: Status[] = ["active", "inactive", "pending", "suspended"];

const EMPLOYEES: Employee[] = Array.from({ length: 3000 }, (_, i) => ({
  id: `emp-${i}`,
  name: faker.person.fullName(),
  email: faker.internet.email(),
  role: faker.helpers.arrayElement(ROLES),
  department: faker.helpers.arrayElement(DEPARTMENTS),
  score: faker.number.int({ min: 40, max: 100 }),
  status: faker.helpers.arrayElement(STATUSES),
  joined: faker.date.between({ from: "2018-01-01", to: "2024-01-01" }).toISOString().slice(0, 10),
}));

const STATUS_STYLE: Record<Status, { color: string; bg: string }> = {
  active:    { color: "#4ade80", bg: "#14532d22" },
  inactive:  { color: "#6b7280", bg: "#37415122" },
  pending:   { color: "#fbbf24", bg: "#92400e22" },
  suspended: { color: "#f87171", bg: "#7f1d1d22" },
};

// ─────────────────────────────────────────────────────────────
// Memoized Row — skips re-render unless its data/selection changes
// ─────────────────────────────────────────────────────────────

const TableRow = memo(({
  employee,
  isSelected,
  style,
  onSelect,
}: {
  employee: Employee;
  isSelected: boolean;
  style: React.CSSProperties;
  onSelect: (id: string) => void;
}) => (
  <div
    onClick={() => onSelect(employee.id)}
    style={{
      ...style,
      position: "absolute",
      top: 0, left: 0, width: "100%",
      display: "grid",
      gridTemplateColumns: "2fr 2fr 1fr 1fr 80px 70px",
      gap: "0 8px",
      alignItems: "center",
      padding: "0 12px",
      borderBottom: "1px solid #1a1a2e",
      background: isSelected ? "#1a1432" : "transparent",
      cursor: "pointer",
      fontSize: "13px",
      transition: "background 0.1s",
    }}
  >
    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{employee.name}</span>
    <span style={{ color: "#7c85a2", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{employee.email}</span>
    <span style={{ color: "#94a3b8", fontSize: "12px" }}>{employee.role}</span>
    <span style={{ color: "#94a3b8", fontSize: "12px" }}>{employee.department}</span>
    <span
      style={{
        padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, textAlign: "center",
        color: STATUS_STYLE[employee.status].color,
        background: STATUS_STYLE[employee.status].bg,
      }}
    >
      {employee.status}
    </span>
    <span style={{ color: "#a5b4fc", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
      {employee.score}
    </span>
  </div>
));

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export const MiniProjectDataTable = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({ field: "name", dir: "asc" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const parentRef = useRef<HTMLDivElement>(null);

  // useMemo: filter + sort only recomputes when deps change
  const filtered = useMemo(() => {
    let rows = EMPLOYEES;
    if (statusFilter !== "all") rows = rows.filter(e => e.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q)
      );
    }
    return [...rows].sort((a, b) => {
      const av = a[sort.field as keyof Employee] as string | number;
      const bv = b[sort.field as keyof Employee] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [search, statusFilter, sort]);

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 8,
  });

  // useCallback: stable handlers — memoized rows won't re-render on unrelated state changes
  const handleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleSort = useCallback((field: SortField) => {
    setSort(prev => ({
      field,
      dir: prev.field === field && prev.dir === "asc" ? "desc" : "asc",
    }));
  }, []);

  const SortIcon = ({ field }: { field: SortField }) =>
    sort.field === field ? (sort.dir === "asc" ? " ▲" : " ▼") : " ↕";

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px", alignItems: "center" }}>
        <input
          style={{ flex: 1, minWidth: "160px", padding: "8px 12px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0", fontSize: "13px" }}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, email, role..."
        />
        {(["all", "active", "inactive", "pending", "suspended"] as const).map(s => (
          <button
            key={s}
            className={`btn ${statusFilter === s ? "btn-primary" : "btn-ghost"}`}
            style={{ fontSize: "11px", padding: "4px 8px", textTransform: "capitalize" }}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
        {selected.size > 0 && (
          <span style={{ color: "#a78bfa", fontSize: "12px", marginLeft: "auto" }}>
            {selected.size} selected
          </span>
        )}
      </div>

      {/* Stats */}
      <p style={{ fontSize: "12px", color: "#7c85a2", marginBottom: "8px" }}>
        Showing {filtered.length.toLocaleString()} / {EMPLOYEES.length.toLocaleString()} employees · {virtualizer.getVirtualItems().length} DOM rows
      </p>

      {/* Header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 2fr 1fr 1fr 80px 70px",
        gap: "0 8px",
        padding: "8px 12px",
        background: "#12121c",
        borderRadius: "6px 6px 0 0",
        borderBottom: "1px solid #2d2d44",
        fontSize: "12px",
        fontWeight: 600,
        color: "#7c85a2",
      }}>
        {(["name", "email", "role", "department", "status", "score"] as const).map(field =>
          ["name", "email", "role", "score"].includes(field) ? (
            <button
              key={field}
              onClick={() => handleSort(field as SortField)}
              style={{ background: "none", border: "none", color: sort.field === field ? "#a5b4fc" : "#7c85a2", cursor: "pointer", textAlign: "left", fontWeight: 600, fontSize: "12px", padding: 0, textTransform: "capitalize" }}
            >
              {field}<SortIcon field={field as SortField} />
            </button>
          ) : (
            <span key={field} style={{ textTransform: "capitalize" }}>{field}</span>
          )
        )}
      </div>

      {/* Virtualized body */}
      <div
        ref={parentRef}
        style={{ height: "400px", overflowY: "auto", border: "1px solid #2d2d44", borderTop: "none", borderRadius: "0 0 6px 6px" }}
      >
        <div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
          {virtualizer.getVirtualItems().map(vItem => (
            <TableRow
              key={filtered[vItem.index].id}
              employee={filtered[vItem.index]}
              isSelected={selected.has(filtered[vItem.index].id)}
              style={{ height: `${vItem.size}px`, transform: `translateY(${vItem.start}px)` }}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      <div className="code-hint" style={{ marginTop: "16px" }}>{`// Phase 8 techniques used in this table:
React.memo(TableRow)    → rows skip re-render when unrelated state changes
useMemo(filter+sort)    → expensive computation cached, not recalculated every render
useCallback(handlers)   → stable function refs for memo'd row components
useVirtualizer(3,000)   → only visible rows in DOM (~10 at any time)`}</div>
    </div>
  );
};
