import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";

function ManagerDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState({
        departmentInfo: {
            departmentName: "",
            managerName: "",
            teamSize: 0,
            attendanceRate: 0
        },
        widgets: {
            presentToday: 0,
            lateToday: 0,
            absentToday: 0,
            pendingLeaves: 0,
            activeTasks: 0,
            completedTasks: 0
        },
        activities: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    "http://localhost:5000/api/admin/manager/dashboard-info",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                if (response.data.success) {
                    setData(response.data);
                } else {
                    setError("Failed to fetch dashboard data.");
                }
            } catch (err) {
                console.error(err);
                setError("An error occurred while fetching dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-[50vh]">
                    <p className="text-sm font-semibold text-slate-500">Loading department stats...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="p-4 bg-red-50 text-red-800 border border-red-100 rounded-lg text-sm font-medium">
                    {error}
                </div>
            </DashboardLayout>
        );
    }

    const { departmentInfo, widgets, activities } = data;

    // Helper to get action icon config
    const getActivityIcon = (type) => {
        switch (type) {
            case "attendance":
                return { icon: "login", bg: "bg-emerald-50 text-emerald-600 border-emerald-100" };
            case "checkout":
                return { icon: "logout", bg: "bg-rose-50 text-rose-600 border-rose-100" };
            case "leave":
                return { icon: "event_busy", bg: "bg-blue-50 text-blue-600 border-blue-100" };
            default:
                return { icon: "assignment", bg: "bg-indigo-50 text-indigo-600 border-indigo-100" };
        }
    };

    return (
        <DashboardLayout>
            <div className="w-full flex flex-col gap-6 text-slate-800">
                {/* Department Hero Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
                    <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-3 py-1 rounded-full">
                            Department Dashboard
                        </span>
                        <h1 className="text-3xl font-black mt-3">
                            {departmentInfo.departmentName}
                        </h1>
                        <p className="text-sm text-blue-100 mt-2 font-medium">
                            Reporting Manager: <strong className="text-white font-bold">{departmentInfo.managerName}</strong>
                        </p>
                    </div>

                    <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-white/20 pt-6 md:pt-0 md:pl-8 shrink-0">
                        <div className="text-center">
                            <div className="text-3xl font-black">{departmentInfo.teamSize}</div>
                            <div className="text-[11px] text-blue-100 font-bold uppercase tracking-wider mt-1">Active Team</div>
                        </div>
                        <div className="h-10 w-px bg-white/20 hidden md:block"></div>
                        <div className="text-center">
                            <div className="text-3xl font-black">{departmentInfo.attendanceRate}%</div>
                            <div className="text-[11px] text-blue-100 font-bold uppercase tracking-wider mt-1">Today Present</div>
                        </div>
                    </div>
                </div>

                {/* Team Performance Overview title */}
                <div className="text-left mt-2">
                    <h3 className="text-base font-bold text-slate-800">Team Performance Overview</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Real-time attendance logs and tasks status of your department.</p>
                </div>

                {/* Grid KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Widget: Present Today */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between text-left">
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Present Today</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{widgets.presentToday}</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <span className="material-symbols-outlined font-semibold text-[22px]">check_circle</span>
                        </div>
                    </div>

                    {/* Widget: Late Today */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between text-left">
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Late Today</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{widgets.lateToday}</h3>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                            <span className="material-symbols-outlined font-semibold text-[22px]">schedule</span>
                        </div>
                    </div>

                    {/* Widget: Absent Today */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between text-left">
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Absent Today</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{widgets.absentToday}</h3>
                        </div>
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
                            <span className="material-symbols-outlined font-semibold text-[22px]">cancel</span>
                        </div>
                    </div>

                    {/* Widget: Pending Leaves */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between text-left">
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pending Leaves</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{widgets.pendingLeaves}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <span className="material-symbols-outlined font-semibold text-[22px]">event_busy</span>
                        </div>
                    </div>

                    {/* Widget: Active Tasks */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between text-left">
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Tasks</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{widgets.activeTasks}</h3>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                            <span className="material-symbols-outlined font-semibold text-[22px]">assignment</span>
                        </div>
                    </div>

                    {/* Widget: Completed Tasks */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between text-left">
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Completed Tasks</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{widgets.completedTasks}</h3>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <span className="material-symbols-outlined font-semibold text-[22px]">task_alt</span>
                        </div>
                    </div>
                </div>

                {/* Actions Hub & Activity Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Actions Panel */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4 text-left">
                        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
                            Quick Actions Hub
                        </h3>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => navigate("/admin/tasks")}
                                className="flex justify-between items-center p-3.5 border border-slate-100 hover:border-blue-600 bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 rounded-xl transition-all cursor-pointer group"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-blue-600 text-lg">add_circle</span>
                                    Assign New Task
                                </span>
                                <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform text-sm">arrow_forward</span>
                            </button>

                            <button 
                                onClick={() => navigate("/admin/leaves")}
                                className="flex justify-between items-center p-3.5 border border-slate-100 hover:border-blue-600 bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 rounded-xl transition-all cursor-pointer group"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-indigo-600 text-lg">fact_check</span>
                                    Review Leave Requests
                                </span>
                                <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform text-sm">arrow_forward</span>
                            </button>

                            <button 
                                onClick={() => navigate("/reports")}
                                className="flex justify-between items-center p-3.5 border border-slate-100 hover:border-blue-600 bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 rounded-xl transition-all cursor-pointer group"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-emerald-600 text-lg">query_stats</span>
                                    Department Reports
                                </span>
                                <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>

                    {/* Activity Feed (2 columns wide) */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col text-left">
                        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">
                            Recent Activity Feed
                        </h3>

                        {activities.length === 0 ? (
                            <div className="py-10 text-center text-slate-400 text-xs">
                                No recent activities in your department.
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6 relative border-l-2 border-slate-100 ml-4 pl-6">
                                {activities.map((act, index) => {
                                    const design = getActivityIcon(act.type);
                                    return (
                                        <div key={index} className="relative">
                                            <div className={`absolute -left-[35px] top-0.5 w-4 h-4 rounded-full border-4 border-white shrink-0 shadow-sm flex items-center justify-center text-[10px] ${
                                                act.type === "attendance" ? "bg-emerald-500" : act.type === "checkout" ? "bg-rose-500" : act.type === "leave" ? "bg-blue-500" : "bg-indigo-500"
                                            }`} />
                                            <div>
                                                <p className="text-xs font-semibold text-slate-700">
                                                    {act.text}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    {act.time}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ManagerDashboard;