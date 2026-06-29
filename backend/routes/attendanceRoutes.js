const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");
const {
    checkIn,
    checkOut,
    getTodayStatus,
    getEmployeeHistory,
    getAllAttendance,
    getEmployeeAttendance
} = require("../controllers/attendanceController");

// Employee routes (Requires general JWT authentication)
router.post("/check-in", protect, checkIn);
router.post("/check-out", protect, checkOut);
router.get("/today", protect, getTodayStatus);
router.get("/history", protect, getEmployeeHistory);

// Admin routes (Requires Admin authorization)
router.get("/", protect, adminOnly, getAllAttendance);
router.get("/:employeeId", protect, adminOnly, getEmployeeAttendance);

module.exports = router;
