import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  // tsconfig sets "jsx": "preserve" because that is what Next expects -- the
  // Next compiler does the transform. Vitest has no Next compiler, so esbuild
  // inherited "preserve" and emitted JSX that fell back to the classic runtime,
  // requiring `React` to be in scope in every component. Next does not, so
  // components that are correct in the app ("ReferenceError: React is not
  // defined" under test) failed only in tests. Matching Next's automatic
  // runtime here tests the components the way they actually ship.
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "__tests__/**/*.test.{ts,tsx}",
      "lib/**/*.test.{ts,tsx}",
      "components/**/*.test.{ts,tsx}",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "e2e/",
        "**/*.d.ts",
        "**/*.config.*",
        "vitest.setup.ts",
      ],
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    // Without this, vi.stubEnv() in one test file leaks into the next file
    // running in the same worker.
    unstubEnvs: true,
    unstubGlobals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
