// =============================================================
// Phase 9 — 02: Testing Patterns
// =============================================================
// Five key testing patterns covered in the test files:
//
// 1. RENDERING tests — does the component render correctly?
// 2. INTERACTION tests — does user action produce correct outcome?
// 3. ASYNC tests — loading states, API calls, timers
// 4. FORM tests — validation, submission, error messages
// 5. HOOK tests — renderHook, act for custom hook testing
//
// Testing pyramid for React:
//   Unit tests (hooks, utils)     → fast, many
//   Component tests (RTL)         → medium, most common
//   Integration tests (full flows)→ slower, fewer
//   E2E tests (Playwright/Cypress) → slowest, fewest
//
// Key matchers from @testing-library/jest-dom:
//   toBeInTheDocument()   — element exists in DOM
//   toBeVisible()         — element is visible
//   toBeDisabled()        — input/button is disabled
//   toHaveTextContent()   — element contains text
//   toHaveValue()         — input has specific value
//   toHaveClass()         — element has CSS class
// =============================================================

export const TestingPatterns = () => (
  <div>
    <div className="section">
      <h3>Pattern Overview</h3>
      <div className="demo-box">
        <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
          All 5 patterns have corresponding test files in <code style={{ color: "#f472b6" }}>__tests__/</code>:
        </p>
        {[
          { file: "01_rendering.test.tsx",    desc: "render(), screen queries, conditional rendering" },
          { file: "02_interaction.test.tsx",  desc: "userEvent.click/type, state changes, callbacks" },
          { file: "03_async.test.tsx",        desc: "waitFor, findBy, mock fetch, timers" },
          { file: "04_forms.test.tsx",        desc: "fill form, submit, validation errors" },
          { file: "05_hooks.test.tsx",        desc: "renderHook, act, custom hook testing" },
        ].map(item => (
          <div key={item.file} style={{ display: "flex", gap: "12px", padding: "8px 10px", background: "#12121c", borderRadius: "6px", marginBottom: "6px" }}>
            <code style={{ color: "#f472b6", minWidth: "220px", fontSize: "12px" }}>{item.file}</code>
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>{item.desc}</span>
          </div>
        ))}
      </div>

      <div className="demo-box" style={{ marginTop: "12px" }}>
        <p style={{ color: "#a5b4fc", fontWeight: 600, marginBottom: "8px", fontSize: "13px" }}>
          What NOT to test
        </p>
        <div className="code-hint">{`// ❌ Don't test implementation details
expect(component.state.count).toBe(1);        // internal state
expect(mockSetState).toHaveBeenCalledWith(1);  // setter called

// ✅ Test observable behavior
expect(screen.getByText("1")).toBeInTheDocument(); // what user sees

// ❌ Don't test third-party libraries
expect(useState).toHaveBeenCalled();  // testing React itself

// ✅ Test your component's contract
render(<Counter />);
await user.click(screen.getByRole("button", { name: "+" }));
expect(screen.getByRole("status")).toHaveTextContent("1");`}</div>
      </div>
    </div>
  </div>
);
