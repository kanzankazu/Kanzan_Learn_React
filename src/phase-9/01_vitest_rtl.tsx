// =============================================================
// Phase 9 — 01: Vitest + React Testing Library
// =============================================================
// Testing philosophy: test BEHAVIOR, not implementation.
// Ask: "What does a user see and do?" — not "What function was called?"
//
// React Testing Library (RTL) principles:
//   - Query elements the way users find them: by role, text, label
//   - Avoid testing internal state/refs/implementation details
//   - Prefer user-event over fireEvent for realistic interactions
//
// Test file naming:
//   Button.test.tsx  OR  Button.spec.tsx  (co-located with component)
//   __tests__/Button.test.tsx             (separate folder)
//
// Key RTL queries (in priority order):
//   getByRole()       → button, heading, textbox, checkbox... (ARIA semantic)
//   getByLabelText()  → form inputs connected to a <label>
//   getByPlaceholderText() → placeholder text
//   getByText()       → visible text content
//   getByTestId()     → data-testid attribute (last resort)
//
// Query variants:
//   getBy*   → throws if not found (good for assertions)
//   queryBy* → returns null if not found (good for "not present" checks)
//   findBy*  → async, waits for element to appear
//
// install (devDependencies):
//   vitest @testing-library/react @testing-library/jest-dom
//   @testing-library/user-event jsdom
// =============================================================

// This file is the LEARNING GUIDE for testing concepts.
// The actual tests live in src/phase-9/__tests__/
// Run tests with: npm test

export const VitestRTL = () => (
  <div>
    <div className="section">
      <h3>Setup & Concepts</h3>
      <div className="demo-box">
        <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
          Tests are in <code style={{ color: "#f472b6" }}>src/phase-9/__tests__/</code>.
          Run them with:
        </p>
        <div className="code-hint">{`# Run all tests once
npm test

# Run in watch mode (re-runs on file change)
npm run test:watch

# Run a specific file
npx vitest run src/phase-9/__tests__/01_rendering.test.tsx`}</div>
      </div>

      <div className="demo-box" style={{ marginTop: "12px" }}>
        <p style={{ color: "#a5b4fc", fontWeight: 600, marginBottom: "8px", fontSize: "13px" }}>
          RTL Query Priority
        </p>
        <div className="code-hint">{`// 1. ✅ By role (most preferred — tests accessibility too)
screen.getByRole("button", { name: /submit/i })
screen.getByRole("heading", { level: 1 })
screen.getByRole("textbox", { name: /email/i })

// 2. ✅ By label text (form inputs)
screen.getByLabelText(/email address/i)

// 3. ✅ By visible text
screen.getByText(/hello world/i)

// 4. ✅ By placeholder
screen.getByPlaceholderText(/search.../i)

// 5. ⚠️ By test ID (last resort — implementation detail)
screen.getByTestId("submit-button")

// Query variants:
getByRole(...)   // throws if not found
queryByRole(...) // returns null (use for "should NOT exist" assertions)
findByRole(...)  // async — waits up to 1000ms for element to appear`}</div>
      </div>

      <div className="demo-box" style={{ marginTop: "12px" }}>
        <p style={{ color: "#a5b4fc", fontWeight: 600, marginBottom: "8px", fontSize: "13px" }}>
          Test Structure (AAA Pattern)
        </p>
        <div className="code-hint">{`describe("ComponentName", () => {
  it("does something specific", async () => {
    // ARRANGE: set up the component and data
    const user = userEvent.setup();
    render(<Counter initialValue={5} />);

    // ACT: perform user interactions
    await user.click(screen.getByRole("button", { name: "+" }));

    // ASSERT: verify the expected outcome
    expect(screen.getByText("6")).toBeInTheDocument();
  });
});`}</div>
      </div>
    </div>
  </div>
);
