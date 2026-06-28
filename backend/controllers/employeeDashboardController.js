const db = require("../config/db");

const getEmployeeDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user account info
        const [users] = await db.promise().query(
            "SELECT * FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const user = users[0];

        // Fetch employee personal details
        const [employees] = await db.promise().query(
            "SELECT * FROM employees WHERE email = ?",
            [user.email]
        );
        const emp = employees[0] || {};

        const dashboardData = {
            success: true,
            employee: {
                name: emp.first_name ? `${emp.first_name} ${emp.last_name}` : user.name,
                employee_id: emp.employee_id || user.login_id || "N/A",
                department: emp.department || "N/A",
                designation: emp.designation || "N/A",
                email: emp.email || user.email,
                phone: emp.mobile || "N/A"
            },
            attendance: {
                percentage: 95,
                today: "Present"
            },
            leave: {
                pending: 2,
                remaining: 10,
                casual: 10,
                sick: 5,
                paid: 12
            },
            tasks: {
                active: 3,
                dueToday: 1,
                list: [
                    { id: 1, title: "Complete Monthly Report", done: false },
                    { id: 2, title: "Update Profile", done: false },
                    { id: 3, title: "Attend Team Meeting", done: false }
                ]
            },
            activity: [
                { id: 1, text: "Checked In", time: "Today" },
                { id: 2, text: "Leave Approved", time: "Yesterday" },
                { id: 3, text: "Password Changed", time: "2 Days Ago" }
            ]
        };

        return res.status(200).json(dashboardData);
    } catch (error) {
        console.error("Employee dashboard controller error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data"
        });
    }
};

module.exports = {
    getEmployeeDashboard
};
