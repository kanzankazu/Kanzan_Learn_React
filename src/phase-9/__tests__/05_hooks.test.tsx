// =============================================================
// Test Pattern 5: Custom Hook Tests
// =============================================================
// Custom hooks can be tested directly with renderHook().
// renderHook renders a minimal component that calls your hook.
// act() wraps state-changing operations.
// =============================================================

import { renderHook, act } from "@testing-library/react";

// ─────────────────────────────────────────────────────────────
// Hook under test: useCounter
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";

function useCounter(initialValue = 0, step = 1) {
  const [count, setCount] = useState(initialValue);
  const increment = useCallback(() => setCount(c => c + step), [step]);
  const decrement = useCallback(() => setCount(c => c - step), [step]);
  const reset     = useCallback(() => setCount(initialValue),  [initialValue]);
  const incrementBy = useCallback((n: number) => setCount(c => c + n), []);
  return { count, increment, decrement, reset, incrementBy };
}

describe("useCounter", () => {
  it("initializes with the provided value", () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it("initializes with 0 by default", () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it("increments the count by step", () => {
    const { result } = renderHook(() => useCounter(0, 2));
    // act() wraps any operation that causes state updates
    act(() => result.current.increment());
    expect(result.current.count).toBe(2);
  });

  it("decrements the count by step", () => {
    const { result } = renderHook(() => useCounter(10, 3));
    act(() => result.current.decrement());
    expect(result.current.count).toBe(7);
  });

  it("resets to initial value", () => {
    const { result } = renderHook(() => useCounter(5));
    act(() => result.current.increment());
    act(() => result.current.increment());
    expect(result.current.count).toBe(7);
    act(() => result.current.reset());
    expect(result.current.count).toBe(5);
  });

  it("increments by arbitrary amount", () => {
    const { result } = renderHook(() => useCounter(0));
    act(() => result.current.incrementBy(15));
    expect(result.current.count).toBe(15);
  });

  it("multiple operations in sequence", () => {
    const { result } = renderHook(() => useCounter(0));
    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.increment();
    });
    expect(result.current.count).toBe(3);
  });
});

// ─────────────────────────────────────────────────────────────
// Hook under test: useToggle (from Phase 3)
// ─────────────────────────────────────────────────────────────

function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle   = useCallback(() => setValue(v => !v), []);
  const setTrue  = useCallback(() => setValue(true),    []);
  const setFalse = useCallback(() => setValue(false),   []);
  return { value, toggle, setTrue, setFalse };
}

describe("useToggle", () => {
  it("starts with false by default", () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current.value).toBe(false);
  });

  it("starts with provided initial value", () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current.value).toBe(true);
  });

  it("toggles from false to true", () => {
    const { result } = renderHook(() => useToggle());
    act(() => result.current.toggle());
    expect(result.current.value).toBe(true);
  });

  it("toggles back to false", () => {
    const { result } = renderHook(() => useToggle(true));
    act(() => result.current.toggle());
    expect(result.current.value).toBe(false);
  });

  it("setTrue sets value to true regardless of current state", () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current.setTrue());
    expect(result.current.value).toBe(true);
    act(() => result.current.setTrue()); // calling again doesn't break
    expect(result.current.value).toBe(true);
  });

  it("setFalse sets value to false", () => {
    const { result } = renderHook(() => useToggle(true));
    act(() => result.current.setFalse());
    expect(result.current.value).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// Hook under test: useLocalStorage (simplified)
// ─────────────────────────────────────────────────────────────

import { useEffect } from "react";

function useLocalStorageMini<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch { return initialValue; }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(stored));
  }, [key, stored]);

  return [stored, setStored] as const;
}

describe("useLocalStorageMini", () => {
  beforeEach(() => {
    // Clear localStorage before each test to avoid test pollution
    localStorage.clear();
  });

  it("returns initial value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorageMini("test-key", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("reads existing value from localStorage", () => {
    localStorage.setItem("existing-key", JSON.stringify("stored-value"));
    const { result } = renderHook(() => useLocalStorageMini("existing-key", "default"));
    expect(result.current[0]).toBe("stored-value");
  });

  it("persists value to localStorage when updated", async () => {
    const { result } = renderHook(() => useLocalStorageMini("persist-key", 0));
    act(() => result.current[1](42));
    // Wait for useEffect to run
    expect(result.current[0]).toBe(42);
    expect(localStorage.getItem("persist-key")).toBe("42");
  });

  it("supports objects", () => {
    const { result } = renderHook(() =>
      useLocalStorageMini("obj-key", { name: "Alice", age: 25 })
    );
    act(() => result.current[1]({ name: "Bob", age: 30 }));
    expect(result.current[0]).toEqual({ name: "Bob", age: 30 });
  });
});
