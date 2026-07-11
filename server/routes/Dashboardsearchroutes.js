

const express = require("express");
const router = express.Router();
const { searchDashboard } = require("../controllers/Dashboardsearchroutes");
const { protect } = require("../middlewares/userMiddleware");

router.get("/", protect, searchDashboard);

module.exports = router;

