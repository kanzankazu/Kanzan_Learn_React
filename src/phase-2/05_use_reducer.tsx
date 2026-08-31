// =============================================================
// Phase 2 — 05: useReducer
// =============================================================
// useReducer is an alternative to useState for complex state logic.
//
// Signature:
//   const [state, dispatch] = useReducer(reducer, initialState)
//
// Reducer function:
//   (state, action) => newState
//   - Pure function: no side effects, same input = same output
//   - NEVER mutate state directly — always return a new object
//
// When to prefer useReducer over useState:
//   [x] Multiple related state values that update together
//   [x] Next state depends on previous state in complex ways
//   [x] State transitions have named actions (easier to debug/test)
//   [x] You want Redux-like state management locally
//
// Android/Compose analogy:
//   MVI pattern: Intent (action) -> Model (state) -> View (render)
//   ~ useReducer: dispatch(action) -> reducer -> new state -> re-render
// =============================================================

import { useReducer, useState } from "react";
import { faker } from "@faker-js/faker";

faker.seed(77);

// ─────────────────────────────────────────────────────────────
// DEMO 1: Counter with named actions
// ─────────────────────────────────────────────────────────────

interface CounterState { count: number; step: number; history: number[]; }

// Discriminated union for actions — each type has a specific payload shape
type CounterAction =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "SET_STEP"; payload: number }
  | { type: "RESET" };

// Reducer: pure function that computes next state from current state + action
function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case "INCREMENT":
      return {
        ...state,
        count: state.count + state.step,
        history: [...state.history, state.count + state.step].slice(-5),
      };
    case "DECREMENT":
      return {
        ...state,
        count: state.count - state.step,
        history: [...state.history, state.count - state.step].slice(-5),
      };
    case "SET_STEP":
      // payload carries the new step value
      return { ...state, step: action.payload };
    case "RESET":
      return { count: 0, step: state.step, history: [] };
  }
}

const CounterReducerDemo = () => {
  const [state, dispatch] = useReducer(counterReducer, { count: 0, step: 1, history: [] });

  return (
    <div className="demo-box">
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div style={{ fontSize: "48px", fontWeight: 800 }}>{state.count}</div>
        <div style={{ color: "#7c85a2", fontSize: "13px" }}>Step: {state.step}</div>
      </div>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "12px", flexWrap: "wrap" }}>
        <button className="btn btn-ghost" onClick={() => dispatch({ type: "DECREMENT" })}>− {state.step}</button>
        <button className="btn btn-primary" onClick={() => dispatch({ type: "INCREMENT" })}>+ {state.step}</button>
        <button className="btn btn-danger" onClick={() => dispatch({ type: "RESET" })}>Reset</button>
      </div>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        {[1, 5, 10].map(step => (
          <button
            key={step}
            className={`btn ${state.step === step ? "btn-primary" : "btn-ghost"}`}
            style={{ fontSize: "12px", padding: "4px 10px" }}
            onClick={() => dispatch({ type: "SET_STEP", payload: step })}
          >
            Step {step}
          </button>
        ))}
      </div>
      {state.history.length > 0 && (
        <div style={{ fontSize: "12px", color: "#7c85a2", textAlign: "center", marginTop: "10px" }}>
          History: {state.history.join(" → ")}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 2: Todo list — realistic multi-field state
// ─────────────────────────────────────────────────────────────

interface Todo { id: string; text: string; done: boolean; priority: "low" | "medium" | "high"; }
interface TodoState { todos: Todo[]; filter: "all" | "active" | "done"; }

type TodoAction =
  | { type: "ADD"; payload: { text: string; priority: Todo["priority"] } }
  | { type: "TOGGLE"; payload: string }   // payload = todo id
  | { type: "DELETE"; payload: string }
  | { type: "SET_FILTER"; payload: TodoState["filter"] }
  | { type: "CLEAR_DONE" };

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case "ADD":
      return {
        ...state,
        todos: [
          ...state.todos,
          { id: faker.string.uuid(), text: action.payload.text, done: false, priority: action.payload.priority },
        ],
      };
    case "TOGGLE":
      return {
        ...state,
        todos: state.todos.map(t => t.id === action.payload ? { ...t, done: !t.done } : t),
      };
    case "DELETE":
      return { ...state, todos: state.todos.filter(t => t.id !== action.payload) };
    case "SET_FILTER":
      return { ...state, filter: action.payload };
    case "CLEAR_DONE":
      return { ...state, todos: state.todos.filter(t => !t.done) };
  }
}

const PRIORITY_COLOR: Record<Todo["priority"], string> = {
  low: "#4ade80", medium: "#fbbf24", high: "#f87171",
};

const INITIAL_TODOS: Todo[] = [
  { id: "1", text: faker.hacker.phrase(), done: false, priority: "high" },
  { id: "2", text: faker.hacker.phrase(), done: true,  priority: "medium" },
  { id: "3", text: faker.hacker.phrase(), done: false, priority: "low" },
];

const TodoReducerDemo = () => {
  const [state, dispatch] = useReducer(todoReducer, { todos: INITIAL_TODOS, filter: "all" });
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Todo["priority"]>("medium");

  const visible = state.todos.filter(t =>
    state.filter === "all" ? true : state.filter === "active" ? !t.done : t.done
  );

  const add = () => {
    if (!input.trim()) return;
    dispatch({ type: "ADD", payload: { text: input.trim(), priority } });
    setInput("");
  };

  return (
    <div className="demo-box">
      {/* Add form */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
        <input
          style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0", fontSize: "13px" }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="Add a task..."
        />
        <select
          style={{ padding: "8px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0", fontSize: "13px" }}
          value={priority}
          onChange={e => setPriority(e.target.value as Todo["priority"])}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button className="btn btn-primary" style={{ fontSize: "13px" }} onClick={add}>Add</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
        {(["all", "active", "done"] as const).map(f => (
          <button
            key={f}
            className={`btn ${state.filter === f ? "btn-primary" : "btn-ghost"}`}
            style={{ fontSize: "12px", padding: "4px 10px", textTransform: "capitalize" }}
            onClick={() => dispatch({ type: "SET_FILTER", payload: f })}
          >
            {f}
          </button>
        ))}
        <button
          className="btn btn-danger"
          style={{ fontSize: "12px", padding: "4px 10px", marginLeft: "auto" }}
          onClick={() => dispatch({ type: "CLEAR_DONE" })}
        >
          Clear done
        </button>
      </div>

      {/* Todo list */}
      <ul style={{ listStyle: "none" }}>
        {visible.map(todo => (
          <li key={todo.id} style={{ display: "flex", gap: "8px", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #1a1a2e" }}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => dispatch({ type: "TOGGLE", payload: todo.id })}
            />
            <span style={{ flex: 1, textDecoration: todo.done ? "line-through" : "none", color: todo.done ? "#4a4a6a" : "#e2e8f0", fontSize: "13px" }}>
              {todo.text}
            </span>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: PRIORITY_COLOR[todo.priority], flexShrink: 0 }} />
            <button
              style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "14px" }}
              onClick={() => dispatch({ type: "DELETE", payload: todo.id })}
            >
              ✕
            </button>
          </li>
        ))}
        {visible.length === 0 && (
          <li style={{ color: "#4a4a6a", textAlign: "center", padding: "16px", fontSize: "13px" }}>No tasks</li>
        )}
      </ul>

      <p style={{ color: "#7c85a2", fontSize: "12px", marginTop: "8px" }}>
        {state.todos.filter(t => !t.done).length} remaining
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const UseReducer = () => (
  <div>
    <div className="section">
      <h3>1. Counter with Named Actions</h3>
      <CounterReducerDemo />
    </div>
    <div className="section">
      <h3>2. Todo List — Complex Multi-field State</h3>
      <TodoReducerDemo />
    </div>
  </div>
);
