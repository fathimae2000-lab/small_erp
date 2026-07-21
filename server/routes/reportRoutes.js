const express = require("express");
const router = express.Router();
const {
  getReportsSummary,
  getOrdersReport,
} = require("../controllers/reportController");

router.get("/summary", getReportsSummary);
router.get("/orders", getOrdersReport);

module.exports = router;