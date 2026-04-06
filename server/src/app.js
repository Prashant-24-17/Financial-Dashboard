const express = require("express");
const cors = require("cors");
const auth = require("./middleware/auth");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const sessionRoutes = require("./routes/sessionRoutes");
const userRoutes = require("./routes/userRoutes");
const recordRoutes = require("./routes/recordRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/api/session", sessionRoutes);
app.use("/api/users", auth, userRoutes);
app.use("/api/records", auth, recordRoutes);
app.use("/api/dashboard", auth, dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
