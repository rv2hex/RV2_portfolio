const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 120000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:8787",
    viewport: { width: 1440, height: 900 },
    launchOptions: process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}
  },
  webServer: {
    command: "python3 -m http.server 8787 --bind 127.0.0.1",
    url: "http://127.0.0.1:8787/index.html",
    reuseExistingServer: true,
    timeout: 15000
  }
});
