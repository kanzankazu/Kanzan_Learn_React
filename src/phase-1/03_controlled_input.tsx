// =============================================================
// Phase 1 — 03: Controlled vs Uncontrolled Inputs
// =============================================================
// Controlled Input:
//   React owns the value. The input's value is always in sync
//   with React state. You control what the user sees.
//   Pattern: value={state} + onChange={e => setState(e.target.value)}
//
// Uncontrolled Input:
//   The DOM owns the value. React reads it via a ref when needed
//   (e.g., on form submit). Less code but less control.
//   Pattern: ref={inputRef} + defaultValue="initial"
//
// When to use which:
//   Controlled  → most cases: validation, derived state, format-on-type
//   Uncontrolled → file inputs (always), simple one-shot forms
//
// Android/Compose analogy:
//   Controlled   ~ TextField(value, onValueChange)
//   Uncontrolled ~ EditText with TextWatcher (not recommended in Compose)
// =============================================================

import { useState, useRef } from "react";
import { makeFakeUser } from "../lib/fake-data";

const fakeUser = makeFakeUser();

const inputStyle = {
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid #2d2d44",
  background: "#12121c",
  color: "#e2e8f0",
  fontSize: "14px",
  width: "100%",
} as const;

// ─────────────────────────────────────────────────────────────
// DEMO 1: Controlled input — React owns the value
// ─────────────────────────────────────────────────────────────

const ControlledDemo = () => {
  const [value, setValue] = useState("");

  // Derived state: computed from the controlled value without extra useState
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const isOverLimit = charCount > 100;

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        React controls the value — you can derive data from it in real time:
      </p>
      <textarea
        style={{
          ...inputStyle,
          resize: "vertical",
          minHeight: "80px",
          borderColor: isOverLimit ? "#ef4444" : "#2d2d44",
        }}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={`Write something about ${fakeUser.name}...`}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "12px" }}>
        <span style={{ color: "#7c85a2" }}>{wordCount} words</span>
        <span style={{ color: isOverLimit ? "#ef4444" : "#7c85a2" }}>
          {charCount} / 100 chars {isOverLimit && "⚠️ Over limit"}
        </span>
      </div>

      {/* Force uppercase on type — only possible with controlled input */}
      <p style={{ color: "#7c85a2", fontSize: "12px", marginTop: "12px", marginBottom: "4px" }}>
        Force uppercase pattern:
      </p>
      <UpperCaseInput />
    </div>
  );
};

// Sub-demo: transform value on every keystroke
const UpperCaseInput = () => {
  const [value, setValue] = useState("");
  return (
    <input
      style={inputStyle}
      value={value}
      // Transform before storing: user types lowercase, we store uppercase
      onChange={e => setValue(e.target.value.toUpperCase())}
      placeholder="Type anything — it becomes uppercase"
    />
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 2: Uncontrolled input — DOM owns the value
// ─────────────────────────────────────────────────────────────

const UncontrolledDemo = () => {
  // useRef holds a reference to the DOM element — no re-render when changed
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState<{ name: string; email: string } | null>(null);

  const handleSubmit = () => {
    // Read DOM value only when needed (on submit)
    // Optional chaining ?. handles the case where ref hasn't mounted yet
    const name = nameRef.current?.value ?? "";
    const email = emailRef.current?.value ?? "";
    if (name && email) {
      setSubmitted({ name, email });
    }
  };

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        DOM controls the value — React reads it via ref only on submit:
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* defaultValue sets initial value without React controlling it */}
        <input ref={nameRef} style={inputStyle} type="text" defaultValue={fakeUser.name} placeholder="Name" />
        <input ref={emailRef} style={inputStyle} type="email" defaultValue={fakeUser.email} placeholder="Email" />
        <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
      </div>
      {submitted && (
        <div className="code-hint" style={{ marginTop: "12px" }}>
          {`Submitted: ${JSON.stringify(submitted, null, 2)}`}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 3: Controlled form with validation
// ─────────────────────────────────────────────────────────────

const ValidatedFormDemo = () => {
  const [fields, setFields] = useState({ username: "", password: "" });
  const [touched, setTouched] = useState({ username: false, password: false });

  const errors = {
    username: fields.username.length < 3 ? "Min 3 characters" : "",
    password: fields.password.length < 8 ? "Min 8 characters" : "",
  };

  const isValid = !errors.username && !errors.password;

  const update = (field: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields(prev => ({ ...prev, [field]: e.target.value }));

  const markTouched = (field: keyof typeof touched) => () =>
    setTouched(prev => ({ ...prev, [field]: true }));

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        Controlled form with live validation (errors show after blur):
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div>
          <input
            style={{ ...inputStyle, borderColor: touched.username && errors.username ? "#ef4444" : "#2d2d44" }}
            value={fields.username}
            onChange={update("username")}
            onBlur={markTouched("username")} // mark as touched when user leaves field
            placeholder="Username"
          />
          {touched.username && errors.username && (
            <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>⚠️ {errors.username}</p>
          )}
        </div>
        <div>
          <input
            style={{ ...inputStyle, borderColor: touched.password && errors.password ? "#ef4444" : "#2d2d44" }}
            type="password"
            value={fields.password}
            onChange={update("password")}
            onBlur={markTouched("password")}
            placeholder="Password"
          />
          {touched.password && errors.password && (
            <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>⚠️ {errors.password}</p>
          )}
        </div>
        <button
          className="btn btn-primary"
          disabled={!isValid}
          style={{ opacity: isValid ? 1 : 0.5 }}
          onClick={() => alert("Form submitted!")}
        >
          {isValid ? "Submit" : "Fix errors first"}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const ControlledInput = () => (
  <div>
    <div className="section">
      <h3>1. Controlled Input — React Owns the Value</h3>
      <ControlledDemo />
    </div>
    <div className="section">
      <h3>2. Uncontrolled Input — DOM Owns the Value</h3>
      <UncontrolledDemo />
    </div>
    <div className="section">
      <h3>3. Controlled Form with Validation</h3>
      <ValidatedFormDemo />
    </div>
  </div>
);
