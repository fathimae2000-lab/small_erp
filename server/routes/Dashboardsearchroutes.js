// routes/dashboardRoutes.js
//
// Mounts the global search endpoint. Adjust the auth middleware import
// to match whatever you're already using to verify the Bearer token
// (the AppBar sends `Authorization: Bearer <token>` from localStorage).

const express = require("express");
const router = express.Router();
const { searchDashboard } = require("../controllers/Dashboardsearchroutes");
const { protect } = require("../middlewares/userMiddleware");

router.get("/", protect, searchDashboard);

module.exports = router;

// In your main app.js / server.js, mount this with:
//   const dashboardRoutes = require("./routes/dashboardRoutes");
//   app.use("/api/dashboard", dashboardRoutes);