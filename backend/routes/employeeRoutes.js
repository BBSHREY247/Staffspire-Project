const express = require("express");

const router = express.Router();

const protect =
require("../middleware/authMiddleware");

const {
    adminOnly
} = require("../middleware/roleMiddleware");

const {
    getEmployees,
    createEmployee
} = require(
    "../controllers/employeeController"
);

router.get(
    "/",
    protect,
    adminOnly,
    getEmployees
);

router.post(
    "/",
    protect,
    adminOnly,
    createEmployee
);

module.exports = router;