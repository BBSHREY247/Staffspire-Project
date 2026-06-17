const express = require("express");

const router = express.Router();

router.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "StaffSpire API Working"
    });
});

module.exports = router;