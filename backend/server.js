require("dotenv").config();
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
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
    res.send("Staffspire Backend Running");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const departmentRoutes =
    require("./routes/departmentRoutes");

app.use(
    "/api/departments",
    departmentRoutes
);

const attendanceRoutes = require("./routes/attendanceRoutes");
app.use("/api/attendance", attendanceRoutes);

const officeSettingsRoutes = require("./routes/officeSettingsRoutes");
app.use("/api/office-settings", officeSettingsRoutes);

const leaveRoutes = require("./routes/leaveRoutes");
app.use("/api/leaves", leaveRoutes);

const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks", taskRoutes);

const projectRoutes = require("./routes/projectRoutes");
app.use("/api/projects", projectRoutes);

const reportRoutes = require("./routes/reportRoutes");
app.use("/api/reports", reportRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

const cron = require("node-cron");
const { autoMarkAbsents } = require("./controllers/attendanceController");

// Schedule auto-marking of absents at 8:45 AM daily
cron.schedule("45 8 * * *", () => {
    console.log("Running scheduled autoMarkAbsents task...");
    autoMarkAbsents();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});