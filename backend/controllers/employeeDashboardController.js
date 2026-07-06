const db = require("../config/db");

const getEmployeeDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user account info
        const [users] = await db.promise().query("SELECT * FROM users WHERE id = ?", [userId]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const user = users[0];

        // Fetch employee personal details
        const [employees] = await db.promise().query(
            "SELECT * FROM employees WHERE email = ?",
            [user.email]
        );
        const emp = employees[0] || {};
        const employeeId = emp.employee_id || user.login_id;

        // --- Today's Attendance ---
        const todayDate = new Date().toISOString().split("T")[0];
        const [todayAtt] = await db.promise().query(
            `SELECT check_in, check_out, working_hours, status 
             FROM attendance 
             WHERE employee_id = ? AND DATE(attendance_date) = ?`,
            [employeeId, todayDate]
        );
        const todayAttRecord = todayAtt[0] || null;

        // Calculate working hours so far if checked in but not out
        let workingHoursDecimal = 0;
        let workingHoursDisplay = "0h 0m";
        if (todayAttRecord) {
            if (todayAttRecord.working_hours) {
                const parts = todayAttRecord.working_hours.split(":");
                const hours = parseInt(parts[0]) || 0;
                const mins = parseInt(parts[1]) || 0;
                workingHoursDecimal = parseFloat((hours + mins / 60).toFixed(1));
                workingHoursDisplay = `${hours}h ${mins}m`;
            } else if (todayAttRecord.check_in) {
                // still checked in — compute elapsed time
                const now = new Date();
                const checkInTime = new Date(`${todayDate}T${todayAttRecord.check_in}`);
                const diffMs = now - checkInTime;
                const diffMins = Math.floor(diffMs / 60000);
                const hours = Math.floor(diffMins / 60);
                const mins = diffMins % 60;
                workingHoursDecimal = parseFloat((hours + mins / 60).toFixed(1));
                workingHoursDisplay = `${hours}h ${mins}m`;
            }
        }

        // Standard working hours (8h = 100%)
        const maxHours = 8;
        const workingPercent = Math.min(100, Math.round((workingHoursDecimal / maxHours) * 100));

        // --- Leave Balance ---
        const currentYear = new Date().getFullYear();
        const [leaveSummary] = await db.promise().query(
            `SELECT 
                COALESCE(SUM(CASE WHEN status = 'Approved' AND YEAR(start_date) = ? THEN total_days ELSE 0 END), 0) AS days_taken
             FROM leave_requests 
             WHERE employee_id = ?`,
            [currentYear, employeeId]
        );
        const annualAllowance = 20;
        const daysTaken = parseInt(leaveSummary[0]?.days_taken) || 0;
        const leaveBalance = Math.max(0, annualAllowance - daysTaken);

        // --- My Tasks (active tasks assigned to this employee) ---
        const [tasks] = await db.promise().query(
            `SELECT id, task_id, task_title, description, priority, deadline, status, department
             FROM tasks
             WHERE employee_id = ? AND status NOT IN ('Completed', 'Cancelled')
             ORDER BY 
                CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END,
                deadline ASC
             LIMIT 5`,
            [employeeId]
        );

        const formattedTasks = tasks.map(t => {
            let deadlineDisplay = "";
            if (t.deadline) {
                const dl = new Date(t.deadline);
                const today = new Date();
                const isToday = dl.toDateString() === today.toDateString();
                if (isToday) {
                    deadlineDisplay = `Today, ${dl.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
                } else {
                    deadlineDisplay = dl.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                }
            }
            return {
                id: t.id,
                task_id: t.task_id,
                title: t.task_title,
                department: t.department || "",
                priority: t.priority || "Low",
                deadline: deadlineDisplay,
                status: t.status
            };
        });


        // --- 14-Day Attendance Heatmap ---
        const heatmapDays = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            heatmapDays.push(d.toISOString().split("T")[0]);
        }

        const [heatmapRows] = await db.promise().query(
            `SELECT DATE(attendance_date) as att_date, working_hours, status
             FROM attendance
             WHERE employee_id = ? AND DATE(attendance_date) >= ?
             ORDER BY attendance_date ASC`,
            [employeeId, heatmapDays[0]]
        );

        const heatmapMap = {};
        heatmapRows.forEach(r => {
            const key = new Date(r.att_date).toISOString().split("T")[0];
            heatmapMap[key] = { working_hours: r.working_hours, status: r.status };
        });

        const heatmap = heatmapDays.map(dateStr => {
            const d = new Date(dateStr + "T00:00:00");
            const dayOfWeek = d.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const record = heatmapMap[dateStr];
            let level = 0;
            let label = isWeekend ? "Weekend" : "Absent";
            let isLeave = false;

            if (record) {
                if (record.status === "Present") {
                    const parts = (record.working_hours || "0:0:0").split(":");
                    const hrs = parseInt(parts[0]) || 0;
                    if (hrs >= 9) level = 4;
                    else if (hrs >= 8) level = 3;
                    else if (hrs >= 6) level = 2;
                    else level = 1;
                    label = `${hrs}h worked`;
                } else if (record.status === "Half Day") {
                    level = 1;
                    label = "Half Day";
                } else if (record.status && record.status.toLowerCase().includes("leave")) {
                    isLeave = true;
                    label = record.status;
                }
            }

            return {
                date: dateStr,
                level,
                isWeekend,
                isLeave,
                label
            };
        });

        // --- Upcoming Events (pending leave requests as upcoming) ---
        const [upcoming] = await db.promise().query(
            `SELECT lr.reason, lr.start_date, lt.name AS leave_type_name, lr.status
             FROM leave_requests lr
             JOIN leave_types lt ON lr.leave_type_id = lt.id
             WHERE lr.employee_id = ? AND lr.start_date >= CURDATE() AND lr.status = 'Pending'
             ORDER BY lr.start_date ASC
             LIMIT 3`,
            [employeeId]
        );

        const upcomingEvents = upcoming.map(e => ({
            title: `${e.leave_type_name} Leave`,
            date: new Date(e.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            status: e.status
        }));

        return res.status(200).json({
            success: true,
            employee: {
                name: emp.first_name ? `${emp.first_name} ${emp.last_name}` : user.name,
                employee_id: employeeId,
                department: emp.department || "N/A",
                designation: emp.designation || "N/A",
                email: emp.email || user.email,
                phone: emp.mobile || "N/A"
            },
            todayAttendance: {
                status: todayAttRecord?.status || "Not Checked In",
                checkIn: todayAttRecord?.check_in || null,
                checkOut: todayAttRecord?.check_out || null,
                isCheckedIn: !!todayAttRecord?.check_in && !todayAttRecord?.check_out
            },
            workingHours: {
                decimal: workingHoursDecimal,
                display: workingHoursDisplay,
                percent: workingPercent,
                max: maxHours
            },
            leaveBalance: {
                remaining: leaveBalance,
                total: annualAllowance,
                taken: daysTaken
            },
            tasks: formattedTasks,
            heatmap,
            upcomingEvents
        });

    } catch (error) {
        console.error("Employee dashboard controller error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
    }
};

module.exports = { getEmployeeDashboard };
