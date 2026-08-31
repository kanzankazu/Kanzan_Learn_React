// =============================================================
// Phase 2 — Mini Project: Pomodoro Timer
// =============================================================
// Combines all Phase 2 hooks:
// [x] useReducer — timer state machine (all state in one reducer)
// [x] useEffect  — interval ticker + document title update
// [x] useRef     — store interval ID without triggering re-render
// [x] useContext — theme (light/dark)
// [x] useMemo    — format time display
// [x] useCallback — stable handler references
//
// Pomodoro technique: 25 min work → 5 min break → repeat
// After 4 pomodoros: 15 min long break
// =============================================================

import {
  useReducer, useEffect, useRef, useContext,
  useMemo, useCallback, createContext, useState,
} from "react";

// ─────────────────────────────────────────────────────────────
// Theme Context (reusing the pattern from 03_use_context)
// ─────────────────────────────────────────────────────────────

type Theme = "light" | "dark";
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({ theme: "dark", toggle: () => {} });
const useTheme = () => useContext(ThemeCtx);

// ─────────────────────────────────────────────────────────────
// Pomodoro State Machine (useReducer)
// ─────────────────────────────────────────────────────────────

type TimerMode = "focus" | "short_break" | "long_break";

const DURATIONS: Record<TimerMode, number> = {
  focus:       25 * 60,
  short_break: 5  * 60,
  long_break:  15 * 60,
};

const MODE_LABEL: Record<TimerMode, string> = {
  focus: "Focus", short_break: "Short Break", long_break: "Long Break",
};

interface PomodoroState {
  mode: TimerMode;
  secondsLeft: number;
  isRunning: boolean;
  completedPomodoros: number;
}

type PomodoroAction =
  | { type: "TICK" }
  | { type: "TOGGLE" }           // start/pause
  | { type: "RESET" }
  | { type: "SET_MODE"; payload: TimerMode }
  | { type: "COMPLETE_SESSION" }; // called when timer hits 0

function pomodoroReducer(state: PomodoroState, action: PomodoroAction): PomodoroState {
  switch (action.type) {
    case "TICK":
      // Prevent going below 0
      if (state.secondsLeft <= 0) return state;
      return { ...state, secondsLeft: state.secondsLeft - 1 };

    case "TOGGLE":
      return { ...state, isRunning: !state.isRunning };

    case "RESET":
      return { ...state, secondsLeft: DURATIONS[state.mode], isRunning: false };

    case "SET_MODE":
      return {
        ...state,
        mode: action.payload,
        secondsLeft: DURATIONS[action.payload],
        isRunning: false,
      };

    case "COMPLETE_SESSION": {
      const newCount = state.mode === "focus" ? state.completedPomodoros + 1 : state.completedPomodoros;
      // Auto-advance to next mode
      let nextMode: TimerMode = "short_break";
      if (state.mode === "focus") {
        nextMode = newCount % 4 === 0 ? "long_break" : "short_break";
      } else {
        nextMode = "focus";
      }
      return {
        mode: nextMode,
        secondsLeft: DURATIONS[nextMode],
        isRunning: false,
        completedPomodoros: newCount,
      };
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Helper components
// ─────────────────────────────────────────────────────────────

const ProgressRing = ({ progress, size = 200, color }: { progress: number; size?: number; color: string }) => {
  const r = size / 2 - 12;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - progress);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2d2d44" strokeWidth={8} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={circ}
        strokeDashoffset={dash}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.9s linear" }}
      />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────
// Main Timer component
// ─────────────────────────────────────────────────────────────

const MODE_COLOR: Record<TimerMode, string> = {
  focus: "#6366f1", short_break: "#4ade80", long_break: "#0ea5e9",
};

const PomodoroTimer = () => {
  const { theme } = useTheme();
  const [state, dispatch] = useReducer(pomodoroReducer, {
    mode: "focus",
    secondsLeft: DURATIONS.focus,
    isRunning: false,
    completedPomodoros: 0,
  });

  // useRef: store interval ID — mutating it should NOT trigger re-render
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // useMemo: only reformat time string when secondsLeft changes
  const timeDisplay = useMemo(() => {
    const m = Math.floor(state.secondsLeft / 60);
    const s = state.secondsLeft % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [state.secondsLeft]);

  const progress = state.secondsLeft / DURATIONS[state.mode];
  const color = MODE_COLOR[state.mode];

  // useEffect: manage the interval based on isRunning state
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => dispatch({ type: "TICK" }), 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    // Cleanup: always clear interval when effect re-runs or unmounts
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isRunning]);

  // useEffect: auto-complete when timer hits 0
  useEffect(() => {
    if (state.secondsLeft === 0 && state.isRunning) {
      dispatch({ type: "COMPLETE_SESSION" });
    }
  }, [state.secondsLeft, state.isRunning]);

  // useEffect: sync document title with timer state
  useEffect(() => {
    document.title = `${timeDisplay} — ${MODE_LABEL[state.mode]}`;
    return () => { document.title = "Kanzan Learn React"; };
  }, [timeDisplay, state.mode]);

  // useCallback: stable handlers for buttons (memo pattern)
  const handleToggle = useCallback(() => dispatch({ type: "TOGGLE" }), []);
  const handleReset = useCallback(() => dispatch({ type: "RESET" }), []);
  const handleSetMode = useCallback((mode: TimerMode) =>
    dispatch({ type: "SET_MODE", payload: mode }), []);

  const bgColor = theme === "dark" ? "#0f0f13" : "#f8fafc";
  const textColor = theme === "dark" ? "#e2e8f0" : "#1e293b";
  const mutedColor = theme === "dark" ? "#7c85a2" : "#64748b";

  return (
    <div style={{ background: bgColor, borderRadius: "16px", padding: "24px", maxWidth: "400px", margin: "0 auto" }}>
      {/* Mode selector */}
      <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "24px" }}>
        {(Object.keys(DURATIONS) as TimerMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => handleSetMode(mode)}
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
              background: state.mode === mode ? color : "transparent",
              color: state.mode === mode ? "#fff" : mutedColor,
              transition: "all 0.2s",
            }}
          >
            {MODE_LABEL[mode]}
          </button>
        ))}
      </div>

      {/* Ring + time display */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: "24px" }}>
        <ProgressRing progress={progress} color={color} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "52px", fontWeight: 800, color: textColor, fontVariantNumeric: "tabular-nums", letterSpacing: "-2px" }}>
            {timeDisplay}
          </div>
          <div style={{ fontSize: "13px", color: mutedColor, fontWeight: 600 }}>
            {MODE_LABEL[state.mode]}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "20px" }}>
        <button
          onClick={handleReset}
          style={{ width: "44px", height: "44px", borderRadius: "50%", border: "2px solid #2d2d44", background: "transparent", color: mutedColor, fontSize: "16px", cursor: "pointer" }}
        >
          ↺
        </button>
        <button
          onClick={handleToggle}
          style={{ width: "64px", height: "64px", borderRadius: "50%", border: "none", background: color, color: "#fff", fontSize: "22px", cursor: "pointer", boxShadow: `0 0 20px ${color}60` }}
        >
          {state.isRunning ? "⏸" : "▶"}
        </button>
      </div>

      {/* Pomodoro counter */}
      <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            style={{
              width: "10px", height: "10px", borderRadius: "50%",
              background: i < (state.completedPomodoros % 4) ? color : "#2d2d44",
            }}
          />
        ))}
      </div>
      <p style={{ textAlign: "center", fontSize: "12px", color: mutedColor, marginTop: "8px" }}>
        {state.completedPomodoros} pomodoros completed
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT — wrapped in theme provider
// ─────────────────────────────────────────────────────────────

export const MiniProjectPomodoro = () => {
  const [theme, setTheme] = useState<Theme>("dark");

  return (
    <ThemeCtx.Provider value={{ theme, toggle: () => setTheme(t => t === "dark" ? "light" : "dark") }}>
      <div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
          <button className="btn btn-ghost" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"} mode
          </button>
        </div>
        <PomodoroTimer />
        <div className="code-hint" style={{ marginTop: "24px" }}>{`// Hooks used in this mini project:
useReducer  → timer state machine (mode, secondsLeft, isRunning)
useEffect   → interval management + document title sync
useRef      → interval ID (no re-render needed)
useContext  → theme access anywhere in tree
useMemo     → time string formatting (MM:SS)
useCallback → stable handlers for buttons`}</div>
      </div>
    </ThemeCtx.Provider>
  );
};
