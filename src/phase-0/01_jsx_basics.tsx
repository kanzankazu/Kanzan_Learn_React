// =============================================================
// Phase 0 — 01: JSX Basics
// =============================================================
// JSX (JavaScript XML) is a syntax extension that looks like HTML
// but is actually syntactic sugar for React.createElement() calls.
//
// Under the hood, this JSX:
//   const el = <h1 className="title">Hello!</h1>;
//
// Gets compiled by Babel/TypeScript into:
//   const el = React.createElement("h1", { className: "title" }, "Hello!");
//
// KEY RULES to remember:
// 1. Must have ONE root element — wrap siblings in <> </> Fragment
// 2. Use camelCase attributes: className (not class), htmlFor (not for)
// 3. JavaScript expressions go inside { } curly braces
// 4. Self-closing tags MUST be closed: <img />, <input />, <br />
// 5. Inline styles are JavaScript objects, not CSS strings
// 6. JSX comments use {/* comment */} syntax (not // inside JSX)
//
// Android/Compose analogy:
//   JSX        ~ Composable function body
//   className  ~ Modifier.padding().background()...
//   {expr}     ~ ${variable} in Kotlin string templates
// =============================================================

// ─────────────────────────────────────────────────────────────
// SECTION 1: JavaScript Expressions inside JSX
// ─────────────────────────────────────────────────────────────
// Anything between { } is evaluated as a JavaScript expression.
// You can embed: variables, math, ternary, function calls, etc.
// You CANNOT use statements like if/for directly — use expressions instead.

import { makeFakeUser } from "../lib/fake-data";

// Generate one fake user for demo data — no real personal info
const demoUser = makeFakeUser();

const ExpressionDemo = () => {
  // Using faker-generated data instead of hard-coded real names
  const name = demoUser.name;
  const isLoggedIn = demoUser.online;
  const score = 42;

  return (
    <div className="demo-box">
      {/* Variable interpolation — same concept as $name in Kotlin string templates */}
      <p>Hello, <strong>{name}</strong>!</p>

      {/* Math expression — evaluated at render time */}
      <p>2 + 2 = {2 + 2}</p>

      {/* Any JS expression: method calls, arithmetic */}
      <p>Score doubled: {score * 2}</p>

      {/* Ternary operator for inline conditional text */}
      <p>Status: {isLoggedIn ? "🟢 Online" : "🔴 Offline"}</p>

      {/*
       * Short-circuit (&&) operator:
       * If left side is true  → renders the right side
       * If left side is false → renders nothing (null)
       * Use this when you only need to show OR hide, not swap content
       */}
      {isLoggedIn && <p style={{ color: "#4ade80" }}>Welcome back!</p>}

      {/*
       * Inline style: first {} = JS expression, second {} = JS object literal
       * Property names use camelCase (fontSize, not font-size)
       * Values are strings or numbers (unitless numbers = px for most props)
       */}
      <p style={{ color: "#a78bfa", fontSize: "13px", marginTop: "8px" }}>
        Colored text via inline style object
      </p>

      {/* Code hint: shows what JSX compiles to */}
      <div className="code-hint">{`// This JSX:
<p>Hello, <strong>{name}</strong>!</p>

// Compiles to:
React.createElement("p", null,
  "Hello, ",
  React.createElement("strong", null, name)
)`}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// SECTION 2: Rendering Lists
// ─────────────────────────────────────────────────────────────
// In JSX, you render lists by mapping an array to JSX elements.
// React requires a unique "key" prop on each list item so it can
// efficiently update only the changed items (virtual DOM diffing).
//
// KEY RULES:
// - key must be unique among siblings (not globally)
// - key should be stable (don't use array index if list can reorder)
// - key is NOT passed as a prop to the component itself
//
// Android analogy: key ≈ the stable ID in RecyclerView's DiffUtil

const ListDemo = () => {
  const skills = ["Kotlin", "Jetpack Compose", "React", "TypeScript", "Firebase"];

  return (
    <div className="demo-box">
      <p style={{ marginBottom: "12px", color: "#94a3b8", fontSize: "13px" }}>
        List rendering — each item needs a unique <code style={{ color: "#f472b6" }}>key</code> prop:
      </p>

      <ul style={{ listStyle: "none", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {skills.map((skill) => (
          // key = React's internal identifier for efficient re-rendering
          // Using the skill name itself is safe here since names are unique
          <li key={skill} className="badge badge-purple">
            {skill}
          </li>
        ))}
      </ul>

      <div className="code-hint">{`// Array.map() returns an array of JSX elements
skills.map((skill) => (
  <li key={skill}>{skill}</li>
))

// ❌ Avoid using index as key when list items can be reordered/filtered
skills.map((skill, index) => <li key={index}>{skill}</li>)`}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// SECTION 3: Conditional Rendering Patterns
// ─────────────────────────────────────────────────────────────
// React has multiple patterns for conditional rendering.
// Since JSX only accepts expressions (not statements), we use:
//   1. Ternary operator   →  condition ? A : B
//   2. AND operator       →  condition && <Component />
//   3. IIFE with switch   →  for multi-branch logic
//   4. Early return       →  return null to render nothing
//
// Android/Compose analogy:
//   if (show) { Text("hello") }  ≈  {show && <p>hello</p>}

const ConditionalDemo = () => {
  // Declared as const with union type so TypeScript knows all 3 switch branches are valid.
  // In a real app this would come from state or props — here we fix to "success" for demo.
  const status = "success" as "loading" | "error" | "success";
  const cartCount = 3;

  return (
    <div className="demo-box">
      {/* Pattern 1: Ternary — show one of two options */}
      <p>
        Ternary:{" "}
        {status === "success"
          ? <span style={{ color: "#4ade80" }}>✅ Success</span>
          : <span style={{ color: "#f87171" }}>❌ Failed</span>
        }
      </p>

      {/*
       * Pattern 2: AND (&&) operator — show or hide
       * Be careful: if cartCount is 0 (falsy number), React renders "0"!
       * Safe fix: use cartCount > 0 && ... instead of cartCount && ...
       */}
      {cartCount > 0 && (
        <p style={{ marginTop: "8px" }}>
          🛒 You have <strong>{cartCount}</strong> items in cart
        </p>
      )}

      {/*
       * Pattern 3: IIFE (Immediately Invoked Function Expression)
       * Useful when you need a switch/if-else with multiple branches
       * Wrap in (() => { ... })() to execute inline
       */}
      <p style={{ marginTop: "8px" }}>
        Status:{" "}
        {(() => {
          switch (status) {
            case "loading": return <span>⏳ Loading...</span>;
            case "error":   return <span style={{ color: "#f87171" }}>❌ Error</span>;
            case "success": return <span style={{ color: "#4ade80" }}>✅ Success</span>;
          }
        })()}
      </p>

      <div className="code-hint">{`// Pattern 4: Early return (return null = renders nothing)
const Spinner = ({ show }: { show: boolean }) => {
  if (!show) return null; // renders nothing
  return <div className="spinner" />;
};`}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT — Page component that renders all sections
// ─────────────────────────────────────────────────────────────
export const JsxBasics = () => (
  <div>
    <div className="section">
      <h3>1. JavaScript Expressions in JSX</h3>
      <ExpressionDemo />
    </div>

    <div className="section">
      <h3>2. Rendering Lists</h3>
      <ListDemo />
    </div>

    <div className="section">
      <h3>3. Conditional Rendering Patterns</h3>
      <ConditionalDemo />
    </div>
  </div>
);
