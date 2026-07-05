const db = require("../config/db");

// Helper: Get employee_id for the logged-in user
const getEmployeeIdFromUser = async (userId) => {
    const [users] = await db.promise().query("SELECT email FROM users WHERE id = ?", [userId]);
    if (users.length === 0) return null;

    const [employees] = await db.promise().query("SELECT employee_id FROM employees WHERE email = ?", [users[0].email]);
    if (employees.length === 0) return null;

    return employees[0].employee_id;
};

const getManagerDepartment = async (userId) => {
    const [users] = await db.promise().query("SELECT email FROM users WHERE id = ?", [userId]);
    if (users.length === 0) return null;
    const [employees] = await db.promise().query("SELECT department FROM employees WHERE email = ?", [users[0].email]);
    return employees.length ? employees[0].department : null;
};

// 1. GET /api/leaves/types — fetch all leave types for the apply form dropdown
const getLeaveTypes = async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT id, name FROM leave_types ORDER BY name ASC");
        return res.status(200).json({ success: true, types: rows });
    } catch (error) {
        console.error("Get leave types error:", error);
        return res.status(500).json({ success: false, message: "Failed to load leave types." });
    }
};

// 2. POST /api/leaves/apply
const applyLeave = async (req, res) => {
    try {
        const employeeId = await getEmployeeIdFromUser(req.user.id);
        if (!employeeId) {
            return res.status(404).json({ success: false, message: "Employee profile not found." });
        }

        const { leave_type_id, start_date, end_date, reason } = req.body;
        if (!leave_type_id || !start_date || !end_date || !reason) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const start = new Date(start_date);
        const end = new Date(end_date);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        if (totalDays <= 0) {
            return res.status(400).json({ success: false, message: "End Date must be after or equal to Start Date." });
        }

        await db.promise().query(
            `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, status)
             VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
            [employeeId, leave_type_id, start_date, end_date, totalDays, reason]
        );

        return res.status(200).json({
            success: true,
            message: "Leave request submitted successfully. Waiting for admin approval."
        });
    } catch (error) {
        console.error("Apply leave error:", error);
        return res.status(500).json({ success: false, message: "Server error during leave application." });
    }
};

// 3. GET /api/leaves/history
const getLeaveHistory = async (req, res) => {
    try {
        const employeeId = await getEmployeeIdFromUser(req.user.id);
        if (!employeeId) {
            return res.status(404).json({ success: false, message: "Employee profile not found." });
        }

        const [rows] = await db.promise().query(
            `SELECT lr.*, lt.name AS leave_type_name
             FROM leave_requests lr
             JOIN leave_types lt ON lr.leave_type_id = lt.id
             WHERE lr.employee_id = ?
             ORDER BY lr.created_at DESC`,
            [employeeId]
        );

        return res.status(200).json({ success: true, history: rows });
    } catch (error) {
        console.error("Get leave history error:", error);
        return res.status(500).json({ success: false, message: "Failed to load leave history." });
    }
};

// 4. DELETE /api/leaves/cancel/:id
const cancelLeaveRequest = async (req, res) => {
    try {
        const employeeId = await getEmployeeIdFromUser(req.user.id);
        const { id } = req.params;

        const [rows] = await db.promise().query("SELECT * FROM leave_requests WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Request not found." });
        }

        const request = rows[0];
        if (request.employee_id !== employeeId) {
            return res.status(403).json({ success: false, message: "Unauthorized request cancellation." });
        }

        if (request.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Only pending leave requests can be cancelled." });
        }

        await db.promise().query("DELETE FROM leave_requests WHERE id = ?", [id]);
        return res.status(200).json({ success: true, message: "Leave request cancelled successfully." });
    } catch (error) {
        console.error("Cancel leave request error:", error);
        return res.status(500).json({ success: false, message: "Failed to cancel request." });
    }
};

// 5. GET /api/leaves/admin/requests
const adminGetLeaveRequests = async (req, res) => {
    try {
        const role = req.user.role;
        let query = `
            SELECT lr.*, lt.name AS leave_type_name, e.first_name, e.last_name, e.department, e.designation
            FROM leave_requests lr
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            JOIN employees e ON lr.employee_id = e.employee_id
        `;
        const params = [];
        if (role === "Manager") {
            const dept = await getManagerDepartment(req.user.id);
            if (dept) {
                query += " WHERE e.department = ?";
                params.push(dept);
            } else {
                return res.status(200).json({ success: true, requests: [] });
            }
        }
        query += " ORDER BY lr.created_at DESC";

        const [rows] = await db.promise().query(query, params);
        return res.status(200).json({ success: true, requests: rows });
    } catch (error) {
        console.error("Admin fetch leave requests error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch leave requests." });
    }
};

// 6. POST /api/leaves/admin/action — Approve or Reject (management decides)
const adminLeaveAction = async (req, res) => {
    try {
        const { id, action, rejection_remarks } = req.body;
        if (!id || !action || !['Approved', 'Rejected'].includes(action)) {
            return res.status(400).json({ success: false, message: "Invalid action request parameters." });
        }

        const [requests] = await db.promise().query(
            `SELECT lr.*, e.department 
             FROM leave_requests lr 
             JOIN employees e ON lr.employee_id = e.employee_id 
             WHERE lr.id = ?`,
            [id]
        );

        if (requests.length === 0) {
            return res.status(404).json({ success: false, message: "Leave request not found." });
        }

        if (req.user.role === "Manager") {
            const dept = await getManagerDepartment(req.user.id);
            if (requests[0].department !== dept) {
                return res.status(403).json({ success: false, message: "Forbidden: Employee is not in your department." });
            }
        }

        if (requests[0].status !== "Pending") {
            return res.status(400).json({ success: false, message: "Request has already been processed." });
        }

        if (action === "Approved") {
            await db.promise().query("UPDATE leave_requests SET status = 'Approved' WHERE id = ?", [id]);
        } else {
            await db.promise().query(
                "UPDATE leave_requests SET status = 'Rejected', rejection_remarks = ? WHERE id = ?",
                [rejection_remarks || null, id]
            );
        }

        return res.status(200).json({
            success: true,
            message: `Leave request has been successfully ${action.toLowerCase()}.`
        });
    } catch (error) {
        console.error("Admin leave action error:", error);
        return res.status(500).json({ success: false, message: "Failed to process leave action." });
    }
};

// 7. GET /api/leaves/admin/stats
const adminGetLeaveStats = async (req, res) => {
    try {
        const today = new Date().toLocaleDateString('sv');
        const role = req.user.role;
        let filter = "";
        const params = [];

        if (role === "Manager") {
            const dept = await getManagerDepartment(req.user.id);
            if (dept) {
                filter = " AND lr.employee_id IN (SELECT employee_id FROM employees WHERE department = ?)";
                params.push(dept);
            } else {
                return res.status(200).json({
                    success: true,
                    stats: {
                        pending: 0,
                        approvedToday: 0,
                        rejectedToday: 0,
                        currentlyOnLeave: 0
                    }
                });
            }
        }

        const [pendingRes] = await db.promise().query(
            `SELECT COUNT(*) AS count FROM leave_requests lr WHERE lr.status = 'Pending'${filter}`,
            params
        );
        const [approvedRes] = await db.promise().query(
            `SELECT COUNT(*) AS count FROM leave_requests lr WHERE lr.status = 'Approved' AND DATE(lr.updated_at) = ?${filter}`,
            [today, ...params]
        );
        const [rejectedRes] = await db.promise().query(
            `SELECT COUNT(*) AS count FROM leave_requests lr WHERE lr.status = 'Rejected' AND DATE(lr.updated_at) = ?${filter}`,
            [today, ...params]
        );
        const [onLeaveRes] = await db.promise().query(
            `SELECT COUNT(DISTINCT lr.employee_id) AS count FROM leave_requests lr
             WHERE lr.status = 'Approved' AND ? BETWEEN lr.start_date AND lr.end_date${filter}`,
            [today, ...params]
        );

        return res.status(200).json({
            success: true,
            stats: {
                pending: pendingRes[0].count,
                approvedToday: approvedRes[0].count,
                rejectedToday: rejectedRes[0].count,
                currentlyOnLeave: onLeaveRes[0].count
            }
        });
    } catch (error) {
        console.error("Get leave stats error:", error);
        return res.status(500).json({ success: false, message: "Failed to load leave statistics." });
    }
};

module.exports = {
    getLeaveTypes,
    applyLeave,
    getLeaveHistory,
    cancelLeaveRequest,
    adminGetLeaveRequests,
    adminLeaveAction,
    adminGetLeaveStats
};
