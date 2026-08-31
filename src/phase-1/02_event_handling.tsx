// =============================================================
// Phase 1 — 02: Event Handling
// =============================================================
// React event handlers are similar to DOM events but with key differences:
// - Use camelCase: onClick, onChange, onSubmit (not onclick, onchange)
// - Pass a FUNCTION REFERENCE, not a function call:
//     onClick={handleClick}   ✅
//     onClick={handleClick()} ❌ — this calls it immediately on render!
// - React wraps native events in a SyntheticEvent for cross-browser compat
//
// TypeScript event types to know:
//   React.MouseEvent<HTMLButtonElement>
//   React.ChangeEvent<HTMLInputElement>
//   React.FormEvent<HTMLFormElement>
//   React.KeyboardEvent<HTMLInputElement>
//   React.FocusEvent<HTMLInputElement>
//   React.DragEvent<HTMLDivElement>
//
// Android/Compose analogy:
//   Button(onClick = { ... })   ~ <button onClick={() => ...}>
//   TextField(onValueChange = { }) ~ <input onChange={e => ...}>
// =============================================================

import { useState } from "react";
import { makeFakeUser } from "../lib/fake-data";

const fakeUser = makeFakeUser();

// ─────────────────────────────────────────────────────────────
// DEMO 1: Mouse events
// ─────────────────────────────────────────────────────────────

const MouseEventsDemo = () => {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) =>
    setLog(prev => [msg, ...prev].slice(0, 5)); // keep last 5

  // Explicit TypeScript typing for the event parameter
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    addLog(`click at (${e.clientX}, ${e.clientY})`);
  };

  const handleDoubleClick = () => addLog("double-click!");
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent browser context menu
    addLog("right-click (context menu prevented)");
  };

  return (
    <div className="demo-box">
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={handleClick}>Click me</button>
        <button className="btn btn-ghost" onDoubleClick={handleDoubleClick}>Double-click me</button>
        <button className="btn btn-ghost" onContextMenu={handleRightClick}>Right-click me</button>
      </div>
      <div style={{ fontSize: "12px", color: "#7c85a2" }}>
        {log.length === 0
          ? <span>Events will appear here...</span>
          : log.map((entry, i) => <div key={i}>→ {entry}</div>)
        }
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 2: Input / Change events
// ─────────────────────────────────────────────────────────────

const ChangeEventsDemo = () => {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);
  const [selected, setSelected] = useState("react");

  return (
    <div className="demo-box">
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Text input — e.target.value is the typed string */}
        <label style={{ fontSize: "13px", color: "#7c85a2" }}>
          Text input:
          <input
            style={{ display: "block", marginTop: "4px", padding: "8px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0", width: "100%" }}
            type="text"
            value={text}
            // e: React.ChangeEvent<HTMLInputElement> — has e.target.value
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
            placeholder={`Hello, ${fakeUser.name}...`}
          />
        </label>

        {/* Checkbox — e.target.checked is the boolean */}
        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#7c85a2", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChecked(e.target.checked)}
          />
          Checkbox: {checked ? "✅ Checked" : "⬜ Unchecked"}
        </label>

        {/* Select — e.target.value is the selected option string */}
        <label style={{ fontSize: "13px", color: "#7c85a2" }}>
          Select:
          <select
            style={{ display: "block", marginTop: "4px", padding: "8px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0", width: "100%" }}
            value={selected}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelected(e.target.value)}
          >
            <option value="react">React</option>
            <option value="vue">Vue</option>
            <option value="angular">Angular</option>
            <option value="svelte">Svelte</option>
          </select>
        </label>
      </div>

      <div className="code-hint" style={{ marginTop: "12px" }}>
        {`text: "${text}" | checked: ${checked} | selected: "${selected}"`}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 3: Keyboard events
// ─────────────────────────────────────────────────────────────

const KeyboardEventsDemo = () => {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState<string[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // e.key — the key name ("Enter", "Escape", "ArrowUp", etc.)
    // e.ctrlKey / e.shiftKey / e.altKey / e.metaKey — modifier keys
    if (e.key === "Enter" && value.trim()) {
      setSubmitted(prev => [...prev, value.trim()]);
      setValue("");
    }
    if (e.key === "Escape") {
      setValue("");
    }
  };

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        Press <kbd style={{ background: "#2d2d44", padding: "2px 6px", borderRadius: "4px" }}>Enter</kbd> to add,{" "}
        <kbd style={{ background: "#2d2d44", padding: "2px 6px", borderRadius: "4px" }}>Esc</kbd> to clear:
      </p>
      <input
        style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0" }}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type and press Enter..."
      />
      {submitted.length > 0 && (
        <ul style={{ listStyle: "none", marginTop: "8px" }}>
          {submitted.map((s, i) => (
            <li key={i} style={{ padding: "4px 0", color: "#a5b4fc", fontSize: "13px" }}>→ {s}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 4: Event with data — closure pattern
// ─────────────────────────────────────────────────────────────

const EventWithDataDemo = () => {
  const [selected, setSelected] = useState<string | null>(null);

  const people = [fakeUser.name, ...["Alice Smith", "Bob Jones", "Carol White"]];

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        Pass data to handler via closure — each button knows its own item:
      </p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {people.map(name => (
          <button
            key={name}
            // Closure: arrow function captures `name` from the map scope
            // This is how you pass item-specific data to a generic handler
            onClick={() => setSelected(name)}
            className={`btn ${selected === name ? "btn-primary" : "btn-ghost"}`}
          >
            {name}
          </button>
        ))}
      </div>
      {selected && (
        <p style={{ marginTop: "12px", color: "#4ade80" }}>
          Selected: <strong>{selected}</strong>
        </p>
      )}
      <div className="code-hint" style={{ marginTop: "12px" }}>{`// Closure pattern — arrow fn captures loop variable
items.map(item => (
  <button onClick={() => handleSelect(item)}>
    {item}
  </button>
))`}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const EventHandling = () => (
  <div>
    <div className="section">
      <h3>1. Mouse Events</h3>
      <MouseEventsDemo />
    </div>
    <div className="section">
      <h3>2. Change Events (input, checkbox, select)</h3>
      <ChangeEventsDemo />
    </div>
    <div className="section">
      <h3>3. Keyboard Events</h3>
      <KeyboardEventsDemo />
    </div>
    <div className="section">
      <h3>4. Event with Data — Closure Pattern</h3>
      <EventWithDataDemo />
    </div>
  </div>
);
