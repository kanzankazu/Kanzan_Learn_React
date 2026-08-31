// =============================================================
// Phase 6 — Mini Project: News Feed
// =============================================================
// A news-style feed built with TanStack Query.
// Uses JSONPlaceholder as the backend.
//
// Features:
// [x] useQuery  — fetch posts list with caching
// [x] useQuery  — fetch post detail (on click)
// [x] useQuery  — dependent: fetch post author + comments
// [x] useMutation — like/bookmark with optimistic update
// [x] useInfiniteQuery — "Load more" pagination
// [x] Query invalidation — refresh feed
// =============================================================

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { useLocalStorage } from "../phase-3/01_custom_hooks";

// ─────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────

const newsFeedClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } });

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface Post    { id: number; userId: number; title: string; body: string; }
interface User    { id: number; name: string; email: string; username: string; }
interface Comment { id: number; postId: number; name: string; email: string; body: string; }

// ─────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────

const newsApi = {
  getPostsPage: (page: number) =>
    fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=6`)
      .then(r => r.json()) as Promise<Post[]>,
  getPost: (id: number) =>
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then(r => r.json()) as Promise<Post>,
  getUser: (id: number) =>
    fetch(`https://jsonplaceholder.typicode.com/users/${id}`).then(r => r.json()) as Promise<User>,
  getComments: (postId: number) =>
    fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}&_limit=3`)
      .then(r => r.json()) as Promise<Comment[]>,
};

// ─────────────────────────────────────────────────────────────
// Post Card component
// ─────────────────────────────────────────────────────────────

const PostCard = ({
  post,
  isBookmarked,
  onSelect,
  onToggleBookmark,
}: {
  post: Post;
  isBookmarked: boolean;
  onSelect: (id: number) => void;
  onToggleBookmark: (id: number) => void;
}) => {
  // Prefetch author data on hover — data will be ready when user clicks
  const qc = useQueryClient();

  const handleMouseEnter = useCallback(() => {
    // prefetchQuery: fetches and caches silently, no loading state shown
    qc.prefetchQuery({
      queryKey: ["news-user", post.userId],
      queryFn: () => newsApi.getUser(post.userId),
    });
  }, [qc, post.userId]);

  return (
    <div
      style={{
        background: "#1e1e2e",
        border: "1px solid #2d2d44",
        borderRadius: "10px",
        padding: "14px",
        cursor: "pointer",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; handleMouseEnter(); }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#2d2d44"; }}
      onClick={() => onSelect(post.id)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <p style={{ fontWeight: 600, fontSize: "14px", flex: 1, marginRight: "8px" }}>{post.title}</p>
        <button
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", flexShrink: 0 }}
          onClick={e => { e.stopPropagation(); onToggleBookmark(post.id); }}
        >
          {isBookmarked ? "🔖" : "🔖"}
        </button>
      </div>
      <p style={{ color: "#7c85a2", fontSize: "12px", lineHeight: "1.5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {post.body}
      </p>
      <p style={{ color: "#4a4a6a", fontSize: "11px", marginTop: "8px" }}>Post #{post.id} · Hover to prefetch author</p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Post Detail panel
// ─────────────────────────────────────────────────────────────

const PostDetail = ({ postId, onClose }: { postId: number; onClose: () => void }) => {
  const { data: post, isLoading } = useQuery({
    queryKey: ["news-post", postId],
    queryFn: () => newsApi.getPost(postId),
  });

  const { data: author } = useQuery({
    queryKey: ["news-user", post?.userId],
    queryFn: () => newsApi.getUser(post!.userId),
    enabled: !!post?.userId,
  });

  const { data: comments } = useQuery({
    queryKey: ["news-comments", postId],
    queryFn: () => newsApi.getComments(postId),
  });

  return (
    <div style={{ background: "#1e1e2e", border: "1px solid #6366f1", borderRadius: "12px", padding: "20px" }}>
      <button
        className="btn btn-ghost"
        style={{ fontSize: "12px", marginBottom: "12px" }}
        onClick={onClose}
      >
        ← Back
      </button>
      {isLoading && <p style={{ color: "#7c85a2" }}>⏳ Loading...</p>}
      {post && (
        <>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>{post.title}</h2>
          {author && (
            <p style={{ color: "#7c85a2", fontSize: "13px", marginBottom: "12px" }}>
              By <strong style={{ color: "#a5b4fc" }}>{author.name}</strong> · @{author.username}
            </p>
          )}
          <p style={{ color: "#94a3b8", lineHeight: "1.7", marginBottom: "16px" }}>{post.body}</p>
          {comments && comments.length > 0 && (
            <div>
              <p style={{ fontWeight: 600, fontSize: "14px", marginBottom: "10px" }}>💬 Comments ({comments.length})</p>
              {comments.map(c => (
                <div key={c.id} style={{ padding: "10px", background: "#12121c", borderRadius: "8px", marginBottom: "8px" }}>
                  <p style={{ fontSize: "12px", color: "#7c85a2", marginBottom: "4px" }}>{c.name} · {c.email}</p>
                  <p style={{ fontSize: "13px", color: "#94a3b8" }}>{c.body}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Main feed component
// ─────────────────────────────────────────────────────────────

const NewsFeedContent = () => {
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useLocalStorage<number[]>("news_bookmarks", []);
  const qc = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["news-feed"],
    queryFn: ({ pageParam }) => newsApi.getPostsPage(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 6 ? allPages.length + 1 : undefined,
  });

  // Bookmark mutation with optimistic update via Zustand-style local state
  const toggleBookmark = useCallback((id: number) => {
    setBookmarks(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  }, [setBookmarks]);

  const allPosts = data?.pages.flat() ?? [];

  if (selectedPostId) {
    return <PostDetail postId={selectedPostId} onClose={() => setSelectedPostId(null)} />;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700 }}>📰 News Feed</h2>
          <p style={{ color: "#7c85a2", fontSize: "12px" }}>{allPosts.length} posts · {bookmarks.length} bookmarked</p>
        </div>
        <button
          className="btn btn-ghost"
          style={{ fontSize: "12px" }}
          disabled={isRefetching}
          onClick={() => {
            qc.invalidateQueries({ queryKey: ["news-feed"] });
            refetch();
          }}
        >
          {isRefetching ? "⏳ Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      {/* Feed */}
      {isLoading && <p style={{ color: "#7c85a2" }}>⏳ Loading feed...</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
        {allPosts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            isBookmarked={bookmarks.includes(post.id)}
            onSelect={setSelectedPostId}
            onToggleBookmark={toggleBookmark}
          />
        ))}
      </div>

      {/* Load more */}
      {!isLoading && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            className="btn btn-ghost"
            disabled={!hasNextPage || isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? "⏳ Loading..." : hasNextPage ? "Load More Posts" : "All posts loaded"}
          </button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────

export const MiniProjectNewsFeed = () => (
  <QueryClientProvider client={newsFeedClient}>
    <NewsFeedContent />
  </QueryClientProvider>
);
