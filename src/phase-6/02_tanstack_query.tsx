// =============================================================
// Phase 6 — 02: TanStack Query (React Query)
// =============================================================
// TanStack Query is the gold standard for server state management.
// It handles caching, background refresh, deduplication, and more.
//
// Core concepts:
//   QueryClient  → manages the cache
//   useQuery     → fetch and cache GET data
//   useMutation  → create/update/delete data
//   queryKey     → unique identifier for cache entries
//   staleTime    → how long data is "fresh" (no background refetch)
//   gcTime       → how long unused data stays in cache
//
// Key features vs manual fetch:
//   + Automatic caching — same queryKey = shared cache
//   + Background refetch — data stays fresh
//   + Deduplication — multiple components, one request
//   + Loading/error states — built-in, no boilerplate
//   + Optimistic updates — built-in mutation callbacks
//   + Pagination/infinite scroll — built-in
//   + DevTools — visual cache inspector
//
// install: npm install @tanstack/react-query
// =============================================================

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useState } from "react";

// ─────────────────────────────────────────────────────────────
// Setup: QueryClient (one per app — usually in main.tsx)
// For this demo we create one locally
// ─────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: data is "fresh" for 60s — no background refetch during this window
      staleTime: 60 * 1000,
      // retry: how many times to retry on failure (default: 3)
      retry: 1,
    },
  },
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface Post   { id: number; userId: number; title: string; body: string; }
interface User   { id: number; name: string;   email: string; username: string; }
interface Todo   { id: number; userId: number; title: string; completed: boolean; }

// ─────────────────────────────────────────────────────────────
// API functions — pure async functions, no React inside
// Separating fetch logic from hook usage is best practice
// ─────────────────────────────────────────────────────────────

const api = {
  getPosts:    (limit = 5) => fetch(`https://jsonplaceholder.typicode.com/posts?_limit=${limit}`).then(r => r.json()) as Promise<Post[]>,
  getPost:     (id: number) => fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then(r => r.json()) as Promise<Post>,
  getUser:     (id: number) => fetch(`https://jsonplaceholder.typicode.com/users/${id}`).then(r => r.json()) as Promise<User>,
  getUserTodos:(userId: number) => fetch(`https://jsonplaceholder.typicode.com/todos?userId=${userId}&_limit=5`).then(r => r.json()) as Promise<Todo[]>,
  createTodo:  (todo: Omit<Todo, "id">) => fetch("https://jsonplaceholder.typicode.com/todos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(todo) }).then(r => r.json()) as Promise<Todo>,
  deleteTodo:  (id: number) => fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, { method: "DELETE" }),
  getPostsPage:(page: number) => fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=5`).then(r => r.json()) as Promise<Post[]>,
};

// ─────────────────────────────────────────────────────────────
// DEMO 1: Basic useQuery
// ─────────────────────────────────────────────────────────────

const BasicQueryDemo = () => {
  const [postId, setPostId] = useState(1);

  // useQuery: fetches + caches the result under key ["post", postId]
  // Switch postId → fetches new data; switch back → uses cached data instantly
  const { data: post, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["post", postId],       // unique cache key — array for namespacing
    queryFn: () => api.getPost(postId), // the async function to run
    staleTime: 30 * 1000,             // cached data is fresh for 30s
  });

  // Dependent query: only runs when post is loaded (enabled: !!post)
  const { data: author } = useQuery({
    queryKey: ["user", post?.userId],
    queryFn: () => api.getUser(post!.userId),
    enabled: !!post?.userId, // don't run until we have the userId
  });

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "8px" }}>
        Switch between posts — cached posts load instantly on revisit:
      </p>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
        {[1, 2, 3, 4, 5].map(id => (
          <button
            key={id}
            className={`btn ${postId === id ? "btn-primary" : "btn-ghost"}`}
            style={{ fontSize: "12px", padding: "4px 10px" }}
            onClick={() => setPostId(id)}
          >
            Post {id}
          </button>
        ))}
      </div>

      {isLoading && <p style={{ color: "#7c85a2" }}>⏳ Loading...</p>}
      {isError && <p style={{ color: "#f87171" }}>❌ {String(error)}</p>}
      {post && (
        <div>
          {isFetching && !isLoading && (
            <p style={{ color: "#7c85a2", fontSize: "12px", marginBottom: "6px" }}>🔄 Refreshing in background...</p>
          )}
          <p style={{ fontWeight: 600, marginBottom: "6px" }}>{post.title}</p>
          <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.6", marginBottom: "8px" }}>{post.body}</p>
          {author && (
            <p style={{ color: "#7c85a2", fontSize: "12px" }}>
              ✍️ <strong style={{ color: "#a5b4fc" }}>{author.name}</strong> · {author.email}
              <span style={{ color: "#4a4a6a", marginLeft: "8px" }}>(dependent query — loaded after post)</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 2: useMutation — create / delete with cache invalidation
// ─────────────────────────────────────────────────────────────

const MutationDemo = () => {
  const qc = useQueryClient();
  const [newTitle, setNewTitle] = useState("");

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ["todos", 1],
    queryFn: () => api.getUserTodos(1),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (title: string) => api.createTodo({ userId: 1, title, completed: false }),
    onSuccess: () => {
      // Invalidate the cache so the list refetches with the new item
      qc.invalidateQueries({ queryKey: ["todos", 1] });
      setNewTitle("");
    },
  });

  // Delete mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteTodo(id),
    // onMutate: called BEFORE the mutationFn — perfect for optimistic updates
    onMutate: async (deletedId) => {
      await qc.cancelQueries({ queryKey: ["todos", 1] }); // cancel in-flight refetches
      const previous = qc.getQueryData<Todo[]>(["todos", 1]);
      // Optimistically remove the item from cache
      qc.setQueryData<Todo[]>(["todos", 1], old => old?.filter(t => t.id !== deletedId) ?? []);
      return { previous }; // save snapshot for rollback
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previous) qc.setQueryData(["todos", 1], context.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["todos", 1] });
    },
  });

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "10px" }}>
        useMutation with cache invalidation + optimistic delete:
      </p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <input
          style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #2d2d44", background: "#12121c", color: "#e2e8f0", fontSize: "13px" }}
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === "Enter" && newTitle.trim() && createMutation.mutate(newTitle)}
          placeholder="New todo..."
        />
        <button
          className="btn btn-primary"
          disabled={createMutation.isPending || !newTitle.trim()}
          onClick={() => newTitle.trim() && createMutation.mutate(newTitle)}
        >
          {createMutation.isPending ? "Adding..." : "Add"}
        </button>
      </div>
      {isLoading && <p style={{ color: "#7c85a2", fontSize: "13px" }}>⏳ Loading todos...</p>}
      <ul style={{ listStyle: "none" }}>
        {todos.map(todo => (
          <li key={todo.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", borderBottom: "1px solid #1a1a2e" }}>
            <span style={{ fontSize: "14px" }}>{todo.completed ? "✅" : "⬜"}</span>
            <span style={{ flex: 1, fontSize: "13px", color: todo.completed ? "#4a4a6a" : "#e2e8f0", textDecoration: todo.completed ? "line-through" : "none" }}>
              {todo.title}
            </span>
            <button
              style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "14px" }}
              onClick={() => deleteMutation.mutate(todo.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DEMO 3: useInfiniteQuery — infinite scroll / load more
// ─────────────────────────────────────────────────────────────

const InfiniteQueryDemo = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["posts-infinite"],
    queryFn: ({ pageParam }) => api.getPostsPage(pageParam as number),
    initialPageParam: 1,
    // getNextPageParam: tells TanStack Query what to pass as pageParam next time
    // Return undefined to signal there are no more pages
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 5 ? allPages.length + 1 : undefined,
  });

  // Flatten all pages into a single array
  const allPosts = data?.pages.flat() ?? [];

  return (
    <div className="demo-box">
      <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "10px" }}>
        useInfiniteQuery — paginated data with &quot;Load More&quot;:
      </p>
      {isLoading && <p style={{ color: "#7c85a2" }}>⏳ Loading...</p>}
      <ul style={{ listStyle: "none", maxHeight: "200px", overflowY: "auto" }}>
        {allPosts.map(post => (
          <li key={post.id} style={{ padding: "6px 0", borderBottom: "1px solid #1a1a2e", fontSize: "13px", color: "#94a3b8" }}>
            <span style={{ color: "#4a4a6a", marginRight: "6px" }}>#{post.id}</span>
            {post.title}
          </li>
        ))}
      </ul>
      {!isLoading && (
        <button
          className="btn btn-ghost"
          style={{ marginTop: "10px", fontSize: "13px" }}
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {isFetchingNextPage ? "⏳ Loading more..." : hasNextPage ? "Load More" : "No more posts"}
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT — wrapped in QueryClientProvider
// ─────────────────────────────────────────────────────────────
export const TanstackQuery = () => (
  // QueryClientProvider must wrap all useQuery/useMutation consumers
  <QueryClientProvider client={queryClient}>
    <div>
      <div className="section">
        <h3>1. useQuery — fetch, cache, dependent query</h3>
        <BasicQueryDemo />
      </div>
      <div className="section">
        <h3>2. useMutation — create/delete with cache invalidation</h3>
        <MutationDemo />
      </div>
      <div className="section">
        <h3>3. useInfiniteQuery — load more / infinite scroll</h3>
        <InfiniteQueryDemo />
      </div>
    </div>
  </QueryClientProvider>
);
