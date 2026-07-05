import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";

function EmployeeDashboard() {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [employee, setEmployee] = useState(null);
    const [attendanceToday, setAttendanceToday] = useState(null);
    const [isCheckInAllowed, setIsCheckInAllowed] = useState(true);
    const [isCheckOutAllowed, setIsCheckOutAllowed] = useState(false);
    const [checkInBlockReason, setCheckInBlockReason] = useState("");
    const [todayStatusLabel, setTodayStatusLabel] = useState("Absent");
    
    const [tasks, setTasks] = useState([]);
    const [leavesCount, setLeavesCount] = useState(0);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    
    const [actionLoading, setActionLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    // Live clock update
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const showNotification = (type, text) => {
        setNotification({ type, text });
        setTimeout(() => setNotification(null), 5000);
    };

    const fetchDashboardData = async () => {
        try {
            // 1. Fetch current user profile
            const profileRes = await axios.get("http://localhost:5000/api/employee/profile", { headers });
            setEmployee(profileRes.data.profile || {});

            // 2. Fetch today's attendance status
            const todayRes = await axios.get("http://localhost:5000/api/attendance/today", { headers });
            setAttendanceToday(todayRes.data.attendance);
            setIsCheckInAllowed(todayRes.data.isCheckInAllowed !== false);
            setIsCheckOutAllowed(!!todayRes.data.isCheckOutAllowed);
            setCheckInBlockReason(todayRes.data.checkInBlockReason || "");
            setTodayStatusLabel(todayRes.data.todayStatusLabel || "Absent");

            // 3. Fetch task list
            const tasksRes = await axios.get("http://localhost:5000/api/tasks/my", { headers });
            setTasks(tasksRes.data.tasks ? tasksRes.data.tasks.slice(0, 3) : []);

            // 4. Fetch leaves history to calculate approved leave days
            const leavesRes = await axios.get("http://localhost:5000/api/leaves/history", { headers });
            const approvedLeaves = (leavesRes.data.history || []).filter(l => l.status === "Approved");
            const totalDays = approvedLeaves.reduce((acc, l) => acc + (l.total_days || 0), 0);
            setLeavesCount(totalDays);

            // 5. Fetch attendance history for heatmap
            const historyRes = await axios.get("http://localhost:5000/api/attendance/history", { headers });
            setAttendanceHistory(historyRes.data.history || []);
        } catch (error) {
            console.error("Error fetching employee dashboard stats:", error);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleCheckIn = async () => {
        try {
            setActionLoading(true);
            const response = await axios.post("http://localhost:5000/api/attendance/check-in", {}, { headers });
            showNotification("success", response.data.message || "Checked in successfully!");
            fetchDashboardData();
        } catch (error) {
            showNotification("error", error.response?.data?.message || "Check-in failed.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckOut = async () => {
        try {
            setActionLoading(true);
            const response = await axios.post("http://localhost:5000/api/attendance/check-out", {}, { headers });
            showNotification("success", response.data.message || "Checked out successfully!");
            fetchDashboardData();
        } catch (error) {
            showNotification("error", error.response?.data?.message || "Check-out failed.");
        } finally {
            setActionLoading(false);
        }
    };

    // Calculate dates list for last 14 days heatmap
    const generateHeatmapDays = () => {
        const list = [];
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split("T")[0];
            
            // Find in attendanceHistory
            const record = attendanceHistory.find(h => {
                if (!h.date) return false;
                const recDate = new Date(h.date).toISOString().split("T")[0];
                return recDate === dateStr;
            });

            const dayOfWeek = d.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            list.push({
                dateLabel: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                isWeekend,
                record,
                dateStr
            });
        }
        return list;
    };

    const formatDateTime = (date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const heatmapDays = generateHeatmapDays();

    // Map priority colors
    const getPriorityBadge = (priority) => {
        switch ((priority || "").toLowerCase()) {
            case "high":
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-600 border border-red-100">High</span>;
            case "low":
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">Low</span>;
            default:
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">Medium</span>;
        }
    };

    return (
        <DashboardLayout>
            <div className="w-full flex flex-col gap-6 text-slate-800">
                {/* Header Welcome and Check-In Action */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                            Welcome back, {employee?.first_name || "Employee"}!
                        </h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            {formatDateTime(currentTime)}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {isCheckInAllowed ? (
                            <button
                                onClick={handleCheckIn}
                                disabled={actionLoading}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-base">login</span>
                                Check In
                            </button>
                        ) : isCheckOutAllowed ? (
                            <button
                                onClick={handleCheckOut}
                                disabled={actionLoading}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-base">logout</span>
                                Check Out
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold border border-slate-200">
                                <span className="material-symbols-outlined text-sm">info</span>
                                {checkInBlockReason || todayStatusLabel}
                            </div>
                        )}
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

                {/* Summary Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Attendance status card */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[140px]">
                        <div className="flex items-start justify-between">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                                <span className="material-symbols-outlined text-[22px] font-semibold">check_circle</span>
                            </div>
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-500">Today</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Attendance Status</p>
                            <h3 className="text-lg font-bold text-slate-800 mt-1">{todayStatusLabel}</h3>
                            {attendanceToday?.check_in_time && (
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">schedule</span>
                                    Checked-in: {attendanceToday.check_in_time}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Working Hours progress card */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
                        <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-blue-50 rounded-full blur-xl opacity-50"></div>
                        <div className="flex items-start justify-between">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                <span className="material-symbols-outlined text-[22px]">work_history</span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Working Hours Today</p>
                            <h3 className="text-2xl font-black text-slate-800 mt-1">
                                {attendanceToday?.working_hours || "0.0"}
                                <span className="text-xs font-semibold text-slate-400 ml-1">hours</span>
                            </h3>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div 
                                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min((parseFloat(attendanceToday?.working_hours || "0") / 8) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Leave remaining card */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[140px]">
                        <div className="flex items-start justify-between">
                            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
                                <span className="material-symbols-outlined text-[22px]">event_busy</span>
                            </div>
                            <button 
                                onClick={() => navigate("/employee/leaves")}
                                className="text-blue-600 hover:text-blue-700 text-xs font-bold hover:underline flex items-center gap-0.5"
                            >
                                Apply Leave <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </button>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Leave Days Taken</p>
                            <h3 className="text-lg font-bold text-slate-800 mt-1">
                                {leavesCount} <span className="text-xs font-normal text-slate-400">days this year</span>
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Main Asymmetric Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left side: Tasks List (2 Columns wide) */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600 text-lg">task_alt</span>
                                My Tasks
                            </h3>
                            <button 
                                onClick={() => navigate("/employee/tasks")}
                                className="text-blue-600 hover:text-blue-700 text-xs font-bold hover:underline flex items-center gap-0.5"
                            >
                                View Task Dashboard
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            {tasks.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 text-sm">
                                    No tasks assigned to you.
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                                            <th className="py-3 px-6">Task Details</th>
                                            <th className="py-3 px-6">Priority</th>
                                            <th className="py-3 px-6">Due Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasks.map((task) => (
                                            <tr 
                                                key={task.id} 
                                                className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors cursor-pointer"
                                                onClick={() => navigate(`/employee/tasks`)}
                                            >
                                                <td className="py-4 px-6 text-left">
                                                    <p className="text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors">
                                                        {task.task_title}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                                                        {task.description || "No description provided."}
                                                    </p>
                                                </td>
                                                <td className="py-4 px-6 text-left">{getPriorityBadge(task.priority)}</td>
                                                <td className="py-4 px-6 text-xs text-slate-500 font-medium text-left">
                                                    {task.deadline ? new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Right side: Deadlines & Heatmap (1 Column wide) */}
                    <div className="flex flex-col gap-6">
                        {/* Upcoming Events Card */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-slate-500 text-lg">calendar_month</span>
                                Upcoming Schedule
                            </h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-3 relative before:absolute before:left-[9px] before:top-6 before:bottom-[-20px] before:w-[2px] before:bg-slate-100 last:before:hidden">
                                    <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0 z-10 border border-white">
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-semibold text-slate-700">Company Meeting</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Tomorrow, 10:00 AM</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 relative before:absolute before:left-[9px] before:top-6 before:bottom-[-20px] before:w-[2px] before:bg-slate-100 last:before:hidden">
                                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 z-10 border border-white">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-semibold text-slate-700">Monthly Reports Due</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Oct 30, 06:00 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Live Attendance Heatmap */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-500 text-lg">insights</span>
                                    Attendance Activity
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-1 mb-4 text-left">Last 14 days work record</p>
                                
                                <div className="flex gap-2 flex-wrap">
                                    {heatmapDays.map((day, idx) => {
                                        let bgClass = "bg-slate-100";
                                        let titleText = `${day.dateLabel}: Weekend / Holiday`;

                                        if (day.record) {
                                            if (day.record.status === "Present" || day.record.check_out_time) {
                                                bgClass = "bg-blue-600";
                                                titleText = `${day.dateLabel}: Checked-in (${day.record.working_hours || "8"}h)`;
                                            } else if (day.record.status === "Absent") {
                                                bgClass = "bg-red-500";
                                                titleText = `${day.dateLabel}: Absent`;
                                            } else if (day.record.check_in_time) {
                                                bgClass = "bg-blue-300";
                                                titleText = `${day.dateLabel}: Checked-in (Active)`;
                                            }
                                        } else if (day.isWeekend) {
                                            bgClass = "bg-slate-100";
                                        } else {
                                            // Regular weekday not checked in
                                            bgClass = "bg-slate-200";
                                            titleText = `${day.dateLabel}: Absent (No Record)`;
                                        }

                                        return (
                                            <div 
                                                key={idx}
                                                title={titleText}
                                                className={`w-7 h-7 rounded cursor-pointer hover:scale-105 transition-transform ${bgClass}`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                <span>Less</span>
                                <div className="flex gap-1">
                                    <div className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200"></div>
                                    <div className="w-2.5 h-2.5 rounded bg-blue-300"></div>
                                    <div className="w-2.5 h-2.5 rounded bg-blue-600"></div>
                                </div>
                                <span>More</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default EmployeeDashboard;