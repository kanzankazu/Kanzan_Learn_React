// =============================================================
// Phase 4 — 03: Higher-Order Components (HOC)
// =============================================================
// A Higher-Order Component is a function that takes a component
// and returns a new enhanced component.
//
// Pattern:
//   const EnhancedComponent = withSomething(BaseComponent);
//
// HOCs can:
//   - Add/inject props (auth user, theme, config)
//   - Wrap with providers or error boundaries
//   - Add loading/auth guards
//   - Add logging/analytics
//
// Modern note: Custom Hooks have largely replaced HOCs for logic
// reuse. But HOCs are still used for:
//   - Class component enhancement (legacy code)
//   - Library APIs (React Redux connect(), React.memo())
//   - Cross-cutting concerns (error boundaries must be class components)
//
// Naming convention: prefix with "with" — withAuth, withTheme, withLogging
//
// Android/Compose analogy:
//   Decorator pattern in OOP
//   ~ Compose Modifier chain (each modifier wraps the composable)
// =============================================================

import { useState, memo } from "react";
import React from "react";

// ─────────────────────────────────────────────────────────────
// HOC 1: withLoading — adds loading/error states to any component
// ─────────────────────────────────────────────────────────────

interface WithLoadingProps {
  isLoading?: boolean;
  error?: string | null;
}

// Generic: <P extends object> means P can be any props object
// Omit<P, keyof WithLoadingProps> removes our injected props from P
// so consumers don't have to pass them to the wrapped component
function withLoading<P extends object>(
  Component: React.ComponentType<P>
) {
  // The returned component accepts both P's props AND our loading props
  const WithLoadingComponent = ({ isLoading, error, ...props }: P & WithLoadingProps) => {
    if (isLoading) return (
      <div style={{ padding: "24px", textAlign: "center", color: "#7c85a2" }}>
        ⏳ Loading...
      </div>
    );
    if (error) return (
      <div style={{ padding: "24px", textAlign: "center", color: "#f87171" }}>
        ❌ {error}
      </div>
    );
    // Pass only the original component's props — not our injected ones
    return <Component {...(props as P)} />;
  };

  // Preserve display name for React DevTools
  WithLoadingComponent.displayName = `WithLoading(${Component.displayName ?? Component.name})`;
  return WithLoadingComponent;
}

// A simple user list component — knows nothing about loading states
const UserListBase = ({ users }: { users: string[] }) => (
  <ul style={{ listStyle: "none" }}>
    {users.map(u => (
      <li key={u} style={{ padding: "6px 0", borderBottom: "1px solid #1a1a2e", fontSize: "14px", color: "#94a3b8" }}>
        👤 {u}
      </li>
    ))}
  </ul>
);

// Enhanced version with loading/error handling baked in
const UserListWithLoading = withLoading(UserListBase);

const WithLoadingDemo = () => {
  const [state, setState] = useState<"idle" | "loading" | "error" | "success">("idle");
  const users = ["Alice Martin", "Bob Chen", "Carol White", "David Kim"];

  const simulate = (s: typeof state) => {
    setState("loading");
    setTimeout(() => setState(s === "loading" ? "success" : s), 1500);
  };

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
        <code style={{ color: "#f472b6" }}>withLoading(UserList)</code> — loading/error injected by HOC:
      </p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={() => simulate("loading")}>Simulate Load</button>
        <button className="btn btn-danger" onClick={() => setState("error")}>Simulate Error</button>
        <button className="btn btn-ghost" onClick={() => setState("success")}>Show Data</button>
        <button className="btn btn-ghost" onClick={() => setState("idle")}>Reset</button>
      </div>
      {state === "idle" ? (
        <p style={{ color: "#4a4a6a", fontSize: "13px" }}>Click a button above to simulate states</p>
      ) : (
        <UserListWithLoading
          users={users}
          isLoading={state === "loading"}
          error={state === "error" ? "Failed to fetch users" : null}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// HOC 2: withAuth — route/component guard
// ─────────────────────────────────────────────────────────────

// Mock auth context
const mockUser = { name: "Alice Martin", role: "admin" as "admin" | "user" };

function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: "admin" | "user"
) {
  const AuthGuard = (props: P) => {
    // In a real app, this would use useContext(AuthContext)
    const [user, setUser] = useState<typeof mockUser | null>(null);

    if (!user) return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p style={{ color: "#7c85a2", marginBottom: "12px" }}>🔒 Authentication required</p>
        <button className="btn btn-primary" onClick={() => setUser(mockUser)}>
          Login as Alice (admin)
        </button>
      </div>
    );

    if (requiredRole && user.role !== requiredRole) return (
      <div style={{ padding: "20px", textAlign: "center", color: "#f87171" }}>
        🚫 Forbidden — requires {requiredRole} role (you are: {user.role})
      </div>
    );

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "12px", color: "#7c85a2" }}>
          <span>Logged in as <strong style={{ color: "#a5b4fc" }}>{user.name}</strong> ({user.role})</span>
          <button className="btn btn-ghost" style={{ fontSize: "11px", padding: "2px 8px" }} onClick={() => setUser(null)}>Logout</button>
        </div>
        <Component {...props} />
      </div>
    );
  };
  AuthGuard.displayName = `WithAuth(${Component.displayName ?? Component.name})`;
  return AuthGuard;
}

const AdminPanel = () => (
  <div style={{ padding: "12px", background: "#12121c", borderRadius: "8px" }}>
    <p style={{ color: "#4ade80", fontWeight: 600, marginBottom: "8px" }}>Admin Panel</p>
    <p style={{ color: "#94a3b8", fontSize: "13px" }}>You have admin access. Sensitive settings visible here.</p>
  </div>
);

const ProtectedAdminPanel = withAuth(AdminPanel, "admin");

const WithAuthDemo = () => (
  <div className="demo-box">
    <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
      <code style={{ color: "#f472b6" }}>withAuth(AdminPanel, "admin")</code> — auth guard injected by HOC:
    </p>
    <ProtectedAdminPanel />
  </div>
);

// ─────────────────────────────────────────────────────────────
// HOC 3: React.memo — the HOC you already know
// ─────────────────────────────────────────────────────────────

const ExpensiveChild = memo(({ label, value }: { label: string; value: number }) => {
  // In production, this would be a heavy computation or deep render tree
  return (
    <div style={{ padding: "8px 12px", background: "#12121c", borderRadius: "6px", marginBottom: "6px", fontSize: "13px" }}>
      {label}: <strong style={{ color: "#a5b4fc" }}>{value}</strong>
    </div>
  );
});

const MemoDemo = () => {
  const [counter, setCounter] = useState(0);
  const [stableValue] = useState(42);

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        <code style={{ color: "#f472b6" }}>React.memo</code> is a HOC — wraps a component to skip re-renders:
      </p>
      <button className="btn btn-primary" style={{ marginBottom: "12px" }} onClick={() => setCounter(c => c + 1)}>
        Increment counter ({counter})
      </button>
      {/* stableValue never changes → memo'd child does NOT re-render */}
      <ExpensiveChild label="Stable value (memo'd)" value={stableValue} />
      <ExpensiveChild label="Counter (memo'd but value changes)" value={counter} />
      <div className="code-hint" style={{ marginTop: "8px" }}>{`// React.memo is literally:
const Memo = (Component) => { /* compare props */ return Component; }
const MyComponent = React.memo(({ value }) => <div>{value}</div>);`}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const HigherOrderComponents = () => (
  <div>
    <div className="section">
      <h3>1. withLoading — inject loading/error states</h3>
      <WithLoadingDemo />
    </div>
    <div className="section">
      <h3>2. withAuth — authentication guard</h3>
      <WithAuthDemo />
    </div>
    <div className="section">
      <h3>3. React.memo — the HOC you already use</h3>
      <MemoDemo />
    </div>
  </div>
);
