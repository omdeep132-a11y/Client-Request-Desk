const express = require("express");

// Register all models — MUST come before any route that uses .populate()
require("./Models/Workspace");
require("./Models/User");
require("./Models/Request");
require("./Models/WorkItem");
require("./Models/Activity");

const authRoutes = require("./routes/auth");
const requestRoutes = require("./routes/requests");

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);

app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

module.exports = app;