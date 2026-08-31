// =============================================================
// Phase 2 — 03: useContext
// =============================================================
// Context provides a way to share values between components without
// passing props through every level of the tree (prop drilling).
//
// When to use Context:
//   ✅ Theme (light/dark)
//   ✅ Current logged-in user
//   ✅ Language/locale
//   ✅ Feature flags
//   ❌ Frequently changing data (every context change re-renders ALL consumers)
//   ❌ Data only needed by a few closely related components (just use props)
//
// Pattern: createContext → Provider → useContext (via custom hook)
//
// Android/Compose analogy:
//   CompositionLocalProvider { ... }  ~  Context.Provider
//   LocalContentColor.current         ~  useContext(ThemeContext)
// =============================================================

import { createContext, useContext, useState } from "react";
import React from "react";

// ─────────────────────────────────────────────────────────────
// DEMO 1: Theme Context — the classic context example
// ─────────────────────────────────────────────────────────────

// Step 1: Define the shape of the context value
interface ThemeContextValue {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

// Step 2: Create the context with null as default
// null means "no provider found" — we handle this in the custom hook
const ThemeContext = createContext<ThemeContextValue | null>(null);

// Step 3: Custom hook for consuming the context (best practice)
// This is better than calling useContext directly in components because:
// - It provides a clear error if used outside the provider
// - It hides implementation details (consumers don't need to import ThemeContext)
function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

// Step 4: Provider component — wraps the part of the tree that needs access
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");

  // value object is recreated on every render — use useMemo in production
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Consumer components — can be anywhere deep in the tree
const ThemedHeader = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div style={{
      padding: "12px 16px",
      borderRadius: "8px",
      background: theme === "dark" ? "#1a1a2e" : "#f1f5f9",
      color: theme === "dark" ? "#e2e8f0" : "#1e293b",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "8px",
    }}>
      <span style={{ fontWeight: 600 }}>Header — theme: {theme}</span>
      <button
        className="btn btn-ghost"
        style={{ padding: "4px 12px", fontSize: "13px" }}
        onClick={toggleTheme}
      >
        {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
      </button>
    </div>
  );
};

const ThemedCard = ({ title }: { title: string }) => {
  const { theme } = useTheme();
  return (
    <div style={{
      padding: "12px",
      borderRadius: "8px",
      background: theme === "dark" ? "#1e1e2e" : "#ffffff",
      color: theme === "dark" ? "#e2e8f0" : "#1e293b",
      border: `1px solid ${theme === "dark" ? "#2d2d44" : "#e2e8f0"}`,
    }}>
      {title}
    </div>
  );
};

const ThemeContextDemo = () => (
  <div className="demo-box">
    <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
      ThemeProvider wraps the tree — any descendant can read/update the theme:
    </p>
    {/* Provider wraps the consumer components */}
    <ThemeProvider>
      <ThemedHeader />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <ThemedCard title="Card A — reads theme" />
        <ThemedCard title="Card B — same context" />
      </div>
    </ThemeProvider>
  </div>
);

// ─────────────────────────────────────────────────────────────
// DEMO 2: User Context — auth pattern
// ─────────────────────────────────────────────────────────────

interface User { name: string; email: string; role: "admin" | "user"; }
interface UserContextValue { user: User | null; login: (name: string) => void; logout: () => void; }

const UserContext = createContext<UserContextValue | null>(null);
const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be inside UserProvider");
  return ctx;
};

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const login = (name: string) => setUser({ name, email: `${name.toLowerCase()}@example.com`, role: "user" });
  const logout = () => setUser(null);
  return <UserContext.Provider value={{ user, login, logout }}>{children}</UserContext.Provider>;
};

// NavBar reads user without receiving it as a prop
const NavBar = () => {
  const { user, logout } = useUser();
  return (
    <div style={{ padding: "10px 14px", background: "#12121c", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontWeight: 600, color: "#a5b4fc" }}>MyApp</span>
      {user ? (
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", color: "#7c85a2" }}>👤 {user.name}</span>
          <button className="btn btn-danger" style={{ padding: "4px 10px", fontSize: "12px" }} onClick={logout}>Logout</button>
        </div>
      ) : (
        <span style={{ fontSize: "13px", color: "#4a4a6a" }}>Not logged in</span>
      )}
    </div>
  );
};

const LoginButtons = () => {
  const { user, login } = useUser();
  const fakeNames = ["Alice Martin", "Bob Chen", "Carol White"];
  if (user) return <p style={{ color: "#4ade80", fontSize: "13px", textAlign: "center", marginTop: "8px" }}>✅ Logged in as {user.name}</p>;
  return (
    <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
      {fakeNames.map(name => (
        <button key={name} className="btn btn-primary" style={{ fontSize: "13px" }} onClick={() => login(name)}>
          Login as {name.split(" ")[0]}
        </button>
      ))}
    </div>
  );
};

const UserContextDemo = () => (
  <div className="demo-box">
    <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
      Auth context — NavBar and LoginButtons share user state without prop drilling:
    </p>
    <UserProvider>
      <NavBar />
      <LoginButtons />
    </UserProvider>
  </div>
);

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const UseContext = () => (
  <div>
    <div className="section">
      <h3>1. Theme Context — light/dark toggle</h3>
      <ThemeContextDemo />
    </div>
    <div className="section">
      <h3>2. User Context — auth pattern</h3>
      <UserContextDemo />
    </div>
  </div>
);
