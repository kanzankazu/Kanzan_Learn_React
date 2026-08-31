// =============================================================
// Phase 6 — 03: SWR
// =============================================================
// SWR (stale-while-revalidate) is a lighter alternative to TanStack Query.
// Created by Vercel — pairs naturally with Next.js.
//
// Name origin: HTTP RFC 5861 "stale-while-revalidate" cache strategy:
//   1. Return cached (stale) data immediately
//   2. Fetch fresh data in background
//   3. Update UI when fresh data arrives
//
// SWR vs TanStack Query:
//   SWR           → simpler API, smaller bundle (~4KB), great for Next.js
//   TanStack Query → more features (infinite query, offline support, devtools)
//
// Core API:
//   useSWR(key, fetcher, options?)
//   useSWRMutation(key, mutationFn)
//   mutate(key)  → manually trigger revalidation
//
// install: npm install swr
// =============================================================

import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { useState } from "react";

// ─────────────────────────────────────────────────────────────
// Fetcher — SWR expects a function that takes a URL and returns data
// One fetcher can be shared across the whole app
// ─────────────────────────────────────────────────────────────

const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface Post { id: number; userId: number; title: string; body: string; }
interface Album { id: number; userId: number; title: string; }
interface Photo { id: number; albumId: number; title: string; thumbnailUrl: string; }

// ─────────────────────────────────────────────────────────────
// DEMO 1: Basic useSWR
// ─────────────────────────────────────────────────────────────

const BasicSwrDemo = () => {
  const [userId, setUserId] = useState(1);

  // useSWR(key, fetcher) — key changes → automatically refetches
  // Return: { data, error, isLoading, isValidating }
  const { data: posts, isLoading, error } = useSWR<Post[]>(
    `https://jsonplaceholder.typicode.com/posts?userId=${userId}&_limit=4`,
    fetcher,
    {
      // revalidateOnFocus: refetch when user tabs back to the page
      revalidateOnFocus: true,
      // dedupingInterval: prevent duplicate requests within 2s
      dedupingInterval: 2000,
    }
  );

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        SWR: key change triggers automatic refetch, cached data shown instantly:
      </p>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
        {[1, 2, 3].map(id => (
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
      {isLoading && <p style={{ color: "#7c85a2" }}>⏳ Loading...</p>}
      {error && <p style={{ color: "#f87171" }}>❌ {error.message}</p>}
      {posts && (
        <ul style={{ listStyle: "none" }}>
          {posts.map(p => (
            <li key={p.id} style={{ padding: "6px 0", borderBottom: "1px solid #1a1a2e", fontSize: "13px", color: "#94a3b8" }}>
              {p.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 2: useSWRMutation — trigger mutations
// ─────────────────────────────────────────────────────────────

async function createPost(url: string, { arg }: { arg: { title: string; body: string } }) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...arg, userId: 1 }),
  }).then(r => r.json()) as Promise<Post>;
}

const SwrMutationDemo = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [created, setCreated] = useState<Post[]>([]);

  const { trigger, isMutating } = useSWRMutation(
    "https://jsonplaceholder.typicode.com/posts",
    createPost,
    {
      onSuccess: (newPost) => {
        setCreated(prev => [newPost, ...prev]);
        setTitle("");
        setBody("");
        // Revalidate the posts cache after mutation
        mutate("https://jsonplaceholder.typicode.com/posts");
      },
    }
  );

  const inputStyle = {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #2d2d44",
    background: "#12121c",
    color: "#e2e8f0",
    fontSize: "13px",
    marginBottom: "8px",
  } as const;

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "10px" }}>
        useSWRMutation — trigger POST request with loading state:
      </p>
      <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title..." />
      <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "60px" }} value={body} onChange={e => setBody(e.target.value)} placeholder="Post body..." />
      <button
        className="btn btn-primary"
        disabled={isMutating || !title.trim()}
        onClick={() => trigger({ title, body })}
      >
        {isMutating ? "⏳ Creating..." : "Create Post"}
      </button>
      {created.length > 0 && (
        <div style={{ marginTop: "12px" }}>
          <p style={{ fontSize: "12px", color: "#4ade80", marginBottom: "6px" }}>✅ Created posts:</p>
          {created.map(p => (
            <div key={p.id} style={{ padding: "6px 10px", background: "#12121c", borderRadius: "6px", marginBottom: "4px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600 }}>{p.title}</p>
              <p style={{ fontSize: "12px", color: "#7c85a2" }}>id: {p.id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 3: SWR conditional fetching + loading state UI
// ─────────────────────────────────────────────────────────────

const AlbumPhotosDemo = () => {
  const [albumId, setAlbumId] = useState<number | null>(null);

  // Pass null as key to SKIP the fetch
  const { data: albums, isLoading: albumsLoading } = useSWR<Album[]>(
    "https://jsonplaceholder.typicode.com/albums?_limit=4",
    fetcher
  );

  const { data: photos, isLoading: photosLoading } = useSWR<Photo[]>(
    // Conditional: only fetch when albumId is selected
    albumId ? `https://jsonplaceholder.typicode.com/photos?albumId=${albumId}&_limit=6` : null,
    fetcher
  );

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "10px" }}>
        Conditional SWR: photos only fetched when an album is selected (null key = skip):
      </p>
      {albumsLoading && <p style={{ color: "#7c85a2", fontSize: "13px" }}>⏳ Loading albums...</p>}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
        {albums?.map(album => (
          <button
            key={album.id}
            className={`btn ${albumId === album.id ? "btn-primary" : "btn-ghost"}`}
            style={{ fontSize: "11px", padding: "4px 8px" }}
            onClick={() => setAlbumId(album.id)}
          >
            {album.title.slice(0, 20)}...
          </button>
        ))}
      </div>
      {albumId && photosLoading && <p style={{ color: "#7c85a2", fontSize: "13px" }}>⏳ Loading photos...</p>}
      {photos && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
          {photos.map(photo => (
            <div key={photo.id} style={{ background: "#12121c", borderRadius: "6px", overflow: "hidden" }}>
              <img
                src={photo.thumbnailUrl}
                alt={photo.title}
                style={{ width: "100%", display: "block" }}
                loading="lazy"
              />
              <p style={{ fontSize: "10px", color: "#4a4a6a", padding: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {photo.title}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export const SWR = () => (
  <div>
    <div className="section">
      <h3>1. Basic useSWR — fetch + cache + revalidate</h3>
      <BasicSwrDemo />
    </div>
    <div className="section">
      <h3>2. useSWRMutation — POST request</h3>
      <SwrMutationDemo />
    </div>
    <div className="section">
      <h3>3. Conditional Fetch — null key skips fetch</h3>
      <AlbumPhotosDemo />
    </div>
  </div>
);
