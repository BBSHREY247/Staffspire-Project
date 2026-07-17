import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import {
    FaTasks, FaHourglassHalf, FaSpinner, FaCheckCircle,
    FaExclamationTriangle, FaEye, FaCalendarAlt, FaPause
} from "react-icons/fa";

const API = "http://localhost:5000/api";

const priorityConfig = {
    High:   { color: "#ef4444", bg: "#fee2e2", dot: "🔴" },
    Medium: { color: "#d97706", bg: "#fef9c3", dot: "🟡" },
    Low:    { color: "#16a34a", bg: "#dcfce7", dot: "🟢" },
};

const statusConfig = {
    "Pending":     { color: "#92400e", bg: "#fef9c3", border: "#fde68a", icon: "⏳" },
    "In Progress": { color: "#1e40af", bg: "#dbeafe", border: "#bfdbfe", icon: "🚧" },
    "On Hold":     { color: "#374151", bg: "#f3f4f6", border: "#d1d5db", icon: "⏸" },
    "Completed":   { color: "#14532d", bg: "#dcfce7", border: "#bbf7d0", icon: "✅" },
    "Overdue":     { color: "#7f1d1d", bg: "#fee2e2", border: "#fecaca", icon: "❌" },
};

function MyTasks() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, onHold: 0, completed: 0, overdue: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async (status = "all") => {
        try {
            setLoading(true);
            const params = status !== "all" ? { status } : {};
            const [tasksRes, statsRes] = await Promise.all([
                axios.get(`${API}/tasks/my`, { headers, params }),
                axios.get(`${API}/tasks/stats`, { headers }),
            ]);
            setTasks(tasksRes.data.tasks || []);
            setStats(statsRes.data.stats || {});
        } catch (err) {
            console.error("Fetch my tasks error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(activeTab); }, [activeTab]);

    const formatDate = (d) => {
        if (!d) return "—";
        const date = new Date(d);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const dd = new Date(d); dd.setHours(0, 0, 0, 0);

        if (dd.getTime() === today.getTime()) return "Due Today";
        if (dd.getTime() === tomorrow.getTime()) return "Due Tomorrow";
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const isDueSoon = (d) => {
        if (!d) return false;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const dd = new Date(d); dd.setHours(0, 0, 0, 0);
        const diff = (dd - today) / (1000 * 60 * 60 * 24);
        return diff <= 2 && diff >= 0;
    };

    const tabs = [
        { key: "all",         label: "All",         count: stats.total },
        { key: "Pending",     label: "⏳ Pending",   count: stats.pending },
        { key: "In Progress", label: "🚧 In Progress", count: stats.inProgress },
        { key: "On Hold",     label: "⏸ On Hold",   count: stats.onHold },
        { key: "Completed",   label: "✅ Completed", count: stats.completed },
        { key: "Overdue",     label: "❌ Overdue",   count: stats.overdue },
    ];

    const statCards = [
        { label: "Total Tasks", value: stats.total, icon: <FaTasks />, color: "#4f8cff", bg: "#eff6ff" },
        { label: "Pending", value: stats.pending, icon: <FaHourglassHalf />, color: "#f59e0b", bg: "#fef9c3" },
        { label: "In Progress", value: stats.inProgress, icon: <FaSpinner />, color: "#3b82f6", bg: "#dbeafe" },
        { label: "On Hold", value: stats.onHold, icon: <FaPause />, color: "#6b7280", bg: "#f3f4f6" },
        { label: "Completed", value: stats.completed, icon: <FaCheckCircle />, color: "#22c55e", bg: "#dcfce7" },
        { label: "Overdue", value: stats.overdue, icon: <FaExclamationTriangle />, color: "#ef4444", bg: "#fee2e2" },
    ];

    return (
        <DashboardLayout>
            <div className="attendance-page-container">
                {/* Header */}
                <div className="employee-header" style={{ marginBottom: "24px" }}>
                    <h1 className="page-title" style={{ margin: 0 }}>My Tasks</h1>
                </div>

                {/* Stats Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                    {statCards.map(({ label, value, icon, color, bg }) => (
                        <div key={label} style={{ background: "white", borderRadius: "14px", padding: "18px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>{label}</span>
                                <span style={{ background: bg, color, padding: "6px", borderRadius: "8px", fontSize: "14px", display: "flex" }}>{icon}</span>
                            </div>
                            <div style={{ fontSize: "26px", fontWeight: "800", color: "#1e293b" }}>{value}</div>
                        </div>
                    ))}
                </div>

                {/* Status Tabs */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
                    {tabs.map(({ key, label, count }) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            style={{
                                padding: "8px 16px", borderRadius: "30px", border: "1.5px solid",
                                borderColor: activeTab === key ? "#4f8cff" : "#e2e8f0",
                                background: activeTab === key ? "#4f8cff" : "white",
                                color: activeTab === key ? "white" : "#475569",
                                fontWeight: "600", fontSize: "13px", cursor: "pointer",
                                display: "inline-flex", alignItems: "center", gap: "6px", transition: "all 0.15s"
                            }}>
                            {label}
                            <span style={{
                                background: activeTab === key ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                                color: activeTab === key ? "white" : "#64748b",
                                padding: "1px 7px", borderRadius: "10px", fontSize: "12px", fontWeight: "700"
                            }}>{count}</span>
                        </button>
                    ))}
                </div>

                {/* Task Cards */}
                {loading ? (
                    <div style={{ textAlign: "center", color: "#64748b", padding: "60px 0" }}>Loading tasks...</div>
                ) : tasks.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
                        <p style={{ color: "#64748b", fontWeight: "600", fontSize: "16px" }}>No tasks in this category.</p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "18px" }}>
                        {tasks.map(task => {
                            const priCfg = priorityConfig[task.priority] || priorityConfig["Medium"];
                            const stsCfg = statusConfig[task.status] || statusConfig["Pending"];
                            const dueSoon = isDueSoon(task.deadline);

                            return (
                                <div key={task.id} style={{
                                    background: "white", borderRadius: "14px",
                                    boxShadow: "0 2px 14px rgba(0,0,0,0.06)",
                                    overflow: "hidden", transition: "transform 0.15s, box-shadow 0.15s",
                                    border: task.status === "Overdue" ? "2px solid #fecaca" : dueSoon ? "2px solid #fde68a" : "2px solid transparent",
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 14px rgba(0,0,0,0.06)"; }}>

                                    {/* Card top bar */}
                                    <div style={{ height: "4px", background: priCfg.color }} />

                                    <div style={{ padding: "20px" }}>
                                        {/* Priority + Status row */}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "6px" }}>
                                            <span style={{ background: priCfg.bg, color: priCfg.color, padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap" }}>
                                                {priCfg.dot} {task.priority}
                                            </span>
                                            <span style={{ background: stsCfg.bg, color: stsCfg.color, border: `1px solid ${stsCfg.border}`, padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}>
                                                {stsCfg.icon} {task.status}
                                            </span>
                                        </div>

                                        {/* Task ID + Title */}
                                        <div style={{ marginBottom: "10px" }}>
                                            <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#4f8cff", fontWeight: "700" }}>{task.task_id || `#${task.id}`}</span>
                                            <h3 style={{ margin: "4px 0 0", fontSize: "16px", fontWeight: "700", color: "#1e293b", lineHeight: "1.4" }}>
                                                {task.task_title}
                                            </h3>
                                        </div>

                                        {/* Description snippet */}
                                        {task.description && (
                                            <p style={{ margin: "0 0 14px", fontSize: "13px", color: "#64748b", lineHeight: "1.6", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                {task.description}
                                            </p>
                                        )}

                                        {/* Meta */}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "12px", marginTop: "4px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: task.status === "Overdue" ? "#ef4444" : dueSoon ? "#d97706" : "#64748b", fontWeight: dueSoon || task.status === "Overdue" ? "700" : "500" }}>
                                                <FaCalendarAlt style={{ fontSize: "11px" }} />
                                                {formatDate(task.deadline)}
                                            </div>
                                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                                                By: {task.assigned_by || "Admin"}
                                            </div>
                                        </div>

                                        {/* View button */}
                                        <button onClick={() => navigate(`/employee/tasks/${task.id}`)}
                                            style={{
                                                marginTop: "14px", width: "100%",
                                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                                background: "#eff6ff", color: "#4f8cff", border: "1.5px solid #bfdbfe",
                                                padding: "9px", borderRadius: "8px", cursor: "pointer",
                                                fontWeight: "600", fontSize: "13px", transition: "all 0.15s"
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = "#4f8cff"; e.currentTarget.style.color = "white"; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#4f8cff"; }}>
                                            <FaEye /> View & Update
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default MyTasks;
