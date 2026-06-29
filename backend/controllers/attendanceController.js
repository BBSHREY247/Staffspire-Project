const db = require("../config/db");

// Helper: Get employee_id for the logged-in user
const getEmployeeIdFromUser = async (userId) => {
    const [users] = await db.promise().query("SELECT email FROM users WHERE id = ?", [userId]);
    if (users.length === 0) return null;
    
    const [employees] = await db.promise().query("SELECT employee_id FROM employees WHERE email = ?", [users[0].email]);
    if (employees.length === 0) return null;
    
    return employees[0].employee_id;
};

// 1. POST /api/attendance/check-in
const checkIn = async (req, res) => {
    try {
        const employeeId = await getEmployeeIdFromUser(req.user.id);
        if (!employeeId) {
            return res.status(404).json({
                success: false,
                message: "Employee profile not found or user is not an employee."
            });
        }

        const localDate = new Date().toLocaleDateString('sv');
        const checkInTime = new Date().toTimeString().split(" ")[0]; // HH:MM:SS

        // Check if already checked in today
        const [existing] = await db.promise().query(
            "SELECT id FROM attendance WHERE employee_id = ? AND attendance_date = ?",
            [employeeId, localDate]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Attendance already marked for today."
            });
        }

        // Determine status (Present or Late, threshold e.g. 09:15:00)
        let status = "Present";
        if (checkInTime > "09:15:00") {
            status = "Late";
        }   

        await db.promise().query(
            "INSERT INTO attendance (employee_id, attendance_date, check_in, status) VALUES (?, ?, ?, ?)",
            [employeeId, localDate, checkInTime, status]
        );

        return res.status(200).json({
            success: true,
            message: "Checked in successfully.",
            data: {
                attendance_date: localDate,
                check_in: checkInTime,
                status
            }
        });
    } catch (error) {
        console.error("Check-in error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during check-in."
        });
    }
};

// 2. POST /api/attendance/check-out
const checkOut = async (req, res) => {
    try {
        const employeeId = await getEmployeeIdFromUser(req.user.id);
        if (!employeeId) {
            return res.status(404).json({
                success: false,
                message: "Employee profile not found."
            });
        }

        const localDate = new Date().toLocaleDateString('sv');
        const checkOutTime = new Date().toTimeString().split(" ")[0]; // HH:MM:SS

        // Get today's attendance record
        const [rows] = await db.promise().query(
            "SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = ?",
            [employeeId, localDate]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please check in first."
            });
        }

        const record = rows[0];
        if (record.check_out) {
            return res.status(400).json({
                success: false,
                message: "Already checked out for today."
            });
        }

        // Calculate working hours
        const [inH, inM, inS] = record.check_in.split(":").map(Number);
        const [outH, outM, outS] = checkOutTime.split(":").map(Number);

        let inSeconds = inH * 3600 + inM * 60 + inS;
        let outSeconds = outH * 3600 + outM * 60 + outS;
        let diffSeconds = outSeconds - inSeconds;
        if (diffSeconds < 0) diffSeconds = 0;

        const diffH = Math.floor(diffSeconds / 3600);
        const diffM = Math.floor((diffSeconds % 3600) / 60);
        const diffS = diffSeconds % 60;

        const workingHours = [
            String(diffH).padStart(2, '0'),
            String(diffM).padStart(2, '0'),
            String(diffS).padStart(2, '0')
        ].join(":");

        // Determine final status (Half Day if less than 4 hours, else keep Present/Late)
        let status = record.status;
        if (diffSeconds < 4 * 3600) {
            status = "Half Day";
        }

        await db.promise().query(
            "UPDATE attendance SET check_out = ?, working_hours = ?, status = ? WHERE id = ?",
            [checkOutTime, workingHours, status, record.id]
        );

        return res.status(200).json({
            success: true,
            message: "Checked out successfully.",
            data: {
                check_out: checkOutTime,
                working_hours: workingHours,
                status
            }
        });
    } catch (error) {
        console.error("Check-out error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during check-out."
        });
    }
};

// 3. GET /api/attendance/today
const getTodayStatus = async (req, res) => {
    try {
        const employeeId = await getEmployeeIdFromUser(req.user.id);
        if (!employeeId) {
            return res.status(404).json({
                success: false,
                message: "Employee profile not found."
            });
        }

        const localDate = new Date().toLocaleDateString('sv');
        const [rows] = await db.promise().query(
            "SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = ?",
            [employeeId, localDate]
        );

        return res.status(200).json({
            success: true,
            attendance: rows[0] || null
        });
    } catch (error) {
        console.error("Get today status error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load today's status."
        });
    }
};

// 4. GET /api/attendance/history (for current employee)
const getEmployeeHistory = async (req, res) => {
    try {
        const employeeId = await getEmployeeIdFromUser(req.user.id);
        if (!employeeId) {
            return res.status(404).json({
                success: false,
                message: "Employee profile not found."
            });
        }

        const [rows] = await db.promise().query(
            "SELECT * FROM attendance WHERE employee_id = ? ORDER BY attendance_date DESC",
            [employeeId]
        );

        return res.status(200).json({
            success: true,
            history: rows
        });
    } catch (error) {
        console.error("Get history error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load attendance history."
        });
    }
};

// 5. GET /api/attendance (Admin view: gets all attendance records)
const getAllAttendance = async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            `SELECT a.*, e.first_name, e.last_name, e.department, e.designation 
             FROM attendance a
             JOIN employees e ON a.employee_id = e.employee_id
             ORDER BY a.attendance_date DESC, a.check_in DESC`
        );

        return res.status(200).json({
            success: true,
            attendance: rows
        });
    } catch (error) {
        console.error("Get all attendance error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load attendance details."
        });
    }
};

// 6. GET /api/attendance/:employeeId (Admin view: history for specific employee)
const getEmployeeAttendance = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const [rows] = await db.promise().query(
            `SELECT a.*, e.first_name, e.last_name, e.department, e.designation 
             FROM attendance a
             JOIN employees e ON a.employee_id = e.employee_id
             WHERE a.employee_id = ?
             ORDER BY a.attendance_date DESC`,
            [employeeId]
        );

        return res.status(200).json({
            success: true,
            history: rows
        });
    } catch (error) {
        console.error("Get employee attendance error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load specific employee attendance history."
        });
    }
};

module.exports = {
    checkIn,
    checkOut,
    getTodayStatus,
    getEmployeeHistory,
    getAllAttendance,
    getEmployeeAttendance
};
