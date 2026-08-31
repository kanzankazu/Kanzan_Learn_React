// =============================================================
// Phase 3 — Mini Project: User Search
// =============================================================
// A GitHub-style user search page built entirely with custom hooks.
// The components are thin — all logic lives in hooks.
//
// Custom hooks used:
// [x] useDebounce       → delay search input before fetching
// [x] useFetch          → fetch users from JSONPlaceholder API
// [x] useLocalStorage   → persist recent searches
// [x] useToggle         → show/hide user detail card
// [x] Hook composition  → useUserSearch = useDebounce + useFetch
//
// JSONPlaceholder API: https://jsonplaceholder.typicode.com/users
// =============================================================

import { useState, useCallback } from "react";
import { useDebounce, useFetch, useLocalStorage, useToggle } from "./01_custom_hooks";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface ApiUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: { name: string; catchPhrase: string };
  address: { city: string; street: string };
}

// ─────────────────────────────────────────────────────────────
// Composed hook: useUserSearch
// ─────────────────────────────────────────────────────────────

function useUserSearch() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 350);

  // Fetch all users (JSONPlaceholder doesn't support server-side search)
  const { data: allUsers, isLoading, error } = useFetch<ApiUser[]>(
    "https://jsonplaceholder.typicode.com/users"
  );

  // Client-side filter using the debounced query
  const results = allUsers?.filter(u =>
    debouncedQuery.trim() === "" ? true :
    u.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
    u.company.name.toLowerCase().includes(debouncedQuery.toLowerCase())
  ) ?? [];

  return { query, setQuery, results, isLoading, error };
}

// ─────────────────────────────────────────────────────────────
// Atom: UserCard
// ─────────────────────────────────────────────────────────────

const UserCard = ({
  user,
  isBookmarked,
  onToggleBookmark,
}: {
  user: ApiUser;
  isBookmarked: boolean;
  onToggleBookmark: (id: number) => void;
}) => {
  // useToggle for expand/collapse detail — local to each card
  const detail = useToggle(false);

  return (
    <div style={{
      background: "#1e1e2e",
      border: `1px solid ${isBookmarked ? "#6366f1" : "#2d2d44"}`,
      borderRadius: "12px",
      padding: "16px",
      transition: "border-color 0.2s",
    }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "10px" }}>
        {/* Avatar from initials */}
        <div style={{
          width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0,
          background: `hsl(${(user.id * 47) % 360}, 60%, 45%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, color: "#fff", fontSize: "16px",
        }}>
          {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, marginBottom: "2px" }}>{user.name}</p>
          <p style={{ color: "#7c85a2", fontSize: "12px" }}>@{user.username}</p>
        </div>
        <button
          onClick={() => onToggleBookmark(user.id)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}
        >
          {isBookmarked ? "🔖" : "🔖"}
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#7c85a2", marginBottom: "10px", flexWrap: "wrap" }}>
        <span>✉️ {user.email}</span>
        <span>🏢 {user.company.name}</span>
        <span>📍 {user.address.city}</span>
      </div>

      {/* Toggle detail button */}
      <button
        className="btn btn-ghost"
        style={{ fontSize: "12px", padding: "4px 10px" }}
        onClick={detail.toggle}
      >
        {detail.value ? "▲ Less" : "▼ More"}
      </button>

      {/* Expanded detail — only rendered when detail.value is true */}
      {detail.value && (
        <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #2d2d44", fontSize: "13px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", color: "#94a3b8" }}>
            <span>📞 {user.phone}</span>
            <span>🌐 {user.website}</span>
            <span style={{ color: "#a78bfa", fontStyle: "italic" }}>"{user.company.catchPhrase}"</span>
            <span>🏠 {user.address.street}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Main page component
// ─────────────────────────────────────────────────────────────

export const MiniProjectUserSearch = () => {
  const { query, setQuery, results, isLoading, error } = useUserSearch();

  // Bookmarks persisted to localStorage — survives page refresh
  const [bookmarks, setBookmarks] = useLocalStorage<number[]>("user_bookmarks", []);

  // Recent searches persisted to localStorage
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>("recent_searches", []);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (q.trim() && !recentSearches.includes(q.trim())) {
      setRecentSearches(prev => [q.trim(), ...prev].slice(0, 5));
    }
  }, [setQuery, recentSearches, setRecentSearches]);

  const toggleBookmark = useCallback((id: number) => {
    setBookmarks(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  }, [setBookmarks]);

  const clearRecent = () => setRecentSearches([]);

  return (
    <div>
      {/* Search bar */}
      <div style={{ marginBottom: "16px" }}>
        <input
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "10px",
            border: "1px solid #2d2d44",
            background: "#12121c",
            color: "#e2e8f0",
            fontSize: "15px",
          }}
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search by name, email, or company..."
          autoFocus
        />
      </div>

      {/* Recent searches */}
      {recentSearches.length > 0 && !query && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <p style={{ fontSize: "12px", color: "#7c85a2" }}>Recent searches</p>
            <button className="btn btn-ghost" style={{ fontSize: "11px", padding: "2px 8px" }} onClick={clearRecent}>Clear</button>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {recentSearches.map(s => (
              <button
                key={s}
                className="btn btn-ghost"
                style={{ fontSize: "12px", padding: "4px 10px" }}
                onClick={() => setQuery(s)}
              >
                🕐 {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", fontSize: "13px", color: "#7c85a2" }}>
        {isLoading ? (
          <span>⏳ Loading users...</span>
        ) : error ? (
          <span style={{ color: "#f87171" }}>❌ {error}</span>
        ) : (
          <span>{results.length} user{results.length !== 1 ? "s" : ""} found</span>
        )}
        {bookmarks.length > 0 && (
          <span>🔖 {bookmarks.length} bookmarked</span>
        )}
      </div>

      {/* Results grid */}
      {!isLoading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
          {results.map(user => (
            <UserCard
              key={user.id}
              user={user}
              isBookmarked={bookmarks.includes(user.id)}
              onToggleBookmark={toggleBookmark}
            />
          ))}
        </div>
      )}

      {!isLoading && results.length === 0 && !error && query && (
        <div className="coming-soon">
          <span>🔍</span>
          <p>No users match &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
};
