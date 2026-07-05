const db = require("../config/db");

// Helper: Haversine distance formula in meters
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371e3; // Earth's radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c); // Distance in meters
};

// Helper: Get employee_id for the logged-in user
const getEmployeeIdFromUser = async (userId) => {
    const [users] = await db.promise().query("SELECT email FROM users WHERE id = ?", [userId]);
    if (users.length === 0) return null;
    
    const [employees] = await db.promise().query("SELECT employee_id FROM employees WHERE email = ?", [users[0].email]);
    if (employees.length === 0) return null;
    
    return employees[0].employee_id;
};

// Helper: Retrieve office geofence settings (fallback to default head office if not set)
const getGeofenceSettings = async () => {
    const [rows] = await db.promise().query("SELECT * FROM office_settings LIMIT 1");
    if (rows.length > 0) {
        return rows[0];
    }
    return {
        office_name: "Head Office",
        latitude: 18.52040000,
        longitude: 73.85670000,
        attendance_radius: 100.0
    };
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

        // ── LIVE LOCATION TEMPORARILY DISABLED ──────────────────────────────
        // const { latitude, longitude, accuracy } = req.body;
        // if (latitude === undefined || longitude === undefined) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Location permissions and coordinates are required to mark attendance."
        //     });
        // }
        // ────────────────────────────────────────────────────────────────────

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

        // ── GEOFENCE CALCULATION TEMPORARILY DISABLED ───────────────────────
        // const office = await getGeofenceSettings();
        // const distance = calculateDistance(
        //     parseFloat(latitude), parseFloat(longitude),
        //     parseFloat(office.latitude), parseFloat(office.longitude)
        // );
        // const locationStatus = distance <= office.attendance_radius ? "Inside Office" : "Outside Office";
        // const locationCapturedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        // ────────────────────────────────────────────────────────────────────

        // Determine status (Present or Late, threshold 09:15:00)
        let status = "Present";
        if (checkInTime > "09:15:00") {
            status = "Late";
        }

        await db.promise().query(
            `INSERT INTO attendance (employee_id, attendance_date, check_in, status)
             VALUES (?, ?, ?, ?)`,
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

        // ── LIVE LOCATION TEMPORARILY DISABLED ──────────────────────────────
        // const { latitude, longitude, accuracy } = req.body;
        // if (latitude === undefined || longitude === undefined) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Location permissions and coordinates are required to mark attendance."
        //     });
        // }
        // ────────────────────────────────────────────────────────────────────

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

        // ── GEOFENCE CALCULATION TEMPORARILY DISABLED ───────────────────────
        // const office = await getGeofenceSettings();
        // const distance = calculateDistance(
        //     parseFloat(latitude), parseFloat(longitude),
        //     parseFloat(office.latitude), parseFloat(office.longitude)
        // );
        // const locationStatus = distance <= office.attendance_radius ? "Inside Office" : "Outside Office";
        // const locationCapturedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        // ────────────────────────────────────────────────────────────────────

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
            `UPDATE attendance SET check_out = ?, working_hours = ?, status = ? WHERE id = ?`,
            [checkOutTime, workingHours, status, record.id]
        );

        return res.status(200).json({
            success: true,
            message: "Checked out successfully.",
            // locationStatus,
            distance,
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

const getManagerDepartment = async (userId) => {
    const [users] = await db.promise().query("SELECT email FROM users WHERE id = ?", [userId]);
    if (users.length === 0) return null;
    const [employees] = await db.promise().query("SELECT department FROM employees WHERE email = ?", [users[0].email]);
    return employees.length ? employees[0].department : null;
};

// 5. GET /api/attendance (Admin view: gets all attendance records)
const getAllAttendance = async (req, res) => {
    try {
        const role = req.user.role;
        let query = `
            SELECT a.*, e.first_name, e.last_name, e.department, e.designation 
            FROM attendance a
            JOIN employees e ON a.employee_id = e.employee_id
        `;
        const params = [];
        if (role === "Manager") {
            const dept = await getManagerDepartment(req.user.id);
            if (dept) {
                query += " WHERE e.department = ?";
                params.push(dept);
            } else {
                return res.status(200).json({ success: true, attendance: [] });
            }
        }
        query += " ORDER BY a.attendance_date DESC, a.check_in DESC";

        const [rows] = await db.promise().query(query, params);

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
        const role = req.user.role;

        const [rows] = await db.promise().query(
            `SELECT a.*, e.first_name, e.last_name, e.department, e.designation 
             FROM attendance a
             JOIN employees e ON a.employee_id = e.employee_id
             WHERE a.employee_id = ?
             ORDER BY a.attendance_date DESC`,
            [employeeId]
        );

        if (rows.length > 0 && role === "Manager") {
            const dept = await getManagerDepartment(req.user.id);
            if (rows[0].department !== dept) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden: Employee is not in your department."
                });
            }
        }

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
