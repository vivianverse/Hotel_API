require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { connectDB } = require("./config/db");

// Routers
const roomsRouter = require("./routes/rooms");
const guestsRouter = require("./routes/guests");
const bookingsRouter = require("./routes/bookings");

const app = express();

// --- Middleware ---
// JSON body parser
app.use(express.json());

// Logger
app.use(morgan("dev"));

// Explicit CORS configuration (handles preflight OPTIONS requests)
const corsOptions = {
  // reflect the request origin (safe for many scenarios).
  // If you prefer to restrict origins in production, replace origin: true with an array or function.
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
  credentials: true,
  maxAge: 86400, // Cache preflight for 1 day
};

// Apply CORS for all routes
app.use(cors(corsOptions));
// Ensure OPTIONS preflight is handled for all routes
app.options("*", cors(corsOptions));

// --- Health check ---
app.get("/health", (_req, res) => res.json({ ok: true }));

// --- API routes ---
// Mount API routers after CORS middleware
app.use("/api/rooms", roomsRouter);
app.use("/api/guests", guestsRouter);
app.use("/api/bookings", bookingsRouter);

// 404 for unknown API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err && err.stack ? err.stack : err);
  const status = err && err.status ? err.status : 500;
  const payload = {
    message: err && err.message ? err.message : "Internal Server Error",
  };
  // In development expose stack
  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
});

// --- Start server after DB connect ---
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API running on port ${PORT}`);
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 API Rooms endpoint: http://localhost:${PORT}/api/rooms`);
      console.log(`📍 API Guests endpoint: http://localhost:${PORT}/api/guests`);
      console.log(`📍 API Bookings endpoint: http://localhost:${PORT}/api/bookings`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect DB:", err);
    if (process.env.NODE_ENV === "production") {
      console.error("Exiting because database is required in production.");
      process.exit(1);
    }
    console.warn("Continuing to run server in development without DB connection. Some routes may fail.");
    app.listen(PORT, () => console.log(`API running on port ${PORT} (no DB)`));
  });

module.exports = app;
