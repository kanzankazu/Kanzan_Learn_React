// =============================================================
// Phase 8 — 02: Code Splitting & Lazy Loading
// =============================================================
// By default, Vite/webpack bundles ALL your code into one JS file.
// As app grows: large initial bundle = slow first load.
//
// Code splitting: split the bundle into smaller chunks,
// load each chunk only when needed.
//
// React.lazy + Suspense:
//   lazy(() => import("./Component"))  → dynamic import
//   <Suspense fallback={<Loading />}>  → show fallback while loading
//
// Where to split:
//   ✅ Route-level: each page in its own chunk (biggest win)
//   ✅ Large modals/drawers that aren't shown immediately
//   ✅ Heavy libraries (charts, editors) used only in some routes
//   ❌ Small components — overhead not worth it
//   ❌ Components always visible on first load
//
// Vite automatically generates separate chunks for each dynamic import.
// Chunk is fetched ONCE, cached in browser — subsequent visits are instant.
//
// Android analogy:
//   Dynamic feature modules ~ code splitting
//   DFM download on demand ~ lazy() + Suspense
// =============================================================

import { lazy, Suspense, useState, startTransition } from "react";

// ─────────────────────────────────────────────────────────────
// Simulated lazy components
// ─────────────────────────────────────────────────────────────
// In a real app these would be in separate files:
//   const Dashboard = lazy(() => import("./pages/Dashboard"));
// Here we simulate network delay with a fake dynamic import.

// Simulate a heavy component that takes time to load
function createFakeHeavyModule(name: string, delay: number) {
  return () => new Promise<{ default: React.ComponentType }>(resolve => {
    setTimeout(() => {
      resolve({
        default: () => (
          <div style={{ padding: "20px", background: "#1e1e2e", borderRadius: "10px" }}>
            <p style={{ color: "#4ade80", fontWeight: 600, marginBottom: "8px" }}>
              ✅ {name} loaded (simulated {delay}ms delay)
            </p>
            <p style={{ color: "#94a3b8", fontSize: "13px" }}>
              In production this component lives in a separate JS chunk.
              It was only downloaded when you navigated here — not on initial page load.
            </p>
          </div>
        ),
      });
    }, delay);
  });
}

import React from "react";

// Each lazy() call creates a separate "chunk" in the bundle
const DashboardPage  = lazy(createFakeHeavyModule("Dashboard Page",  800));
const SettingsPage   = lazy(createFakeHeavyModule("Settings Page",  1200));
const AnalyticsPage  = lazy(createFakeHeavyModule("Analytics Page", 600));
const HeavyChart     = lazy(createFakeHeavyModule("Heavy Chart Component", 1500));

// ─────────────────────────────────────────────────────────────
// DEMO 1: Route-level code splitting (most common use case)
// ─────────────────────────────────────────────────────────────

const PageLoader = () => (
  <div style={{ padding: "40px", textAlign: "center", color: "#7c85a2" }}>
    <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
    <p>Loading page chunk...</p>
  </div>
);

const RouteCodeSplittingDemo = () => {
  const [activePage, setActivePage] = useState<string | null>(null);

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "10px" }}>
        Each &quot;page&quot; is a separate JS chunk — only downloaded when you click it:
      </p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
        {["dashboard", "settings", "analytics"].map(page => (
          <button
            key={page}
            className={`btn ${activePage === page ? "btn-primary" : "btn-ghost"}`}
            style={{ fontSize: "13px", textTransform: "capitalize" }}
            // startTransition: marks navigation as non-urgent
            // React keeps showing the old UI during the lazy load
            onClick={() => startTransition(() => setActivePage(page))}
          >
            {page}
          </button>
        ))}
        <button className="btn btn-ghost" onClick={() => setActivePage(null)}>
          Clear
        </button>
      </div>

      {/* Suspense: shows fallback while the chunk is downloading */}
      <Suspense fallback={<PageLoader />}>
        {activePage === "dashboard"  && <DashboardPage />}
        {activePage === "settings"   && <SettingsPage />}
        {activePage === "analytics"  && <AnalyticsPage />}
      </Suspense>

      {!activePage && (
        <p style={{ color: "#4a4a6a", fontSize: "13px" }}>Click a page to load its chunk</p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 2: Conditional lazy loading — modal/heavy component
// ─────────────────────────────────────────────────────────────

const ConditionalLazyDemo = () => {
  const [showChart, setShowChart] = useState(false);

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "10px" }}>
        Heavy chart component only loads when the user actually needs it:
      </p>
      <button
        className="btn btn-primary"
        onClick={() => setShowChart(s => !s)}
      >
        {showChart ? "Hide Chart" : "📊 Show Heavy Chart"}
      </button>

      {showChart && (
        <div style={{ marginTop: "12px" }}>
          {/* Separate Suspense boundary — only this part shows fallback */}
          <Suspense fallback={
            <div style={{ padding: "20px", textAlign: "center", color: "#7c85a2" }}>
              ⏳ Loading chart library...
            </div>
          }>
            <HeavyChart />
          </Suspense>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 3: Code example — real-world pattern
// ─────────────────────────────────────────────────────────────

const CodeExampleDemo = () => (
  <div className="demo-box">
    <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "10px" }}>
      Real-world code splitting setup (React Router + Vite):
    </p>
    <div className="code-hint">{`// App.tsx — route-level code splitting
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Each page is its own chunk — not included in initial bundle
const Home      = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings  = lazy(() => import("./pages/Settings"));

const App = () => (
  <BrowserRouter>
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings"  element={<Settings />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

// Preload a route on hover (before user clicks):
const NavLink = ({ to, children }) => (
  <Link
    to={to}
    onMouseEnter={() => import("./pages/Dashboard")} // preload!
  >
    {children}
  </Link>
);`}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const CodeSplitting = () => (
  <div>
    <div className="section">
      <h3>1. Route-level Code Splitting</h3>
      <RouteCodeSplittingDemo />
    </div>
    <div className="section">
      <h3>2. Conditional Lazy Loading</h3>
      <ConditionalLazyDemo />
    </div>
    <div className="section">
      <h3>3. Real-world Pattern</h3>
      <CodeExampleDemo />
    </div>
  </div>
);
