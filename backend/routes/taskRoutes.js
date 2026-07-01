const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");
const {
    createTask, getAllTasks, getMyTasks, getTaskStats,
    getEmployeesForAssignment, getTaskById, updateTask, deleteTask
} = require("../controllers/taskController");

// Stats (Admin / Manager / Employee — each sees their own scope)
router.get("/stats", protect, getTaskStats);

// Employees list for the assignment dropdown (Admin / Manager)
router.get("/employees", protect, getEmployeesForAssignment);

// Employee: my tasks
router.get("/my", protect, getMyTasks);

// Admin / Manager: all tasks (with filters)
router.get("/", protect, getAllTasks);

// Admin / Manager: create task
router.post("/", protect, createTask);

// Single task detail (any authenticated user)
router.get("/:id", protect, getTaskById);

// Update task (Admin/Manager: full; Employee: status+remarks)
router.put("/:id", protect, updateTask);

// Delete task (Admin only)
router.delete("/:id", protect, adminOnly, deleteTask);

module.exports = router;
