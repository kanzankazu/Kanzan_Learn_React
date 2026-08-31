// =============================================================
// Test Pattern 3: Async Tests
// =============================================================
// Testing async operations: API calls, timers, loading states.
//
// Key tools:
//   waitFor()     — wait for a condition to become true
//   findByRole()  — async version of getByRole (uses waitFor internally)
//   vi.fn()       — mock functions
//   vi.useFakeTimers() — control setTimeout/setInterval
//
// API mocking approaches:
//   1. Inject mock via props (simplest — UserList does this)
//   2. vi.spyOn(global, "fetch") — mock the global fetch
//   3. MSW (Mock Service Worker) — recommended for real apps
// =============================================================

import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserList } from "../components/UserList";
import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────────
// Async component loading test
// ─────────────────────────────────────────────────────────────

describe("UserList — async data loading", () => {
  it("shows loading state initially", () => {
    // Mock fetch that never resolves (to freeze at loading state)
    const neverResolve = () => new Promise<never>(() => {});
    render(<UserList fetchUsers={neverResolve} />);
    // Immediately after render: should show loading
    expect(screen.getByText("Loading users...")).toBeInTheDocument();
  });

  it("renders users after successful fetch", async () => {
    const mockUsers = [
      { id: 1, name: "Alice Martin",   email: "alice@test.com" },
      { id: 2, name: "Bob Chen",       email: "bob@test.com" },
    ];
    const mockFetch = vi.fn().mockResolvedValue(mockUsers);

    render(<UserList fetchUsers={mockFetch} />);

    // findByRole: async query — waits for element to appear
    const list = await screen.findByRole("list", { name: "User list" });
    expect(list).toBeInTheDocument();
    expect(screen.getByText("Alice Martin")).toBeInTheDocument();
    expect(screen.getByText("Bob Chen")).toBeInTheDocument();
    // Loading state should be gone
    expect(screen.queryByText("Loading users...")).not.toBeInTheDocument();
  });

  it("shows error message when fetch fails", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
    render(<UserList fetchUsers={mockFetch} />);

    // waitFor: keeps retrying the assertion until it passes (or times out)
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Error: Network error");
    });
  });

  it("calls fetchUsers exactly once on mount", async () => {
    const mockFetch = vi.fn().mockResolvedValue([]);
    render(<UserList fetchUsers={mockFetch} />);
    await screen.findByRole("list");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────
// Timer-based async test
// ─────────────────────────────────────────────────────────────

const DelayedMessage = ({ delay = 1000 }: { delay?: number }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return <div>{visible ? <p>Message appeared!</p> : <p>Waiting...</p>}</div>;
};

describe("DelayedMessage — timer tests", () => {
  beforeEach(() => {
    // Replace real timers with fake ones we can control
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers after each test
    vi.useRealTimers();
  });

  it("shows waiting state initially", () => {
    render(<DelayedMessage delay={2000} />);
    expect(screen.getByText("Waiting...")).toBeInTheDocument();
    expect(screen.queryByText("Message appeared!")).not.toBeInTheDocument();
  });

  it("shows message after the delay", async () => {
    render(<DelayedMessage delay={2000} />);

    // act() + runAllTimers: fast-forward all pending timers instantly
    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByText("Message appeared!")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────
// Optimistic update test
// ─────────────────────────────────────────────────────────────

const LikeButton = ({ onLike }: { onLike: () => Promise<void> }) => {
  const [liked, setLiked] = useState(false);
  const [pending, setPending] = useState(false);

  const handleLike = async () => {
    setLiked(true);     // optimistic update
    setPending(true);
    try {
      await onLike();
    } catch {
      setLiked(false);  // rollback on error
    } finally {
      setPending(false);
    }
  };

  return (
    <button onClick={handleLike} disabled={pending} aria-pressed={liked}>
      {liked ? "❤️ Liked" : "🤍 Like"}
    </button>
  );
};

describe("LikeButton — optimistic update", () => {
  it("shows liked state immediately on click (optimistic)", async () => {
    const user = userEvent.setup();
    // Slow API that takes 500ms
    const slowLike = vi.fn(() => new Promise<void>(r => setTimeout(r, 500)));
    render(<LikeButton onLike={slowLike} />);

    await user.click(screen.getByRole("button"));
    // Should show liked BEFORE the API resolves
    expect(screen.getByRole("button")).toHaveTextContent("❤️ Liked");
  });

  it("rolls back on API failure", async () => {
    const user = userEvent.setup();
    const failLike = vi.fn().mockRejectedValue(new Error("failed"));
    render(<LikeButton onLike={failLike} />);

    await user.click(screen.getByRole("button"));
    // After rejection: should roll back to unliked
    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveTextContent("🤍 Like");
    });
  });
});
