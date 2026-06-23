const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    login,
    changePassword
} = require("../controllers/authController");

const {
    registerUser,
    loginUser,
    getProfile,
} = require("../controllers/authController");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/profile", protect, getProfile);

router.put(
    "/change-password",
    protect,
    changePassword
);

const {
    forgotPassword,
    resetPassword
}
=
require("../controllers/authController");

router.post(
    "/forgot-password",
    forgotPassword
);

router.put(
    "/reset-password",
    resetPassword
);

module.exports = router;
