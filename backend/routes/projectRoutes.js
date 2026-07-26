const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
    createProject, getAllProjects, getProjectById, updateProject, deleteProject, archiveProject,
    addMember, removeMember,
    createMilestone, updateMilestone, deleteMilestone,
    getProjectAnalytics
} = require("../controllers/projectController");

// Use auth middleware on all routes
router.use(authMiddleware);

// Analytics
router.get("/analytics", getProjectAnalytics);

// Members (Must be defined before /:id routes)
router.post("/members", addMember);
router.delete("/members", removeMember);

// Milestones
router.post("/milestones", createMilestone);
router.put("/milestones/:id", updateMilestone);
router.delete("/milestones/:id", deleteMilestone);

// Projects CRUD
router.post("/", createProject);
router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.put("/:id/archive", archiveProject);

module.exports = router;
