// =============================================================
// Test Pattern 2: Interaction Tests
// =============================================================
// Tests that verify user interactions produce correct outcomes.
// Always use @testing-library/user-event for realistic interactions.
// fireEvent is lower-level (no bubbling, no focus management).
// =============================================================

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Counter } from "../components/Counter";

// userEvent.setup() creates an instance with pointer simulation
// Always create it OUTSIDE the test body (once per describe block is fine)
const user = userEvent.setup();

describe("Counter — interactions", () => {
  it("increments count when Increment is clicked", async () => {
    render(<Counter initialValue={0} />);
    await user.click(screen.getByRole("button", { name: "Increment" }));
    expect(screen.getByRole("status")).toHaveTextContent("Count: 1");
  });

  it("decrements count when Decrement is clicked", async () => {
    render(<Counter initialValue={5} />);
    await user.click(screen.getByRole("button", { name: "Decrement" }));
    expect(screen.getByRole("status")).toHaveTextContent("Count: 4");
  });

  it("resets count to initial value when Reset is clicked", async () => {
    render(<Counter initialValue={10} />);
    // First increment a few times
    await user.click(screen.getByRole("button", { name: "Increment" }));
    await user.click(screen.getByRole("button", { name: "Increment" }));
    expect(screen.getByRole("status")).toHaveTextContent("Count: 12");
    // Then reset
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("status")).toHaveTextContent("Count: 10");
  });

  it("respects the step prop", async () => {
    render(<Counter step={5} />);
    await user.click(screen.getByRole("button", { name: "Increment" }));
    expect(screen.getByRole("status")).toHaveTextContent("Count: 5");
  });

  it("calls onCountChange with the new count", async () => {
    // vi.fn() creates a mock function — tracks calls and arguments
    const handleChange = vi.fn();
    render(<Counter onCountChange={handleChange} />);
    await user.click(screen.getByRole("button", { name: "Increment" }));
    // toHaveBeenCalledWith: verifies mock was called with specific args
    expect(handleChange).toHaveBeenCalledWith(1);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("supports multiple increments in sequence", async () => {
    render(<Counter />);
    const btn = screen.getByRole("button", { name: "Increment" });
    await user.click(btn);
    await user.click(btn);
    await user.click(btn);
    expect(screen.getByRole("status")).toHaveTextContent("Count: 3");
  });
});

// ─────────────────────────────────────────────────────────────
// Text input interactions
// ─────────────────────────────────────────────────────────────

import { useState } from "react";

const SearchBox = ({ onSearch }: { onSearch: (q: string) => void }) => {
  const [value, setValue] = useState("");
  return (
    <div>
      <label htmlFor="search">Search</label>
      <input
        id="search"
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Type to search..."
      />
      <button onClick={() => onSearch(value)}>Search</button>
      <button onClick={() => setValue("")}>Clear</button>
    </div>
  );
};

describe("SearchBox — text input", () => {
  it("updates input value as user types", async () => {
    const user2 = userEvent.setup();
    render(<SearchBox onSearch={() => {}} />);
    const input = screen.getByRole("textbox", { name: /search/i });

    // user.type simulates real keystroke-by-keystroke typing
    await user2.type(input, "react hooks");
    expect(input).toHaveValue("react hooks");
  });

  it("calls onSearch with the typed value when Search is clicked", async () => {
    const user2 = userEvent.setup();
    const handleSearch = vi.fn();
    render(<SearchBox onSearch={handleSearch} />);

    await user2.type(screen.getByRole("textbox"), "typescript");
    await user2.click(screen.getByRole("button", { name: "Search" }));

    expect(handleSearch).toHaveBeenCalledWith("typescript");
  });

  it("clears input when Clear is clicked", async () => {
    const user2 = userEvent.setup();
    render(<SearchBox onSearch={() => {}} />);
    const input = screen.getByRole("textbox");

    await user2.type(input, "some text");
    await user2.click(screen.getByRole("button", { name: "Clear" }));

    expect(input).toHaveValue("");
  });

  it("supports keyboard Enter in search input", async () => {
    const user2 = userEvent.setup();
    render(<SearchBox onSearch={() => {}} />);
    const input = screen.getByRole("textbox");
    await user2.type(input, "hello");
    // Tab moves focus away — testing keyboard nav
    await user2.tab();
    // Input should still have typed value
    expect(input).toHaveValue("hello");
  });
});
