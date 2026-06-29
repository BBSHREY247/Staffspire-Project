const db = require("../config/db");

const getEmployeeDashboard = async (req, res) => {
    
    try {
        const userId = req.user.id;

        // Fetch user account info
        const [users] = await db.promise().query(
            "SELECT * FROM employees WHERE id = ?",
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

        return res.status(200).json({
            success: true,
            employee: {
                name: emp.first_name ? `${emp.first_name} ${emp.last_name}` : user.name,
                employee_id: emp.employee_id || user.login_id || "N/A",
                department: emp.department || "N/A",
                designation: emp.designation || "N/A",
                email: emp.email || user.email,
                phone: emp.mobile || "N/A"
            }
        });
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
