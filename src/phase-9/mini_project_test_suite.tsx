// =============================================================
// Phase 9 — Mini Project: Test Suite
// =============================================================
// This page shows the test components and links to test files.
// Run the actual tests with: npm test
// =============================================================

import { useState } from "react";
import { Counter } from "./components/Counter";
import { LoginForm } from "./components/LoginForm";
import { UserList } from "./components/UserList";

const TEST_FILES = [
  { file: "01_rendering.test.tsx",   label: "Rendering Tests",    count: 10, patterns: ["render()", "screen.getBy*", "queryBy*", "conditional rendering", "list rendering"] },
  { file: "02_interaction.test.tsx", label: "Interaction Tests",  count: 9,  patterns: ["userEvent.click()", "userEvent.type()", "vi.fn()", "toHaveBeenCalledWith"] },
  { file: "03_async.test.tsx",       label: "Async Tests",        count: 8,  patterns: ["waitFor()", "findBy*()", "vi.useFakeTimers()", "mockResolvedValue", "mockRejectedValue"] },
  { file: "04_forms.test.tsx",       label: "Form Tests",         count: 9,  patterns: ["getByLabelText()", "toHaveAttribute()", "aria-invalid", "role=alert", "loading state"] },
  { file: "05_hooks.test.tsx",       label: "Hook Tests",         count: 17, patterns: ["renderHook()", "act()", "localStorage.clear()", "useEffect timing"] },
];

export const MiniProjectTestSuite = () => {
  const [showCounter, setShowCounter] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showUserList, setShowUserList] = useState(false);

  const totalTests = TEST_FILES.reduce((n, f) => n + f.count, 0);

  return (
    <div>
      {/* Run command */}
      <div style={{ background: "#0d1117", border: "1px solid #6366f1", borderRadius: "10px", padding: "16px 20px", marginBottom: "24px" }}>
        <p style={{ color: "#a5b4fc", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>
          🧪 Run the test suite
        </p>
        <div className="code-hint">{`# Run all tests (single pass)
npm test

# Watch mode (re-runs on file save)
npm run test:watch

# With coverage report
npx vitest run --coverage`}</div>
      </div>

      {/* Test file overview */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 style={{ fontSize: "16px", color: "#c4b5fd" }}>Test Files ({totalTests} tests total)</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {TEST_FILES.map(f => (
            <div key={f.file} style={{ background: "#1e1e2e", border: "1px solid #2d2d44", borderRadius: "8px", padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ color: "#4ade80", fontSize: "13px" }}>✅</span>
                  <code style={{ color: "#f472b6", fontSize: "12px" }}>{f.file}</code>
                </div>
                <span style={{ color: "#7c85a2", fontSize: "12px" }}>{f.count} tests</span>
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {f.patterns.map(p => (
                  <span key={p} style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "4px", background: "#12121c", color: "#7c85a2" }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live components under test */}
      <div className="section">
        <h3>Live Components Under Test</h3>
        <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
          These are the actual components being tested — explore them here:
        </p>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          <button className={`btn ${showCounter ? "btn-primary" : "btn-ghost"}`} onClick={() => setShowCounter(s => !s)}>
            Counter
          </button>
          <button className={`btn ${showForm ? "btn-primary" : "btn-ghost"}`} onClick={() => setShowForm(s => !s)}>
            Login Form
          </button>
          <button className={`btn ${showUserList ? "btn-primary" : "btn-ghost"}`} onClick={() => setShowUserList(s => !s)}>
            User List (API)
          </button>
        </div>

        {showCounter && (
          <div style={{ background: "#1e1e2e", border: "1px solid #2d2d44", borderRadius: "10px", padding: "16px", marginBottom: "12px" }}>
            <p style={{ fontSize: "12px", color: "#7c85a2", marginBottom: "10px" }}>
              components/Counter.tsx — tested in 01_rendering + 02_interaction
            </p>
            <Counter initialValue={0} step={1} onCountChange={n => console.log("count:", n)} />
          </div>
        )}

        {showForm && (
          <div style={{ background: "#1e1e2e", border: "1px solid #2d2d44", borderRadius: "10px", padding: "16px", marginBottom: "12px" }}>
            <p style={{ fontSize: "12px", color: "#7c85a2", marginBottom: "10px" }}>
              components/LoginForm.tsx — tested in 04_forms
            </p>
            <LoginForm onSubmit={async (data) => { alert(JSON.stringify(data)); }} />
          </div>
        )}

        {showUserList && (
          <div style={{ background: "#1e1e2e", border: "1px solid #2d2d44", borderRadius: "10px", padding: "16px", marginBottom: "12px" }}>
            <p style={{ fontSize: "12px", color: "#7c85a2", marginBottom: "10px" }}>
              components/UserList.tsx — tested in 03_async (with mocked fetch)
            </p>
            <UserList />
          </div>
        )}
      </div>
    </div>
  );
};
