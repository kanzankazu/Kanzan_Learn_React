// =============================================================
// Test Pattern 1: Rendering Tests
// =============================================================
// Tests that verify components render correctly given different props.
// Focus: what is visible in the DOM?
// =============================================================

import { render, screen } from "@testing-library/react";
import { Counter } from "../components/Counter";

describe("Counter — rendering", () => {
  it("renders with default initial value of 0", () => {
    render(<Counter />);
    // getByRole: queries by ARIA role — most accessible query method
    expect(screen.getByRole("status")).toHaveTextContent("Count: 0");
  });

  it("renders with a custom initial value", () => {
    render(<Counter initialValue={42} />);
    expect(screen.getByRole("status")).toHaveTextContent("Count: 42");
  });

  it("renders all three buttons", () => {
    render(<Counter />);
    // getByRole with name option: matches button by its accessible name (text content)
    expect(screen.getByRole("button", { name: "Increment" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Decrement" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset"     })).toBeInTheDocument();
  });

  it("all buttons are enabled by default", () => {
    render(<Counter />);
    // not.toBeDisabled() — verify buttons are clickable
    expect(screen.getByRole("button", { name: "Increment" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Decrement" })).not.toBeDisabled();
  });
});

// ─────────────────────────────────────────────────────────────
// Conditional rendering test
// ─────────────────────────────────────────────────────────────

const Greeting = ({ name, isLoggedIn }: { name?: string; isLoggedIn: boolean }) => (
  <div>
    {isLoggedIn ? (
      <h1>Welcome back, {name ?? "User"}!</h1>
    ) : (
      <p>Please log in.</p>
    )}
  </div>
);

describe("Greeting — conditional rendering", () => {
  it("shows welcome message when logged in", () => {
    render(<Greeting name="Alice" isLoggedIn />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Welcome back, Alice!");
    // queryByText: returns null instead of throwing — use for "should not exist"
    expect(screen.queryByText("Please log in.")).not.toBeInTheDocument();
  });

  it("shows login prompt when not logged in", () => {
    render(<Greeting isLoggedIn={false} />);
    expect(screen.getByText("Please log in.")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("uses default name when name not provided", () => {
    render(<Greeting isLoggedIn />);
    expect(screen.getByRole("heading")).toHaveTextContent("Welcome back, User!");
  });
});

// ─────────────────────────────────────────────────────────────
// List rendering test
// ─────────────────────────────────────────────────────────────

const SkillList = ({ skills }: { skills: string[] }) => (
  skills.length === 0
    ? <p>No skills listed.</p>
    : <ul aria-label="Skills">
        {skills.map(s => <li key={s}>{s}</li>)}
      </ul>
);

describe("SkillList — list rendering", () => {
  it("renders the correct number of items", () => {
    render(<SkillList skills={["React", "TypeScript", "Kotlin"]} />);
    // getAllByRole: returns all matching elements
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("renders each skill name", () => {
    render(<SkillList skills={["React", "TypeScript"]} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("shows empty message when no skills", () => {
    render(<SkillList skills={[]} />);
    expect(screen.getByText("No skills listed.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
