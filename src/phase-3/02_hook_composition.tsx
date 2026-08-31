// =============================================================
// Phase 3 — 02: Hook Composition
// =============================================================
// Custom hooks can call OTHER custom hooks — this is composition.
// It's the same principle as composing small functions into bigger ones.
//
// Pattern:
//   useA() + useB() → useAB()  (compose two hooks into one)
//
// Benefits:
// - Complex logic built from simple, tested building blocks
// - Each layer has a single responsibility
// - Changes to a lower-level hook propagate automatically
//
// Real-world example:
//   useDebounce + useFetch → useSearch
//   Components just call useSearch() — no idea what's inside
// =============================================================

import { useState, useEffect } from "react";
import { useDebounce, useFetch, useLocalStorage, useToggle } from "./01_custom_hooks";
import { faker } from "@faker-js/faker";

faker.seed(33);

// ─────────────────────────────────────────────────────────────
// COMPOSED HOOK 1: useSearch — debounce + fetch composed
// ─────────────────────────────────────────────────────────────
// Composes: useDebounce + useFetch
// Result: a search hook that debounces input before fetching

interface SearchResult {
  id: number;
  title: string;
  body: string;
}

function useSearch(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  // Layer 1: debounce the raw query input
  const debouncedQuery = useDebounce(query, 400);

  // Layer 2: fetch only when debouncedQuery has value
  // null url = useFetch does nothing (skip the effect)
  const url = debouncedQuery.trim()
    ? `https://jsonplaceholder.typicode.com/posts?_limit=5&q=${encodeURIComponent(debouncedQuery)}`
    : null;

  const { data, isLoading, error } = useFetch<SearchResult[]>(url);

  return {
    query,
    setQuery,
    results: data ?? [],
    isLoading,
    error,
    hasQuery: debouncedQuery.trim().length > 0,
  };
}

const SearchDemo = () => {
  const { query, setQuery, results, isLoading, error, hasQuery } = useSearch();

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        <code style={{ color: "#f472b6" }}>useSearch</code> = useDebounce + useFetch composed:
      </p>
      <input
        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0", marginBottom: "12px" }}
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search posts (try: sunt, qui, ea)..."
      />
      {!hasQuery && <p style={{ color: "#4a4a6a", fontSize: "13px" }}>Type to search JSONPlaceholder posts...</p>}
      {isLoading && <p style={{ color: "#7c85a2" }}>⏳ Searching...</p>}
      {error && <p style={{ color: "#f87171" }}>❌ {error}</p>}
      {hasQuery && !isLoading && results.length === 0 && !error && (
        <p style={{ color: "#4a4a6a" }}>No results found</p>
      )}
      <ul style={{ listStyle: "none" }}>
        {results.map(r => (
          <li key={r.id} style={{ padding: "8px 0", borderBottom: "1px solid #1a1a2e" }}>
            <p style={{ fontWeight: 600, fontSize: "13px", marginBottom: "2px" }}>{r.title}</p>
            <p style={{ color: "#7c85a2", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// COMPOSED HOOK 2: usePreferences — localStorage + toggle composed
// ─────────────────────────────────────────────────────────────
// Composes: useLocalStorage + useToggle
// Result: user preferences that persist across sessions

interface UserPreferences {
  theme: "light" | "dark";
  fontSize: "sm" | "md" | "lg";
  showNotifications: boolean;
}

const DEFAULT_PREFS: UserPreferences = {
  theme: "dark",
  fontSize: "md",
  showNotifications: true,
};

function usePreferences() {
  const [prefs, setPrefs] = useLocalStorage<UserPreferences>("user_prefs", DEFAULT_PREFS);
  const advancedPanel = useToggle(false); // UI state — NOT persisted

  const updatePref = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) =>
    setPrefs(prev => ({ ...prev, [key]: value }));

  const resetPrefs = () => setPrefs(DEFAULT_PREFS);

  return { prefs, updatePref, resetPrefs, advancedPanel };
}

const PreferencesDemo = () => {
  const { prefs, updatePref, resetPrefs, advancedPanel } = usePreferences();

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
        <code style={{ color: "#f472b6" }}>usePreferences</code> = useLocalStorage + useToggle composed.
        Changes persist across refreshes:
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Theme */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px" }}>Theme</span>
          <div style={{ display: "flex", gap: "6px" }}>
            {(["light", "dark"] as const).map(t => (
              <button
                key={t}
                className={`btn ${prefs.theme === t ? "btn-primary" : "btn-ghost"}`}
                style={{ fontSize: "12px", padding: "4px 10px" }}
                onClick={() => updatePref("theme", t)}
              >
                {t === "dark" ? "🌙" : "☀️"} {t}
              </button>
            ))}
          </div>
        </div>

        {/* Font size */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px" }}>Font Size</span>
          <div style={{ display: "flex", gap: "6px" }}>
            {(["sm", "md", "lg"] as const).map(s => (
              <button
                key={s}
                className={`btn ${prefs.fontSize === s ? "btn-primary" : "btn-ghost"}`}
                style={{ fontSize: "12px", padding: "4px 10px" }}
                onClick={() => updatePref("fontSize", s)}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px" }}>Notifications</span>
          <button
            className={`btn ${prefs.showNotifications ? "btn-primary" : "btn-ghost"}`}
            style={{ fontSize: "12px", padding: "4px 10px" }}
            onClick={() => updatePref("showNotifications", !prefs.showNotifications)}
          >
            {prefs.showNotifications ? "🔔 On" : "🔕 Off"}
          </button>
        </div>

        {/* Advanced panel — toggle but not persisted */}
        <div>
          <button className="btn btn-ghost" style={{ fontSize: "12px" }} onClick={advancedPanel.toggle}>
            {advancedPanel.value ? "▾" : "▸"} Advanced
          </button>
          {advancedPanel.value && (
            <div style={{ marginTop: "8px", padding: "8px", background: "#12121c", borderRadius: "6px" }}>
              <div className="code-hint">{JSON.stringify(prefs, null, 2)}</div>
              <button className="btn btn-danger" style={{ fontSize: "12px", marginTop: "8px" }} onClick={resetPrefs}>
                Reset to defaults
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// COMPOSED HOOK 3: usePaginatedList — pagination logic
// ─────────────────────────────────────────────────────────────

function usePaginatedList<T>(items: T[], pageSize = 5) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(items.length / pageSize);
  const currentItems = items.slice(page * pageSize, (page + 1) * pageSize);

  const goNext = () => setPage(p => Math.min(p + 1, totalPages - 1));
  const goPrev = () => setPage(p => Math.max(p - 1, 0));
  const goTo = (n: number) => setPage(Math.max(0, Math.min(n, totalPages - 1)));

  // Reset to first page when items change
  useEffect(() => { setPage(0); }, [items.length]);

  return { currentItems, page, totalPages, goNext, goPrev, goTo, isFirst: page === 0, isLast: page === totalPages - 1 };
}

const fakeItems = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  name: faker.person.fullName(),
  role: faker.person.jobTitle(),
}));

const PaginationDemo = () => {
  const { currentItems, page, totalPages, goNext, goPrev, isFirst, isLast } = usePaginatedList(fakeItems, 5);

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "10px" }}>
        <code style={{ color: "#f472b6" }}>usePaginatedList</code> — pagination logic extracted:
      </p>
      <ul style={{ listStyle: "none", marginBottom: "12px" }}>
        {currentItems.map(item => (
          <li key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1a1a2e", fontSize: "13px" }}>
            <span>{item.name}</span>
            <span style={{ color: "#7c85a2" }}>{item.role}</span>
          </li>
        ))}
      </ul>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
        <button className="btn btn-ghost" style={{ fontSize: "12px" }} disabled={isFirst} onClick={goPrev}>← Prev</button>
        <span style={{ color: "#7c85a2", fontSize: "13px" }}>Page {page + 1} / {totalPages}</span>
        <button className="btn btn-primary" style={{ fontSize: "12px" }} disabled={isLast} onClick={goNext}>Next →</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const HookComposition = () => (
  <div>
    <div className="section">
      <h3>1. useSearch — useDebounce + useFetch</h3>
      <SearchDemo />
    </div>
    <div className="section">
      <h3>2. usePreferences — useLocalStorage + useToggle</h3>
      <PreferencesDemo />
    </div>
    <div className="section">
      <h3>3. usePaginatedList — Standalone Pagination Logic</h3>
      <PaginationDemo />
    </div>
  </div>
);
