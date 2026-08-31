// Simple Counter component used across multiple tests
import { useState } from "react";

interface CounterProps {
  initialValue?: number;
  step?: number;
  onCountChange?: (count: number) => void;
}

export const Counter = ({ initialValue = 0, step = 1, onCountChange }: CounterProps) => {
  const [count, setCount] = useState(initialValue);

  const update = (newCount: number) => {
    setCount(newCount);
    onCountChange?.(newCount);
  };

  return (
    <div>
      {/* aria-live: screen reader announces changes */}
      <p role="status" aria-live="polite">Count: {count}</p>
      <button onClick={() => update(count - step)}>Decrement</button>
      <button onClick={() => update(count + step)}>Increment</button>
      <button onClick={() => update(initialValue)}>Reset</button>
    </div>
  );
};
