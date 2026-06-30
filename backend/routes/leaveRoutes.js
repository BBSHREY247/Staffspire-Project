const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");
const {
    getLeaveTypes,
    applyLeave,
    getLeaveHistory,
    cancelLeaveRequest,
    adminGetLeaveRequests,
    adminLeaveAction,
    adminGetLeaveStats
} = require("../controllers/leaveController");

// Employee Endpoints
router.get("/types", getLeaveTypes);
router.post("/apply", protect, applyLeave);
router.get("/history", protect, getLeaveHistory);
router.delete("/cancel/:id", protect, cancelLeaveRequest);

// Admin Endpoints
router.get("/admin/requests", protect, adminOnly, adminGetLeaveRequests);
router.post("/admin/action", protect, adminOnly, adminLeaveAction);
router.get("/admin/stats", protect, adminOnly, adminGetLeaveStats);

module.exports = router;
