// =============================================================
// Phase 6 — 01: Fetch Patterns (Manual)
// =============================================================
// Before libraries like TanStack Query, you wrote fetch logic manually.
// Understanding this pattern helps you appreciate WHY libraries exist.
//
// Manual approach problems:
//   - Boilerplate: loading, error, data states per fetch
//   - Race conditions: stale responses overwriting fresh ones
//   - No caching: re-fetches on every mount
//   - No background refresh: data goes stale silently
//   - No deduplication: same URL fetched by multiple components
//   - Complex invalidation: hard to know when to refetch
//
// This file shows manual patterns — Phase 6's other files show
// how TanStack Query and SWR solve all these problems.
//
// API used: JSONPlaceholder (https://jsonplaceholder.typicode.com)
// =============================================================

import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// PATTERN 1: Basic fetch with loading/error/data states
// ─────────────────────────────────────────────────────────────

interface Post { id: number; userId: number; title: string; body: string; }
interface User { id: number; name: string; email: string; }
interface Comment { id: number; postId: number; name: string; email: string; body: string; }

const BasicFetchDemo = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as Post[];
      setPosts(data);
      setFetched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "10px" }}>
        Manual fetch — you manage loading, error, data states yourself:
      </p>
      {!fetched && !loading && (
        <button className="btn btn-primary" onClick={fetchPosts}>Fetch Posts</button>
      )}
      {loading && <p style={{ color: "#7c85a2" }}>⏳ Loading...</p>}
      {error && <p style={{ color: "#f87171" }}>❌ {error}</p>}
      {posts.length > 0 && (
        <ul style={{ listStyle: "none" }}>
          {posts.map(p => (
            <li key={p.id} style={{ padding: "8px 0", borderBottom: "1px solid #1a1a2e" }}>
              <p style={{ fontWeight: 600, fontSize: "13px" }}>{p.title}</p>
              <p style={{ color: "#7c85a2", fontSize: "12px", marginTop: "2px" }}>{p.body.slice(0, 80)}...</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PATTERN 2: Dependent queries — fetch B only after A succeeds
// ─────────────────────────────────────────────────────────────

const DependentFetchDemo = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user first, then their posts
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setUser(null);
    setUserPosts([]);

    // Step 1: fetch the user
    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
      .then(r => r.json() as Promise<User>)
      .then(async u => {
        setUser(u);
        // Step 2: fetch their posts (depends on userId being fetched first)
        const posts = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}&_limit=3`).then(r => r.json()) as Post[];
        setUserPosts(posts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        Dependent fetch — posts load only after user is fetched:
      </p>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
        {[1, 2, 3, 4, 5].map(id => (
          <button
            key={id}
            className={`btn ${userId === id ? "btn-primary" : "btn-ghost"}`}
            style={{ fontSize: "12px", padding: "4px 10px" }}
            onClick={() => setUserId(id)}
          >
            User {id}
          </button>
        ))}
      </div>
      {loading && <p style={{ color: "#7c85a2", fontSize: "13px" }}>⏳ Loading user + posts...</p>}
      {user && !loading && (
        <div>
          <p style={{ fontWeight: 600 }}>{user.name} <span style={{ color: "#7c85a2", fontWeight: 400, fontSize: "13px" }}>{user.email}</span></p>
          <ul style={{ listStyle: "none", marginTop: "8px" }}>
            {userPosts.map(p => (
              <li key={p.id} style={{ padding: "4px 0", fontSize: "13px", color: "#94a3b8", borderBottom: "1px solid #1a1a2e" }}>
                → {p.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PATTERN 3: Parallel fetches — fetch multiple resources at once
// ─────────────────────────────────────────────────────────────

const ParallelFetchDemo = () => {
  const [data, setData] = useState<{ users: User[]; posts: Post[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Promise.all fires both fetches simultaneously — not sequentially
      const [users, posts] = await Promise.all([
        fetch("https://jsonplaceholder.typicode.com/users?_limit=3").then(r => r.json()) as Promise<User[]>,
        fetch("https://jsonplaceholder.typicode.com/posts?_limit=3").then(r => r.json()) as Promise<Post[]>,
      ]);
      setData({ users, posts });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        Parallel fetch — Promise.all fires both requests simultaneously:
      </p>
      <button className="btn btn-primary" style={{ marginBottom: "12px" }} onClick={fetchAll} disabled={loading}>
        {loading ? "⏳ Loading..." : "Fetch Users + Posts in parallel"}
      </button>
      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <p style={{ fontSize: "12px", color: "#7c85a2", marginBottom: "6px" }}>Users ({data.users.length})</p>
            {data.users.map(u => <p key={u.id} style={{ fontSize: "13px", color: "#94a3b8", padding: "3px 0" }}>👤 {u.name}</p>)}
          </div>
          <div>
            <p style={{ fontSize: "12px", color: "#7c85a2", marginBottom: "6px" }}>Posts ({data.posts.length})</p>
            {data.posts.map(p => <p key={p.id} style={{ fontSize: "13px", color: "#94a3b8", padding: "3px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📝 {p.title}</p>)}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PATTERN 4: Manual optimistic update
// ─────────────────────────────────────────────────────────────

const OptimisticDemo = () => {
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, postId: 1, name: "Initial comment", email: "alice@example.com", body: "Great post!" },
  ]);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  const addComment = async () => {
    if (!input.trim()) return;
    const optimistic: Comment = { id: Date.now(), postId: 1, name: "You", email: "you@example.com", body: input };

    // 1. Show the comment immediately (optimistic update)
    setComments(prev => [...prev, optimistic]);
    setInput("");
    setSaving(true);

    try {
      // 2. Send to server in background
      await fetch("https://jsonplaceholder.typicode.com/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(optimistic),
      });
      // 3. On success, replace optimistic with real server data
      // (JSONPlaceholder returns id: 501 for all POSTs)
      setSaving(false);
    } catch {
      // 4. On failure, revert the optimistic update
      setComments(prev => prev.filter(c => c.id !== optimistic.id));
      setSaving(false);
    }
  };

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        Optimistic update — UI updates immediately, server request runs in background:
      </p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <input
          style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0", fontSize: "13px" }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addComment()}
          placeholder="Add a comment..."
        />
        <button className="btn btn-primary" onClick={addComment} disabled={saving}>
          {saving ? "Saving..." : "Post"}
        </button>
      </div>
      {comments.map(c => (
        <div key={c.id} style={{ padding: "8px 10px", borderRadius: "6px", background: "#12121c", marginBottom: "6px" }}>
          <p style={{ fontSize: "12px", color: "#7c85a2", marginBottom: "4px" }}>{c.name} · {c.email}</p>
          <p style={{ fontSize: "13px", color: "#e2e8f0" }}>{c.body}</p>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const FetchPatterns = () => (
  <div>
    <div className="section">
      <h3>1. Basic Fetch — loading / error / data</h3>
      <BasicFetchDemo />
    </div>
    <div className="section">
      <h3>2. Dependent Fetch — fetch B after A</h3>
      <DependentFetchDemo />
    </div>
    <div className="section">
      <h3>3. Parallel Fetch — Promise.all</h3>
      <ParallelFetchDemo />
    </div>
    <div className="section">
      <h3>4. Optimistic Update — instant UI feedback</h3>
      <OptimisticDemo />
    </div>
  </div>
);
