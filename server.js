import express from "express";
import { emitLog } from "./logging.js";

const app = express();
const PORT = 3000;

// Healthcheck endpoint
app.get("/health", (req, res) => {
  emitLog("Healthcheck called", { endpoint: "/health" });
  res.json({ status: "ok" });
});

// Username endpoint
app.get("/api/username", (req, res) => {
  emitLog("Fetching username", { endpoint: "/api/username" });
  res.json({ username: "sourav" });
});

// Greeting endpoint
app.get("/api/greet/:name", (req, res) => {
  const { name } = req.params;
  emitLog("Greeting user", { endpoint: "/api/greet", user: name });
  res.json({ message: `Hello, ${name}!` });
});

//
// 404 handler for unknown routes
//
app.use((req, res, next) => {
  emitLog("Invalid endpoint requested", {
    endpoint: req.originalUrl,
    method: req.method,
  }, { forceSpan: true });
  res.status(404).json({ error: "Not Found" });
});

//
// Error handler for unexpected server errors
//
app.use((err, req, res, next) => {
  emitLog("Server error", {
    endpoint: req.originalUrl,
    method: req.method,
    error: err.message,
  }, { forceSpan: true });
  console.error("❌ Unexpected error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  emitLog("Server started", { port: PORT });
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
