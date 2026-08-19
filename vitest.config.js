import { defineConfig } from "vitest/config";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 25000,
    hookTimeout: 25000,
    setupFiles: ["./tests/setup.js"],
    include: ["tests/**/*.test.js"],
    fileParallelism: false
  }
});
