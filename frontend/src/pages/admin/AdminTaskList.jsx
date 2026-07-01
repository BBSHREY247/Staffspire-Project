import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import {
    FaPlus, FaTimes, FaSearch, FaEye, FaTrashAlt,
    FaTasks, FaHourglassHalf, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaPause
} from "react-icons/fa";

const API = "http://localhost:5000/api";

const priorityConfig = {
    High:   { color: "#ef4444", bg: "#fee2e2", dot: "🔴" },
    Medium: { color: "#f59e0b", bg: "#fef9c3", dot: "🟡" },
    Low:    { color: "#22c55e", bg: "#dcfce7", dot: "🟢" },
};

const statusConfig = {
    "Pending":     { color: "#92400e", bg: "#fef9c3", border: "#fde68a", icon: "⏳" },
    "In Progress": { color: "#1e40af", bg: "#dbeafe", border: "#bfdbfe", icon: "🚧" },
    "On Hold":     { color: "#374151", bg: "#f3f4f6", border: "#d1d5db", icon: "⏸" },
    "Completed":   { color: "#14532d", bg: "#dcfce7", border: "#bbf7d0", icon: "✅" },
    "Overdue":     { color: "#7f1d1d", bg: "#fee2e2", border: "#fecaca", icon: "❌" },
};

function StatusBadge({ status }) {
    const cfg = statusConfig[status] || statusConfig["Pending"];
    return (
        <span style={{
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
            padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700",
            whiteSpace: "nowrap"
        }}>
            {cfg.icon} {status}
        </span>
    );
}

function PriorityBadge({ priority }) {
    const cfg = priorityConfig[priority] || priorityConfig["Medium"];
    return (
        <span style={{
            background: cfg.bg, color: cfg.color,
            padding: "3px 9px", borderRadius: "20px", fontSize: "12px", fontWeight: "700"
        }}>
            {cfg.dot} {priority}
        </span>
    );
}

function AdminTaskList() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, onHold: 0, completed: 0, overdue: 0 });
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");

    // Create modal
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ task_title: "", description: "", assigned_to: "", priority: "Medium", deadline: "" });

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const showNotification = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const fetchAll = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (priorityFilter) params.priority = priorityFilter;
            if (search) params.search = search;

            const [tasksRes, statsRes] = await Promise.all([
                axios.get(`${API}/tasks`, { headers, params }),
                axios.get(`${API}/tasks/stats`, { headers }),
            ]);
            setTasks(tasksRes.data.tasks || []);
            setStats(statsRes.data.stats || {});
        } catch (err) {
            console.error("Fetch tasks error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await axios.get(`${API}/employees`, { headers });
            setEmployees(res.data.employees || []);
        } catch (err) {
            console.error("Fetch employees error:", err);
        }
    };

    useEffect(() => { fetchAll(); fetchEmployees(); }, []);
    useEffect(() => { fetchAll(); }, [statusFilter, priorityFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchAll();
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            await axios.post(`${API}/tasks`, form, { headers });
            showNotification("success", "Task created successfully!");
            setShowCreate(false);
            setForm({ task_title: "", description: "", assigned_to: "", priority: "Medium", deadline: "" });
            fetchAll();
        } catch (err) {
            showNotification("error", err.response?.data?.message || "Failed to create task.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete task "${title}"? This cannot be undone.`)) return;
        try {
            await axios.delete(`${API}/tasks/${id}`, { headers });
            showNotification("success", "Task deleted.");
            fetchAll();
        } catch (err) {
            showNotification("error", err.response?.data?.message || "Failed to delete task.");
        }
    };

    const formatDate = (d) => {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

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
                <div className="employee-header" style={{ marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h1 className="page-title" style={{ margin: 0 }}>Task Management</h1>
                    <button
                        onClick={() => setShowCreate(true)}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            background: "linear-gradient(135deg, #4f8cff, #6366f1)",
                            color: "white", border: "none", padding: "12px 22px",
                            borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "14px",
                            boxShadow: "0 4px 14px rgba(79,140,255,0.35)"
                        }}
                    >
                        <FaPlus /> New Task
                    </button>
                </div>

                {/* Notification */}
                {message && <div className={`alert-banner alert-${message.type}`} style={{ marginBottom: "20px" }}>{message.text}</div>}

                {/* Stats Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                    {statCards.map(({ label, value, icon, color, bg }) => (
                        <div key={label} style={{ background: "white", borderRadius: "14px", padding: "20px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>{label}</span>
                                <span style={{ background: bg, color, padding: "6px", borderRadius: "8px", fontSize: "14px", display: "flex" }}>{icon}</span>
                            </div>
                            <div style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b" }}>{value}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="filters-card" style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
                    <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", flex: 1, minWidth: "200px" }}>
                        <div className="search-box" style={{ flex: 1 }}>
                            <FaSearch className="filter-icon" />
                            <input
                                type="text" placeholder="Search task, employee..."
                                value={search} onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button type="submit" style={{ background: "#4f8cff", color: "white", border: "none", padding: "0 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Search</button>
                    </form>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        style={{ padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc", fontSize: "14px", color: "#475569", fontWeight: "500", outline: "none" }}>
                        <option value="">All Statuses</option>
                        {["Pending", "In Progress", "On Hold", "Completed", "Overdue"].map(s => <option key={s}>{s}</option>)}
                    </select>
                    <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
                        style={{ padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc", fontSize: "14px", color: "#475569", fontWeight: "500", outline: "none" }}>
                        <option value="">All Priorities</option>
                        {["High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
                    </select>
                </div>

                {/* Tasks Table */}
                <div className="table-container-custom">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>Task ID</th>
                                <th>Title</th>
                                <th>Assigned To</th>
                                <th>Department</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Due Date</th>
                                <th>Assigned By</th>
                                <th style={{ textAlign: "center" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="9" style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>Loading tasks...</td></tr>
                            ) : tasks.length === 0 ? (
                                <tr><td colSpan="9" style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>No tasks found.</td></tr>
                            ) : tasks.map(task => (
                                <tr key={task.id}>
                                    <td><span style={{ fontFamily: "monospace", fontWeight: "700", color: "#4f8cff", fontSize: "13px" }}>{task.task_id || `#${task.id}`}</span></td>
                                    <td style={{ maxWidth: "200px" }}>
                                        <span style={{ fontWeight: "600", color: "#1e293b", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                            {task.task_title}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: "600" }}>{task.employee_name || task.employee_id}</td>
                                    <td><span className="dept-tag">{task.department || "—"}</span></td>
                                    <td><PriorityBadge priority={task.priority} /></td>
                                    <td><StatusBadge status={task.status} /></td>
                                    <td style={{ whiteSpace: "nowrap", color: task.status === "Overdue" ? "#ef4444" : "#475569", fontWeight: task.status === "Overdue" ? "700" : "500" }}>
                                        {formatDate(task.deadline)}
                                    </td>
                                    <td style={{ fontSize: "13px", color: "#64748b" }}>{task.assigned_by || "—"}</td>
                                    <td style={{ textAlign: "center" }}>
                                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                            <button
                                                onClick={() => navigate(`/admin/tasks/${task.id}`)}
                                                title="View / Edit"
                                                style={{ background: "#eff6ff", color: "#4f8cff", border: "1.5px solid #bfdbfe", width: "34px", height: "34px", borderRadius: "8px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}
                                                onMouseEnter={e => { e.currentTarget.style.background = "#4f8cff"; e.currentTarget.style.color = "white"; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#4f8cff"; }}
                                            ><FaEye /></button>
                                            <button
                                                onClick={() => handleDelete(task.id, task.task_title)}
                                                title="Delete"
                                                style={{ background: "#fff5f5", color: "#ef4444", border: "1.5px solid #fecaca", width: "34px", height: "34px", borderRadius: "8px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}
                                                onMouseEnter={e => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "white"; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.color = "#ef4444"; }}
                                            ><FaTrashAlt /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Task Modal */}
            {showCreate && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="form-card" style={{ width: "90%", maxWidth: "520px", margin: 0, position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
                        <button onClick={() => setShowCreate(false)}
                            style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#94a3b8" }}>
                            <FaTimes />
                        </button>

                        <h2 style={{ margin: "0 0 6px", fontWeight: "700", fontSize: "20px" }}>Assign New Task</h2>
                        <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#64748b" }}>Fill in the details and assign to an employee.</p>

                        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Task Title *</label>
                                <input type="text" value={form.task_title} onChange={e => setForm({ ...form, task_title: e.target.value })} placeholder="e.g. Prepare monthly report" required />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Task details and instructions..." rows="3"
                                    style={{ width: "100%", padding: "12px", border: "1px solid #dcdcdc", borderRadius: "8px", outline: "none", resize: "none", fontSize: "14px" }} />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Assign To *</label>
                                <select value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} required
                                    style={{ width: "100%", padding: "12px", border: "1px solid #dcdcdc", borderRadius: "8px", outline: "none", fontSize: "14px" }}>
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => (
                                        <option key={emp.employee_id} value={emp.employee_id}>
                                            {emp.first_name} {emp.last_name} — {emp.department}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Priority</label>
                                    <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                                        style={{ width: "100%", padding: "12px", border: "1px solid #dcdcdc", borderRadius: "8px", outline: "none", fontSize: "14px" }}>
                                        <option>High</option>
                                        <option>Medium</option>
                                        <option>Low</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Due Date *</label>
                                    <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} required />
                                </div>
                            </div>

                            <button type="submit" disabled={actionLoading}
                                style={{ background: "linear-gradient(135deg,#4f8cff,#6366f1)", color: "white", border: "none", padding: "13px", borderRadius: "10px", fontWeight: "700", fontSize: "15px", cursor: "pointer", opacity: actionLoading ? 0.6 : 1 }}>
                                {actionLoading ? "Creating..." : "Assign Task"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default AdminTaskList;
