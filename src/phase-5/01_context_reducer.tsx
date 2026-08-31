// =============================================================
// Phase 5 — 01: Context API + useReducer
// =============================================================
// Before reaching for an external library, Context + useReducer
// can handle many state management needs natively in React.
//
// Pattern:
//   1. Define state shape + action types
//   2. Write reducer (pure function)
//   3. Create Context with state + dispatch
//   4. Wrap app in Provider
//   5. Consume with custom hook (useMyContext)
//
// Strengths:
//   + Zero dependencies — built into React
//   + Simple mental model: Redux-lite
//   + Great for: auth state, theme, user preferences
//
// Weaknesses:
//   - Every Context consumer re-renders on ANY state change
//   - No built-in devtools
//   - Verbose boilerplate for complex state
//   - Avoid for high-frequency updates (every keystroke, etc.)
//
// Android/Compose analogy:
//   CompositionLocalProvider + ViewModel ~ Context + useReducer
// =============================================================

import { createContext, useContext, useReducer } from "react";
import React from "react";
import { makeFakeUser } from "../lib/fake-data";

// ─────────────────────────────────────────────────────────────
// State & Actions
// ─────────────────────────────────────────────────────────────

interface Notification { id: string; message: string; type: "info" | "success" | "error"; }

interface AppState {
  user: { name: string; email: string } | null;
  theme: "light" | "dark";
  notifications: Notification[];
  sidebarOpen: boolean;
}

type AppAction =
  | { type: "LOGIN";           payload: { name: string; email: string } }
  | { type: "LOGOUT" }
  | { type: "TOGGLE_THEME" }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "REMOVE_NOTIFICATION"; payload: string };   // payload = notification id

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...state, user: null };
    case "TOGGLE_THEME":
      return { ...state, theme: state.theme === "dark" ? "light" : "dark" };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case "ADD_NOTIFICATION":
      return { ...state, notifications: [...state.notifications, action.payload] };
    case "REMOVE_NOTIFICATION":
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
  }
}

const INITIAL_STATE: AppState = {
  user: null,
  theme: "dark",
  notifications: [],
  sidebarOpen: false,
};

// ─────────────────────────────────────────────────────────────
// Context + Provider
// ─────────────────────────────────────────────────────────────

interface AppCtxValue { state: AppState; dispatch: React.Dispatch<AppAction>; }
const AppCtx = createContext<AppCtxValue | null>(null);

// Custom hook: consumers call useApp() — no need to import AppCtx directly
function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);
  return <AppCtx.Provider value={{ state, dispatch }}>{children}</AppCtx.Provider>;
};

// ─────────────────────────────────────────────────────────────
// Consumer components — they read/write context, no props needed
// ─────────────────────────────────────────────────────────────

let notifId = 0;

const Controls = () => {
  const { state, dispatch } = useApp();
  const fakeUser = makeFakeUser();

  const addNotif = (type: Notification["type"]) => {
    const messages = { info: "Sync complete", success: "Saved successfully!", error: "Request failed" };
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: { id: String(++notifId), message: messages[type], type },
    });
  };

  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
      {state.user ? (
        <button className="btn btn-danger" onClick={() => dispatch({ type: "LOGOUT" })}>Logout</button>
      ) : (
        <button className="btn btn-primary" onClick={() => dispatch({ type: "LOGIN", payload: { name: fakeUser.name, email: fakeUser.email } })}>
          Login
        </button>
      )}
      <button className="btn btn-ghost" onClick={() => dispatch({ type: "TOGGLE_THEME" })}>
        {state.theme === "dark" ? "☀️ Light" : "🌙 Dark"}
      </button>
      <button className="btn btn-ghost" onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}>
        {state.sidebarOpen ? "← Close" : "→ Open"} Sidebar
      </button>
      <button className="btn btn-ghost" style={{ fontSize: "12px" }} onClick={() => addNotif("info")}>+ Info</button>
      <button className="btn btn-primary" style={{ fontSize: "12px" }} onClick={() => addNotif("success")}>+ Success</button>
      <button className="btn btn-danger" style={{ fontSize: "12px" }} onClick={() => addNotif("error")}>+ Error</button>
    </div>
  );
};

const StatusBar = () => {
  const { state } = useApp();
  return (
    <div style={{ display: "flex", gap: "12px", fontSize: "13px", flexWrap: "wrap", marginBottom: "12px" }}>
      <span style={{ color: state.user ? "#4ade80" : "#7c85a2" }}>
        {state.user ? `👤 ${state.user.name}` : "Not logged in"}
      </span>
      <span style={{ color: "#7c85a2" }}>Theme: {state.theme}</span>
      <span style={{ color: state.sidebarOpen ? "#a5b4fc" : "#7c85a2" }}>
        Sidebar: {state.sidebarOpen ? "open" : "closed"}
      </span>
    </div>
  );
};

const NotificationList = () => {
  const { state, dispatch } = useApp();
  const colors = { info: "#60a5fa", success: "#4ade80", error: "#f87171" };
  if (state.notifications.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {state.notifications.map(n => (
        <div key={n.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", background: "#12121c", borderLeft: `3px solid ${colors[n.type]}` }}>
          <span style={{ flex: 1, fontSize: "13px", color: colors[n.type] }}>{n.message}</span>
          <button
            style={{ background: "none", border: "none", color: "#7c85a2", cursor: "pointer", fontSize: "14px" }}
            onClick={() => dispatch({ type: "REMOVE_NOTIFICATION", payload: n.id })}
          >✕</button>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────

export const ContextReducer = () => (
  <div>
    <div className="section">
      <h3>Context + useReducer — App-level State</h3>
      <div className="demo-box">
        <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
          All components read/write the same context. No prop drilling:
        </p>
        {/* Provider wraps all consumers */}
        <AppProvider>
          <Controls />
          <StatusBar />
          <NotificationList />
        </AppProvider>
      </div>
      <div className="code-hint" style={{ marginTop: "12px" }}>{`// Usage in any component inside AppProvider
const { state, dispatch } = useApp();
dispatch({ type: "TOGGLE_THEME" });
dispatch({ type: "LOGIN", payload: { name, email } });`}</div>
    </div>
  </div>
);
