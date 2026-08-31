// =============================================================
// Phase 3 — 01: Custom Hooks
// =============================================================
// A custom hook is a JavaScript function whose name starts with "use"
// and that calls other hooks inside it.
//
// WHY custom hooks?
// - Extract reusable stateful logic OUT of components
// - Components become thin/clean — just UI, no logic clutter
// - Logic is testable in isolation
// - Share behavior between components without sharing UI
//
// RULES (same as all hooks):
// 1. Name MUST start with "use" (useMyHook, not myHook)
// 2. Only call hooks at the top level (no conditions/loops)
// 3. Only call hooks inside React functions or other custom hooks
//
// Android/Compose analogy:
//   Custom hook ~ remember*() helpers or ViewModel logic extraction
//   useDebounce  ~ debounce flow operator
//   useFetch     ~ StateFlow + viewModelScope.launch { repo.fetch() }
// =============================================================

import { useState, useEffect, useCallback, useRef } from "react";

// ─────────────────────────────────────────────────────────────
// HOOK 1: useLocalStorage — persist state to localStorage
// ─────────────────────────────────────────────────────────────
// Generic hook: <T> makes it work with any serializable type.
// Lazy initializer: reads localStorage only on first render.

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      // JSON.parse deserializes the stored string back to T
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      // Storage might be unavailable (private mode, SSR, etc.)
      return initialValue;
    }
  });

  // Wrap setter: updates both state AND localStorage atomically
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    try {
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch {
      console.warn(`useLocalStorage: failed to save key "${key}"`);
    }
  }, [key, storedValue]);

  // Remove from storage
  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    window.localStorage.removeItem(key);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

// ─────────────────────────────────────────────────────────────
// HOOK 2: useDebounce — delay value propagation
// ─────────────────────────────────────────────────────────────
// Classic example: search input — don't fire API on every keystroke,
// wait until the user stops typing for `delay` milliseconds.

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Start a timer; if value changes again before it fires, clear + restart
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    // Cleanup: cancel the pending timer
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ─────────────────────────────────────────────────────────────
// HOOK 3: useToggle — boolean state helper
// ─────────────────────────────────────────────────────────────

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  return { value, toggle, setTrue, setFalse };
}

// ─────────────────────────────────────────────────────────────
// HOOK 4: useFetch — data fetching with loading/error state
// ─────────────────────────────────────────────────────────────
// A simplified fetch hook — in production use TanStack Query instead.
// This teaches the pattern; Phase 6 shows the better library approach.

export function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useRef to track if the component is still mounted
  // avoids setting state on unmounted component
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!url) return;

    // AbortController: native browser API to cancel fetch requests
    abortRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    setData(null);

    fetch(url, { signal: abortRef.current.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<T>;
      })
      .then(json => {
        setData(json);
        setIsLoading(false);
      })
      .catch(err => {
        // AbortError is thrown when we cancel — ignore it
        if (err.name !== "AbortError") {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => {
      // Cleanup: abort the in-flight request when url changes or unmounts
      abortRef.current?.abort();
    };
  }, [url]);

  return { data, isLoading, error };
}

// ─────────────────────────────────────────────────────────────
// HOOK 5: useWindowSize — reactive window dimensions
// ─────────────────────────────────────────────────────────────

export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handler = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });

    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler); // cleanup!
  }, []);

  return size;
}

// ─────────────────────────────────────────────────────────────
// DEMO COMPONENTS — show each hook in action
// ─────────────────────────────────────────────────────────────

const LocalStorageDemo = () => {
  const [name, setName, removeName] = useLocalStorage("demo_name", "");
  const [count, setCount] = useLocalStorage("demo_count", 0);

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "10px" }}>
        Values persist across page refreshes (stored in localStorage):
      </p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <input
          style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0" }}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Type a name — it persists on refresh!"
        />
        <button className="btn btn-danger" style={{ fontSize: "12px" }} onClick={removeName}>Clear</button>
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button className="btn btn-ghost" onClick={() => setCount(c => c - 1)}>−</button>
        <span style={{ minWidth: "40px", textAlign: "center", fontWeight: 700 }}>{count}</span>
        <button className="btn btn-primary" onClick={() => setCount(c => c + 1)}>+</button>
        <span style={{ fontSize: "12px", color: "#7c85a2", marginLeft: "8px" }}>count persists too</span>
      </div>
    </div>
  );
};

const DebounceDemo = () => {
  const [input, setInput] = useState("");
  const debounced = useDebounce(input, 400);
  const [fireCount, setFireCount] = useState(0);

  useEffect(() => {
    if (debounced) setFireCount(c => c + 1);
  }, [debounced]);

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        Type fast — debounced value updates 400ms after you stop:
      </p>
      <input
        style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0" }}
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type here..."
      />
      <div style={{ marginTop: "8px", fontSize: "13px" }}>
        <div>Raw: <span style={{ color: "#e2e8f0" }}>{input || "—"}</span></div>
        <div>Debounced: <span style={{ color: "#4ade80" }}>{debounced || "—"}</span></div>
        <div style={{ color: "#7c85a2", fontSize: "12px" }}>API would fire: {fireCount}x (vs {input.length} keystrokes)</div>
      </div>
    </div>
  );
};

const ToggleDemo = () => {
  const modal = useToggle(false);
  const sidebar = useToggle(true);

  return (
    <div className="demo-box">
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={modal.toggle}>
          {modal.value ? "Close Modal" : "Open Modal"}
        </button>
        <button className="btn btn-ghost" onClick={sidebar.toggle}>
          {sidebar.value ? "Hide Sidebar" : "Show Sidebar"}
        </button>
        <button className="btn btn-danger" onClick={() => { modal.setFalse(); sidebar.setFalse(); }}>
          Close All
        </button>
      </div>
      <div style={{ display: "flex", gap: "8px", fontSize: "13px" }}>
        <span style={{ padding: "4px 10px", borderRadius: "6px", background: modal.value ? "#14532d" : "#1a1a2e", color: modal.value ? "#4ade80" : "#4a4a6a" }}>
          Modal: {modal.value ? "open" : "closed"}
        </span>
        <span style={{ padding: "4px 10px", borderRadius: "6px", background: sidebar.value ? "#1e3a5f" : "#1a1a2e", color: sidebar.value ? "#60a5fa" : "#4a4a6a" }}>
          Sidebar: {sidebar.value ? "visible" : "hidden"}
        </span>
      </div>
    </div>
  );
};

const WindowSizeDemo = () => {
  const { width, height } = useWindowSize();
  const breakpoint = width < 640 ? "mobile" : width < 1024 ? "tablet" : "desktop";

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        Resize the browser window to see reactive updates:
      </p>
      <div style={{ fontSize: "24px", fontWeight: 700, textAlign: "center", marginBottom: "8px" }}>
        {width} × {height}
      </div>
      <div style={{ textAlign: "center" }}>
        <span style={{
          padding: "4px 12px", borderRadius: "999px", fontSize: "13px", fontWeight: 600,
          background: breakpoint === "mobile" ? "#431407" : breakpoint === "tablet" ? "#1e3a5f" : "#2e1d5e",
          color: breakpoint === "mobile" ? "#fb923c" : breakpoint === "tablet" ? "#60a5fa" : "#a78bfa",
        }}>
          {breakpoint}
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const CustomHooks = () => (
  <div>
    <div className="section">
      <h3>1. useLocalStorage — Persist State</h3>
      <LocalStorageDemo />
    </div>
    <div className="section">
      <h3>2. useDebounce — Delay Value</h3>
      <DebounceDemo />
    </div>
    <div className="section">
      <h3>3. useToggle — Boolean Helper</h3>
      <ToggleDemo />
    </div>
    <div className="section">
      <h3>4. useWindowSize — Reactive Dimensions</h3>
      <WindowSizeDemo />
    </div>
  </div>
);
