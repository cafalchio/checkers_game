import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium"
  },
  webServer: {
    command: "node tests/e2e/server.js",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI
  }
});
