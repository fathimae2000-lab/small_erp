const express = require("express");
const router = express.Router();
const { getReportsDashboard } = require("../controllers/reportController");

// Reports Dashboard Route
router.get("/dashboard", getReportsDashboard);

module.exports = router;