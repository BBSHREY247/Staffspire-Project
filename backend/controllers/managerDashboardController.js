const db = require("../config/db");

// Helper: Get employee info from logged-in user
const getEmployeeFromUser = async (userId) => {
    const [users] = await db.promise().query("SELECT email FROM users WHERE id = ?", [userId]);
    if (!users.length) return null;
    const [emps] = await db.promise().query("SELECT * FROM employees WHERE email = ?", [users[0].email]);
    return emps.length ? emps[0] : null;
};

const getManagerDashboardInfo = async (req, res) => {
    try {
        const emp = await getEmployeeFromUser(req.user.id);
        if (!emp) {
            return res.status(404).json({
                success: false,
                message: "Manager profile not found in employee records."
            });
        }

        const deptName = emp.department;
        const managerName = `${emp.first_name} ${emp.last_name}`;
        const todayStr = new Date().toLocaleDateString('sv'); // YYYY-MM-DD

        // 1. Employees count in department
        const [[{ employeeCount }]] = await db.promise().query(
            "SELECT COUNT(*) AS employeeCount FROM employees WHERE department = ? AND status = 'Active'",
            [deptName]
        );

        // 2. Attendance Stats (Present, Late, Absent)
        // Present/Late today in department
        const [attRows] = await db.promise().query(
            `SELECT a.status, a.check_out, a.working_hours, e.first_name, e.last_name 
             FROM attendance a 
             JOIN employees e ON a.employee_id = e.employee_id 
             WHERE e.department = ? AND a.attendance_date = ?`,
            [deptName, todayStr]
        );

        const presentCount = attRows.filter(r => r.status === "Present" || r.status === "Late" || r.status === "Half Day").length;
        const lateCount = attRows.filter(r => r.status === "Late").length;
        const absentCount = Math.max(0, employeeCount - presentCount);
        const attendancePercentage = employeeCount > 0 ? Math.round((presentCount / employeeCount) * 100) : 0;

        // 3. Pending Leaves count
        const [[{ pendingLeaves }]] = await db.promise().query(
            `SELECT COUNT(*) AS pendingLeaves 
             FROM leave_requests lr
             JOIN employees e ON lr.employee_id = e.employee_id
             WHERE e.department = ? AND lr.status = 'Pending'`,
            [deptName]
        );

        // 4. Tasks Stats (Active vs Completed)
        const [[{ activeTasks }]] = await db.promise().query(
            "SELECT COUNT(*) AS activeTasks FROM tasks WHERE department = ? AND status != 'Completed'",
            [deptName]
        );

        const [[{ completedTasks }]] = await db.promise().query(
            "SELECT COUNT(*) AS completedTasks FROM tasks WHERE department = ? AND status = 'Completed'",
            [deptName]
        );

        // 5. Recent Activity Feed (Aggregation)
        const activities = [];

        // - Attendance logs
        const [attendanceLogs] = await db.promise().query(
            `SELECT a.check_in, a.check_out, a.working_hours, a.status, e.first_name, e.last_name, a.created_at
             FROM attendance a
             JOIN employees e ON a.employee_id = e.employee_id
             WHERE e.department = ? AND a.attendance_date = ?
             ORDER BY a.check_in DESC LIMIT 5`,
            [deptName, todayStr]
        );

        attendanceLogs.forEach(log => {
            // Check-in activity
            activities.push({
                text: `${log.first_name} ${log.last_name} checked in (${log.status})`,
                time: log.check_in,
                timestamp: new Date(`${todayStr}T${log.check_in}`).getTime(),
                type: "attendance"
            });
            // Check-out activity if occurred
            if (log.check_out) {
                activities.push({
                    text: `${log.first_name} ${log.last_name} checked out (worked ${log.working_hours})`,
                    time: log.check_out,
                    timestamp: new Date(`${todayStr}T${log.check_out}`).getTime(),
                    type: "checkout"
                });
            }
        });

        // - Leave requests logs
        const [leaveLogs] = await db.promise().query(
            `SELECT lr.created_at, lr.status, e.first_name, e.last_name, lt.name AS leave_type, lr.updated_at
             FROM leave_requests lr
             JOIN employees e ON lr.employee_id = e.employee_id
             JOIN leave_types lt ON lr.leave_type_id = lt.id
             WHERE e.department = ?
             ORDER BY lr.created_at DESC LIMIT 5`,
            [deptName]
        );

        leaveLogs.forEach(log => {
            const dateObj = new Date(log.created_at);
            activities.push({
                text: `${log.first_name} ${log.last_name} submitted a ${log.leave_type} request`,
                time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: dateObj.getTime(),
                type: "leave"
            });
        });

        // - Task updates
        const [taskLogs] = await db.promise().query(
            `SELECT t.task_title, t.status, t.updated_at, CONCAT(e.first_name, ' ', e.last_name) AS emp_name
             FROM tasks t
             JOIN employees e ON t.employee_id = e.employee_id
             WHERE t.department = ?
             ORDER BY t.updated_at DESC LIMIT 5`,
            [deptName]
        );

        taskLogs.forEach(log => {
            const dateObj = new Date(log.updated_at);
            const statusText = log.status === "Completed" ? "completed" : `marked task as '${log.status}'`;
            activities.push({
                text: `${log.emp_name} ${statusText} for task: "${log.task_title}"`,
                time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: dateObj.getTime(),
                type: "task"
            });
        });

        // Sort combined activity logs by timestamp DESC
        activities.sort((a, b) => b.timestamp - a.timestamp);
        const finalActivities = activities.slice(0, 10); // Keep top 10

        // 6. Attendance Trend for this department (Mon to Fri of the current week)
        const trendLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const trendData = [];
        const currentMonday = new Date();
        const dayOfWeek = currentMonday.getDay();
        const diffDays = currentMonday.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const mondayDate = new Date(currentMonday.setDate(diffDays));

        for (let i = 0; i < 5; i++) {
            const d = new Date(mondayDate);
            d.setDate(mondayDate.getDate() + i);
            const dateStr = d.toLocaleDateString('sv');
            
            const [[{ count }]] = await db.promise().query(
                `SELECT COUNT(*) AS count 
                 FROM attendance a
                 JOIN employees e ON a.employee_id = e.employee_id
                 WHERE e.department = ? AND a.attendance_date = ? AND a.status IN ('Present', 'Late', 'Half Day')`,
                [deptName, dateStr]
            );
            trendData.push(count || 0);
        }

        // 7. Project Progress (Key Project Progress)
        const [deptTasks] = await db.promise().query(
            "SELECT task_title, status FROM tasks WHERE department = ? ORDER BY created_at DESC LIMIT 3",
            [deptName]
        );

        let projectProgress = [];
        if (deptTasks.length > 0) {
            projectProgress = deptTasks.map(t => ({
                name: t.task_title,
                progress: t.status === "Completed" ? 100 : t.status === "In Progress" ? 60 : 20
            }));
        } else {
            projectProgress = [
                { name: "Q3 Infrastructure Migration", progress: 75 },
                { name: "API V2 Documentation", progress: 40 },
                { name: "Security Audit Fixes", progress: 90 }
            ];
        }

        return res.status(200).json({
            success: true,
            departmentInfo: {
                departmentName: deptName,
                managerName: managerName,
                teamSize: employeeCount,
                attendanceRate: attendancePercentage
            },
            widgets: {
                presentToday: presentCount,
                lateToday: lateCount,
                absentToday: absentCount,
                pendingLeaves: pendingLeaves,
                activeTasks: activeTasks,
                completedTasks: completedTasks
            },
            activities: finalActivities,
            attendanceTrend: {
                labels: trendLabels,
                data: trendData
            },
            projectProgress: projectProgress
        });

    } catch (error) {
        console.error("Manager dashboard API error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch manager dashboard stats."
        });
    }
};

module.exports = {
    getManagerDashboardInfo
};
