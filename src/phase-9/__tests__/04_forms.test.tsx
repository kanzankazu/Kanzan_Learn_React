// =============================================================
// Test Pattern 4: Form Tests
// =============================================================
// Forms are one of the most important things to test.
// Focus on: filling fields, submitting, validation errors.
// =============================================================

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../components/LoginForm";

describe("LoginForm", () => {
  const user = userEvent.setup();

  // ── Rendering ──────────────────────────────────────────────

  it("renders email and password fields", () => {
    render(<LoginForm onSubmit={() => {}} />);
    // getByLabelText: queries by <label> text — best for form fields
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("email field accepts text input", () => {
    render(<LoginForm onSubmit={() => {}} />);
    // Using type="text" so custom JS validation controls all behavior (not browser HTML5)
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "text");
  });

  it("password field has type password", () => {
    render(<LoginForm onSubmit={() => {}} />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  // ── Happy path ─────────────────────────────────────────────

  it("calls onSubmit with entered values on valid submission", async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    render(<LoginForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText("Email"), "alice@test.com");
    await user.type(screen.getByLabelText("Password"), "securepassword");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: "alice@test.com",
        password: "securepassword",
      });
    });
  });

  // ── Validation ─────────────────────────────────────────────

  it("shows required errors when submitted empty", async () => {
    render(<LoginForm onSubmit={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Login" }));

    // getAllByRole("alert"): multiple error messages
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(2);
    expect(alerts[0]).toHaveTextContent("Email is required");
    expect(alerts[1]).toHaveTextContent("Password is required");
  });

  it("shows invalid email error for bad email format", async () => {
    render(<LoginForm onSubmit={() => {}} />);

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email");
  });

  it("shows password min length error for short password", async () => {
    render(<LoginForm onSubmit={() => {}} />);

    await user.type(screen.getByLabelText("Email"), "alice@test.com");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Min 8 characters");
  });

  it("does NOT call onSubmit when validation fails", async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);
    await user.click(screen.getByRole("button", { name: "Login" }));
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  // ── Loading state ──────────────────────────────────────────

  it("shows loading state while submitting", async () => {
    // Simulate a slow API
    const slowSubmit = vi.fn(() => new Promise<void>(() => {}));
    render(<LoginForm onSubmit={slowSubmit} />);

    await user.type(screen.getByLabelText("Email"), "alice@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByRole("button")).toHaveTextContent("Logging in...");
    expect(screen.getByRole("button")).toBeDisabled();
  });

  // ── Accessibility ──────────────────────────────────────────

  it("marks invalid fields with aria-invalid", async () => {
    render(<LoginForm onSubmit={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Password")).toHaveAttribute("aria-invalid", "true");
  });
});
