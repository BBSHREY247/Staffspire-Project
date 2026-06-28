require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const adminRoutes = require("./routes/adminRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const employeeDashboardRoutes = require("./routes/employeeDashboardRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

require("./config/db");

const authRoutes = require("./routes/authRoutes");
app.use(
    "/api/admin",
    adminRoutes
);

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.use(
    "/api/employees",
    employeeRoutes
);

app.use(
    "/api/employee",
    employeeDashboardRoutes
);

app.get("/", (req, res) => {
    res.send("StaffSpire Backend Running");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const departmentRoutes =
require("./routes/departmentRoutes");

app.use(
    "/api/departments",
    departmentRoutes
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});