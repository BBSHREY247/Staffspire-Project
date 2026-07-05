import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { 
    FaUsers, FaUserCheck, FaUserTimes, 
    FaClipboardList, FaTasks, FaCheckCircle, 
    FaClock, FaChartBar, FaArrowRight, FaPlusCircle
} from "react-icons/fa";
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
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
                    <div style={{ fontSize: "18px", fontWeight: "600", color: "#6366f1" }}>Loading Dashboard...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div style={{ padding: "20px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", border: "1px solid #fee2e2" }}>
                    {error}
                </div>
            </DashboardLayout>
        );
    }

    const { departmentInfo, widgets, activities } = data;

    return (
        <DashboardLayout>
            <div className="manager-dashboard" style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
                {/* 1. Header & Department Info Card */}
                <div style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
                    color: "white",
                    padding: "32px",
                    borderRadius: "16px",
                    boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.3)",
                    marginBottom: "32px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "24px"
                }}>
                    <div>
                        <span style={{ textTransform: "uppercase", fontSize: "12px", fontWeight: "700", letterSpacing: "1.5px", opacity: 0.85 }}>Department Dashboard</span>
                        <h1 style={{ margin: "4px 0 12px 0", fontSize: "32px", fontWeight: "800" }}>{departmentInfo.departmentName}</h1>
                        <p style={{ margin: 0, fontSize: "16px", opacity: 0.9 }}>
                            Manager: <strong style={{ color: "#f8fafc" }}>{departmentInfo.managerName}</strong>
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "32px" }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "36px", fontWeight: "800" }}>{departmentInfo.teamSize}</div>
                            <div style={{ fontSize: "13px", opacity: 0.8, fontWeight: "500" }}>Active Team</div>
                        </div>
                        <div style={{ width: "1px", background: "rgba(255, 255, 255, 0.2)" }} />
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "36px", fontWeight: "800" }}>{departmentInfo.attendanceRate}%</div>
                            <div style={{ fontSize: "13px", opacity: 0.8, fontWeight: "500" }}>Today's Attendance</div>
                        </div>
                    </div>
                </div>

                {/* 2. Grid Widgets */}
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", marginBottom: "16px" }}>Team Performance Overview</h2>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px",
                    marginBottom: "32px"
                }}>
                    {/* Widget: Present Today */}
                    <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", borderLeft: "4px solid #10b981", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Present Today</div>
                            <div style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", marginTop: "4px" }}>{widgets.presentToday}</div>
                        </div>
                        <div style={{ background: "#ecfdf5", color: "#10b981", padding: "12px", borderRadius: "10px" }}><FaUserCheck size={20} /></div>
                    </div>

                    {/* Widget: Late Today */}
                    <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", borderLeft: "4px solid #f59e0b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Late Today</div>
                            <div style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", marginTop: "4px" }}>{widgets.lateToday}</div>
                        </div>
                        <div style={{ background: "#fffbeb", color: "#f59e0b", padding: "12px", borderRadius: "10px" }}><FaClock size={20} /></div>
                    </div>

                    {/* Widget: Absent Today */}
                    <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", borderLeft: "4px solid #ef4444", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Absent Today</div>
                            <div style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", marginTop: "4px" }}>{widgets.absentToday}</div>
                        </div>
                        <div style={{ background: "#fef2f2", color: "#ef4444", padding: "12px", borderRadius: "10px" }}><FaUserTimes size={20} /></div>
                    </div>

                    {/* Widget: Pending Leaves */}
                    <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", borderLeft: "4px solid #3b82f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Pending Leaves</div>
                            <div style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", marginTop: "4px" }}>{widgets.pendingLeaves}</div>
                        </div>
                        <div style={{ background: "#eff6ff", color: "#3b82f6", padding: "12px", borderRadius: "10px" }}><FaClipboardList size={20} /></div>
                    </div>

                    {/* Widget: Active Tasks */}
                    <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", borderLeft: "4px solid #8b5cf6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Active Tasks</div>
                            <div style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", marginTop: "4px" }}>{widgets.activeTasks}</div>
                        </div>
                        <div style={{ background: "#f5f3ff", color: "#8b5cf6", padding: "12px", borderRadius: "10px" }}><FaTasks size={20} /></div>
                    </div>

                    {/* Widget: Completed Tasks */}
                    <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", borderLeft: "4px solid #a855f7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Completed Tasks</div>
                            <div style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", marginTop: "4px" }}>{widgets.completedTasks}</div>
                        </div>
                        <div style={{ background: "#faf5ff", color: "#a855f7", padding: "12px", borderRadius: "10px" }}><FaCheckCircle size={20} /></div>
                    </div>
                </div>

                {/* 3. Action Hub & Activity Feed */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "32px", alignItems: "start" }}>
                    {/* Action Panel / Reports */}
                    <div style={{ background: "white", padding: "24px", borderRadius: "14px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", margin: "0 0 20px 0" }}>Quick Manager Actions</h3>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <button onClick={() => navigate("/admin/tasks")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.background = "#fafafa"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "white"; }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "600", color: "#334155" }}>
                                    <FaPlusCircle style={{ color: "#6366f1" }} /> Assign New Task
                                </span>
                                <FaArrowRight size={14} style={{ color: "#94a3b8" }} />
                            </button>

                            <button onClick={() => navigate("/admin/leaves")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.background = "#fafafa"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "white"; }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "600", color: "#334155" }}>
                                    <FaClipboardList style={{ color: "#3b82f6" }} /> Review Leave Requests
                                </span>
                                <FaArrowRight size={14} style={{ color: "#94a3b8" }} />
                            </button>

                            <button onClick={() => navigate("/reports")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.background = "#fafafa"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "white"; }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "600", color: "#334155" }}>
                                    <FaChartBar style={{ color: "#10b981" }} /> View Department Reports
                                </span>
                                <FaArrowRight size={14} style={{ color: "#94a3b8" }} />
                            </button>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div style={{ background: "white", padding: "24px", borderRadius: "14px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", margin: "0 0 20px 0" }}>Recent Activity Feed</h3>
                        
                        {activities.length === 0 ? (
                            <div style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center", padding: "20px" }}>No recent team activities to show.</div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                                {activities.map((act, index) => (
                                    <div key={index} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                        <div style={{
                                            background: act.type === "attendance" ? "#ecfdf5" : act.type === "checkout" ? "#fef2f2" : act.type === "leave" ? "#eff6ff" : "#f5f3ff",
                                            color: act.type === "attendance" ? "#10b981" : act.type === "checkout" ? "#ef4444" : act.type === "leave" ? "#3b82f6" : "#8b5cf6",
                                            padding: "8px",
                                            borderRadius: "8px",
                                            display: "flex"
                                        }}>
                                            {act.type === "attendance" && <FaUserCheck size={14} />}
                                            {act.type === "checkout" && <FaUserTimes size={14} />}
                                            {act.type === "leave" && <FaClipboardList size={14} />}
                                            {act.type === "task" && <FaTasks size={14} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: "14.5px", fontWeight: "500", color: "#334155" }}>{act.text}</div>
                                            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{act.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ManagerDashboard;