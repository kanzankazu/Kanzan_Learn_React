// =============================================================
// Phase 0 — 02: Functional Components
// =============================================================
// A React component is simply a JavaScript function that:
//   1. Accepts a single "props" object argument
//   2. Returns JSX (or null to render nothing)
//
// NAMING RULE: Component names MUST start with a capital letter.
//   - <myComponent /> -> React treats this as a DOM element (error!)
//   - <MyComponent />  -> React treats this as a component (correct)
//
// Two syntax forms (both valid):
//   function Greeting() { return <h1>Hi</h1>; }   // declaration
//   const Greeting = () => <h1>Hi</h1>;            // arrow function
//
// Android/Compose analogy:
//   @Composable fun Greeting() { Text("Hi") }
//   ~ const Greeting = () => <h1>Hi</h1>
//
// Key concepts covered:
// - Function declaration vs arrow function component
// - React.Fragment (<> </>) — avoid extra DOM wrappers
// - Composition: Atom -> Molecule -> Organism pattern
// - The children prop — slot content from parent
// =============================================================

import React from "react";
import { makeFakeUsers, makeFakeUser } from "../lib/fake-data";

// Generate fake data once at module level — stable across re-renders
const demoUser = makeFakeUser();
const demoUsers = makeFakeUsers(4);

// ─────────────────────────────────────────────────────────────
// SECTION 1: Two ways to define a component
// ─────────────────────────────────────────────────────────────

// Option A: Function declaration — hoisted, can be called before definition
function Greeting() {
  return <h3 style={{ color: "#a5b4fc" }}>Hello from function declaration!</h3>;
}

// Option B: Arrow function — more common in modern codebases
// The parentheses () allow multiline JSX with implicit return
const Farewell = () => (
  <h3 style={{ color: "#c4b5fd" }}>Goodbye from arrow function!</h3>
);

// ─────────────────────────────────────────────────────────────
// Fragment: avoid unnecessary DOM wrapper divs
// ─────────────────────────────────────────────────────────────
// Problem: React requires a single root element, but wrapping
// everything in a <div> pollutes the DOM and can break CSS layouts.
//
// Solution: React.Fragment (shorthand: <> </>) — a virtual wrapper
// that groups elements without creating a real DOM node.
//
// Android/Compose: similar to just stacking Composables without Column/Box

const UserInfo = () => (
  // <> </> is shorthand for <React.Fragment> </React.Fragment>
  // No extra DOM node is created — just the two <p> elements
  <>
    <p style={{ fontWeight: 600 }}>{demoUser.name}</p>
    <p style={{ color: "#7c85a2", fontSize: "13px" }}>{demoUser.jobTitle}</p>
  </>
);

// ─────────────────────────────────────────────────────────────
// SECTION 2: Composition — Atomic Design Pattern
// ─────────────────────────────────────────────────────────────
// Break complex UIs into small, reusable pieces:
//
//   Atom     → smallest unit, no dependencies on other components
//   Molecule → combines 2+ atoms
//   Organism → combines molecules to form a complete UI section
//
// Android/Compose analogy:
//   Atom     ≈ Text(), Icon(), Box()
//   Molecule ≈ ListItem composable combining Avatar + Text
//   Organism ≈ LazyColumn rendering multiple ListItems

// ATOM: A single colored dot — no dependencies
const StatusDot = ({ online }: { online: boolean }) => (
  <span style={{
    display: "inline-block",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    // Conditional style: green if online, gray if offline
    background: online ? "#4ade80" : "#6b7280",
    marginRight: "6px",
  }} />
);

// MOLECULE: Combines StatusDot + text into a user row
// Note: inline type annotation { name: string; online: boolean }
// is fine for simple one-off props — no need for a full interface
const UserRow = ({ name, online }: { name: string; online: boolean }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #2d2d44",
  }}>
    {/* Reuse the atom — passing data down via props */}
    <StatusDot online={online} />
    <span>{name}</span>
    {/* marginLeft: "auto" pushes this element to the far right (CSS flexbox trick) */}
    <span style={{ marginLeft: "auto", fontSize: "12px", color: "#7c85a2" }}>
      {online ? "Online" : "Offline"}
    </span>
  </div>
);

// ORGANISM: Renders a list of UserRow molecules
// Note: hard-coded data here is fine for learning demos
const UserListDemo = () => {
  // Use faker-generated users — each has a random online status
  const users = demoUsers.map((u) => ({ name: u.name, online: u.online }));

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
        Composition chain:{" "}
        <code style={{ color: "#f472b6" }}>UserListDemo</code> →{" "}
        <code style={{ color: "#f472b6" }}>UserRow</code> →{" "}
        <code style={{ color: "#f472b6" }}>StatusDot</code>
      </p>
      {/* Map each user object to a UserRow component */}
      {users.map((u) => (
        // key uses name here — safe because names in this list are unique
        <UserRow key={u.name} name={u.name} online={u.online} />
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// SECTION 3: The children prop — slot content
// ─────────────────────────────────────────────────────────────
// "children" is a special prop that holds whatever you put between
// the opening and closing tags of a component.
//
// This is React's equivalent of:
//   - Android: FrameLayout / slot in Compose (content: @Composable () -> Unit)
//   - Web: <slot> in Web Components
//
// Type: React.ReactNode — accepts any renderable content:
//   string, number, JSX element, array of elements, null, undefined

// The Card component acts as a "shell" — it provides structure
// but doesn't know what content will go inside
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="card" style={{ marginBottom: "12px" }}>
    {/* This part is controlled by the Card itself */}
    <p style={{ color: "#a5b4fc", fontWeight: 600, marginBottom: "10px" }}>{title}</p>
    {/* This part is injected by the parent — the "slot" */}
    {children}
  </div>
);

const ChildrenDemo = () => (
  <div>
    {/* Usage: anything between <Card>...</Card> becomes "children" inside */}
    <Card title="Card with children prop">
      <p>This content is passed as the children prop.</p>
      <p style={{ color: "#7c85a2", fontSize: "13px", marginTop: "4px" }}>
        Equivalent to <code style={{ color: "#f472b6" }}>content</code> slot in Jetpack Compose.
      </p>
    </Card>

    <Card title="Another Card">
      {/* children can be any valid JSX — including a mapped list */}
      <ul style={{ listStyle: "none" }}>
        {["Item A", "Item B", "Item C"].map((item) => (
          <li key={item} style={{ padding: "4px 0", color: "#94a3b8" }}>→ {item}</li>
        ))}
      </ul>
    </Card>
  </div>
);

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const FunctionalComponent = () => (
  <div>
    <div className="section">
      <h3>1. Component Syntax Forms</h3>
      <div className="demo-box">
        {/* Both forms render identically — choose based on project convention */}
        <Greeting />
        <Farewell />
        <div style={{ marginTop: "12px", padding: "12px", background: "#12121c", borderRadius: "8px" }}>
          {/* Fragment: renders two <p> elements with no wrapper div */}
          <UserInfo />
        </div>
      </div>
    </div>

    <div className="section">
      <h3>2. Composition — Atom → Molecule → Organism</h3>
      <UserListDemo />
    </div>

    <div className="section">
      <h3>3. The children Prop (Content Slot)</h3>
      <ChildrenDemo />
    </div>
  </div>
);
