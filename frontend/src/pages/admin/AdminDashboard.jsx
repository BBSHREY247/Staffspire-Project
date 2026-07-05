import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";

function AdminDashboard() {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const showNotification = (type, text) => {
        setNotification({ type, text });
        setTimeout(() => setNotification(null), 5000);
    };

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            
            // 1. Fetch employees
            const empRes = await axios.get("http://localhost:5000/api/employees", { headers });
            const empList = empRes.data.employees || [];
            setEmployees(empList);

            // 2. Fetch departments
            const deptRes = await axios.get("http://localhost:5000/api/departments", { headers });
            setDepartments(deptRes.data.departments || []);

            // 3. Fetch attendance
            const attRes = await axios.get("http://localhost:5000/api/attendance", { headers });
            setAttendance(attRes.data.attendance || []);

            // 4. Fetch leave requests
            const leavesRes = await axios.get("http://localhost:5000/api/leaves/admin/requests", { headers });
            setLeaveRequests(leavesRes.data.requests || []);

            // 5. Fetch tasks
            const tasksRes = await axios.get("http://localhost:5000/api/tasks", { headers });
            setTasks(tasksRes.data.tasks || []);

        } catch (error) {
            console.error("Error loading admin stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    // Approve/Reject Leave Request Handlers
    const handleLeaveAction = async (id, action) => {
        try {
            setActionLoading(true);
            const response = await axios.post(
                "http://localhost:5000/api/leaves/admin/action",
                { id, action },
                { headers }
            );
            showNotification("success", response.data.message || `Leave request ${action.toLowerCase()} successfully!`);
            fetchDashboardStats();
        } catch (error) {
            showNotification("error", error.response?.data?.message || "Failed to process leave request.");
        } finally {
            setActionLoading(false);
        }
    };

    // Calculate dynamic stats
    const totalEmployeesCount = employees.length;
    const totalDepartmentsCount = departments.length;

    // Filter attendance for today
    const todayStr = new Date().toISOString().split("T")[0];
    const todayAttendance = attendance.filter(a => {
        if (!a.attendance_date) return false;
        const aDate = new Date(a.attendance_date).toISOString().split("T")[0];
        return aDate === todayStr;
    });

    const presentTodayCount = todayAttendance.filter(a => a.check_in_time).length;
    const absentTodayCount = Math.max(0, totalEmployeesCount - presentTodayCount);

    // Pending leave requests count
    const pendingLeaves = leaveRequests.filter(r => r.status === "Pending" || r.status === "Pending Cancellation");
    const activeTasksCount = tasks.filter(t => t.status !== "Completed").length;

    // Calculate attendance rate
    const attendanceRate = totalEmployeesCount > 0 
        ? Math.round((presentTodayCount / totalEmployeesCount) * 100) 
        : 100;

    return (
        <DashboardLayout>
            <div className="w-full flex flex-col gap-6 text-slate-800">
                {/* Header Welcome and Command Center */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800 text-left">
                            Admin Command Center
                        </h2>
                        <p className="text-sm text-slate-500 font-medium mt-1 text-left">
                            Overview of organizational metrics, pending leaves, and active tasks.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/admin/reports")}
                            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">download</span>
                            Generate Report
                        </button>
                        <button
                            onClick={() => navigate("/admin/employees/add")}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">add</span>
                            Add Employee
                        </button>
                    </div>
                </div>

                {/* Notifications Alert Banner */}
                {notification && (
                    <div className={`p-4 rounded-lg text-sm font-medium border animate-fade-in ${
                        notification.type === "success" 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                            : "bg-red-50 text-red-800 border-red-100"
                    }`}>
                        {notification.text}
                    </div>
                )}

                {/* KPI Cards Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* KPI 1: Total Employees */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between min-h-[120px] text-left">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                                <span className="material-symbols-outlined text-[22px]">group</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Directory</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Employees</p>
                            <h3 className="text-xl font-bold text-slate-800 mt-1">{totalEmployeesCount}</h3>
                        </div>
                    </div>

                    {/* KPI 2: Departments */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between min-h-[120px] text-left">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                <span className="material-symbols-outlined text-[22px]">domain</span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Departments</p>
                            <h3 className="text-xl font-bold text-slate-800 mt-1">{totalDepartmentsCount}</h3>
                        </div>
                    </div>

                    {/* KPI 3: Present Today */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between min-h-[120px] text-left">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                                <span className="material-symbols-outlined text-[22px]">check_circle</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Today</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Present Today</p>
                            <h3 className="text-xl font-bold text-slate-800 mt-1">{presentTodayCount}</h3>
                        </div>
                    </div>

                    {/* KPI 4: Pending Leaves */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between min-h-[120px] text-left">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                                <span className="material-symbols-outlined text-[22px]">event_note</span>
                            </div>
                            {pendingLeaves.length > 0 && (
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Action Req.</span>
                            )}
                        </div>
                        <div className="mt-4">
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pending Leaves</p>
                            <h3 className="text-xl font-bold text-slate-800 mt-1">{pendingLeaves.length}</h3>
                        </div>
                    </div>
                </div>

                {/* Main Asymmetric Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Pending Leaves Requests Table (2 Columns wide) */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-600 text-lg">event_busy</span>
                                Pending Leave Requests
                            </h3>
                        </div>

                        <div className="overflow-x-auto text-left">
                            {loading ? (
                                <div className="py-12 text-center text-slate-400 text-sm">
                                    Loading requests...
                                </div>
                            ) : pendingLeaves.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 text-sm">
                                    No pending leave requests.
                                </div>
                            ) : (
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                                            <th className="py-3 px-6">Employee</th>
                                            <th className="py-3 px-6">Department</th>
                                            <th className="py-3 px-6">Leave Type</th>
                                            <th className="py-3 px-6">Dates</th>
                                            <th className="py-3 px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingLeaves.map((record) => (
                                            <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                                                <td className="py-4 px-6">
                                                    <p className="text-xs font-bold text-slate-800">
                                                        {record.first_name} {record.last_name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                                        {record.email}
                                                    </p>
                                                </td>
                                                <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                                                    {record.department || "N/A"}
                                                </td>
                                                <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                                                    {record.leave_type_name}
                                                </td>
                                                <td className="py-4 px-6 text-xs text-slate-400 font-medium">
                                                    {new Date(record.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(record.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            disabled={actionLoading}
                                                            onClick={() => handleLeaveAction(record.id, "Approved")}
                                                            className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center justify-center disabled:opacity-50"
                                                            title="Approve Request"
                                                        >
                                                            <span className="material-symbols-outlined text-base">check</span>
                                                        </button>
                                                        <button 
                                                            disabled={actionLoading}
                                                            onClick={() => handleLeaveAction(record.id, "Rejected")}
                                                            className="w-8 h-8 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center disabled:opacity-50"
                                                            title="Reject Request"
                                                        >
                                                            <span className="material-symbols-outlined text-base">close</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Right: Active Tasks & Attendance rate widget */}
                    <div className="flex flex-col gap-6">
                        {/* Attendance Rate widget */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                            <div className="text-left">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-500 text-lg">pie_chart</span>
                                    Attendance Rate
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-1 text-left">Today's expected check-ins rate</p>
                            </div>
                            <div className="flex items-center justify-center my-6">
                                <div className="relative w-28 h-28 rounded-full border-[10px] border-slate-100 flex items-center justify-center">
                                    <div className="absolute inset-[-10px] rounded-full border-[10px] border-blue-600" style={{ clipPath: `polygon(50% 50%, -50% -50%, 150% -50%, 150% 150%, -50% 150%)` }}></div>
                                    <div className="text-center">
                                        <span className="text-2xl font-black text-slate-800">{attendanceRate}%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-2 border-t border-slate-50 pt-4">
                                <span>Checked In: {presentTodayCount}</span>
                                <span>Absent: {absentTodayCount}</span>
                            </div>
                        </div>

                        {/* Recent Tasks Activity Card */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-left">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-slate-500 text-lg">assignment</span>
                                Active Tasks Summary
                            </h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center text-xs text-slate-600 font-semibold bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <span>Active Tasks Count</span>
                                    <span className="text-blue-600 font-bold">{activeTasksCount}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-600 font-semibold bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <span>Total Logged Tasks</span>
                                    <span className="text-slate-700 font-bold">{tasks.length}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate("/admin/tasks")}
                                className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors text-center mt-4"
                            >
                                Manage Tasks Board
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default AdminDashboard;