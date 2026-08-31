// =============================================================
// Phase 2 — 01: useEffect
// =============================================================
// useEffect lets you synchronize a component with an external system.
// "External system" means anything outside React: browser APIs,
// network requests, timers, subscriptions, DOM manipulation.
//
// Signature:
//   useEffect(setup, dependencies?)
//
// Dependency array controls WHEN the effect runs:
//   useEffect(fn)          → runs after EVERY render
//   useEffect(fn, [])      → runs ONCE after mount
//   useEffect(fn, [a, b])  → runs when a or b changes
//
// Cleanup function (returned from setup):
//   - Runs before the next effect execution
//   - Runs when the component unmounts
//   - Use to: cancel timers, unsubscribe, abort fetch, remove listeners
//
// Android/Compose analogy:
//   LaunchedEffect(key) { ... }  ~  useEffect(() => { ... }, [key])
//   DisposableEffect { onDispose { ... } }  ~  useEffect return cleanup
//
// COMMON MISTAKE: Adding functions/objects to deps without useCallback/useMemo
// causes infinite loops because they're recreated on every render.
// =============================================================

import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────────
// DEMO 1: Run once on mount (empty dependency array)
// ─────────────────────────────────────────────────────────────

const MountEffectDemo = () => {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) =>
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 8));

  // Runs ONCE when component mounts — equivalent to componentDidMount
  useEffect(() => {
    addLog("Component mounted — effect ran");

    // Cleanup: runs when component UNMOUNTS
    return () => {
      // NOTE: console.log here won't update state (component is gone)
      // but is useful for cleanup tasks like cancelling subscriptions
      console.log("Component unmounted — cleanup ran");
    };
  }, []); // empty array = run once on mount

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        Effect with <code style={{ color: "#f472b6" }}>[]</code> — runs once on mount:
      </p>
      {log.map((entry, i) => (
        <div key={i} style={{ fontSize: "12px", color: "#a5b4fc", padding: "2px 0" }}>{entry}</div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 2: Run when dependency changes
// ─────────────────────────────────────────────────────────────

const DependencyDemo = () => {
  const [count, setCount] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  // Runs every time `count` changes
  useEffect(() => {
    setLog(prev =>
      [`count changed → ${count}`, ...prev].slice(0, 6)
    );
  }, [count]); // <-- count in deps: re-run when count changes

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        Effect with <code style={{ color: "#f472b6" }}>[count]</code> — runs on every count change:
      </p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button className="btn btn-ghost" onClick={() => setCount(c => c - 1)}>−</button>
        <span style={{ alignSelf: "center", minWidth: "40px", textAlign: "center", fontWeight: 700, fontSize: "18px" }}>{count}</span>
        <button className="btn btn-primary" onClick={() => setCount(c => c + 1)}>+</button>
      </div>
      <div style={{ fontSize: "12px" }}>
        {log.map((entry, i) => (
          <div key={i} style={{ color: i === 0 ? "#4ade80" : "#4a4a6a", padding: "2px 0" }}>→ {entry}</div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 3: Timer with cleanup — prevent memory leaks
// ─────────────────────────────────────────────────────────────

const TimerDemo = () => {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    // Don't start the interval if not running
    if (!running) return;

    // setInterval returns an ID we need to store for cleanup
    const intervalId = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // CLEANUP: clears the interval when:
    // 1. Component unmounts
    // 2. Effect re-runs (running changed to false)
    // Without this, intervals would stack up and cause memory leaks!
    return () => clearInterval(intervalId);
  }, [running]); // re-run effect when running state changes

  const reset = () => {
    setRunning(false);
    setSeconds(0);
  };

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
        Timer with cleanup — interval is cleared on stop/unmount:
      </p>
      <div style={{ fontSize: "48px", fontWeight: 800, textAlign: "center", marginBottom: "16px", fontVariantNumeric: "tabular-nums" }}>
        {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
      </div>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        <button className="btn btn-primary" onClick={() => setRunning(r => !r)}>
          {running ? "⏸ Pause" : "▶ Start"}
        </button>
        <button className="btn btn-danger" onClick={reset}>↺ Reset</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 4: Fetch with cancellation — prevent stale state updates
// ─────────────────────────────────────────────────────────────

interface Post { id: number; title: string; body: string; }

const FetchDemo = () => {
  const [postId, setPostId] = useState(1);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Race condition prevention:
    // If the user changes postId quickly, older fetches might resolve
    // AFTER newer ones, overwriting fresh data with stale data.
    // Solution: a "cancelled" flag checked before setting state.
    let cancelled = false;

    setLoading(true);
    setError(null);
    setPost(null);

    fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Post>;
      })
      .then(data => {
        if (!cancelled) { // only update state if still mounted/relevant
          setPost(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    // Cleanup: set cancelled = true so pending fetches are ignored
    return () => { cancelled = true; };
  }, [postId]); // re-fetch whenever postId changes

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        Fetch with stale-state prevention (JSONPlaceholder API):
      </p>
      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
        <button className="btn btn-ghost" disabled={postId <= 1} onClick={() => setPostId(p => p - 1)}>← Prev</button>
        <span style={{ color: "#a5b4fc" }}>Post #{postId}</span>
        <button className="btn btn-primary" disabled={postId >= 10} onClick={() => setPostId(p => p + 1)}>Next →</button>
      </div>
      {loading && <p style={{ color: "#7c85a2" }}>⏳ Loading...</p>}
      {error && <p style={{ color: "#f87171" }}>❌ {error}</p>}
      {post && (
        <div>
          <p style={{ fontWeight: 600, marginBottom: "6px" }}>{post.title}</p>
          <p style={{ color: "#7c85a2", fontSize: "13px", lineHeight: "1.6" }}>{post.body}</p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const UseEffect = () => (
  <div>
    <div className="section">
      <h3>1. Run Once on Mount (empty deps)</h3>
      <MountEffectDemo />
    </div>
    <div className="section">
      <h3>2. Run on Dependency Change</h3>
      <DependencyDemo />
    </div>
    <div className="section">
      <h3>3. Timer with Cleanup</h3>
      <TimerDemo />
    </div>
    <div className="section">
      <h3>4. Fetch with Cancellation</h3>
      <FetchDemo />
    </div>
  </div>
);
