/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom to simulate the browser DOM environment in tests
    environment: "jsdom",
    // Run this setup file before each test — imports jest-dom matchers
    setupFiles: "./src/test/setup.ts",
    // Expose describe/it/expect globally (no need to import in each test)
    globals: true,
  },
});
