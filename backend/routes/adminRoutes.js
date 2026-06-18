const express = require("express");

const router = express.Router();

const protect =
require("../middleware/authMiddleware");

const {
    adminOnly
} = require("../middleware/roleMiddleware");

router.get(
    "/dashboard",
    protect,
    adminOnly,
    (req,res)=>{
        res.json({
            success:true,
            message:"Welcome Admin Dashboard"
        });
    }
);

module.exports = router;