import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import useSWR from "swr";
import DashboardLayout from "../layouts/DashboardLayout";
import {
    FaArrowLeft, FaEdit, FaCheck, FaTimes, FaCalendarAlt,
    FaUser, FaBuilding, FaFlag, FaStickyNote, FaClock, FaIdBadge
} from "react-icons/fa";

const API = "http://localhost:5000/api";

const priorityConfig = {
    High:   { color: "#ef4444", bg: "#fee2e2", border: "#fecaca", dot: "🔴" },
    Medium: { color: "#d97706", bg: "#fef9c3", border: "#fde68a", dot: "🟡" },
    Low:    { color: "#16a34a", bg: "#dcfce7", border: "#bbf7d0", dot: "🟢" },
};

const statusConfig = {
    "Pending":     { color: "#92400e", bg: "#fef9c3", border: "#fde68a" },
    "In Progress": { color: "#1e40af", bg: "#dbeafe", border: "#bfdbfe" },
    "On Hold":     { color: "#374151", bg: "#f3f4f6", border: "#d1d5db" },
    "Completed":   { color: "#14532d", bg: "#dcfce7", border: "#bbf7d0" },
    "Overdue":     { color: "#7f1d1d", bg: "#fee2e2", border: "#fecaca" },
};

function TaskDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user")) || {};
    const isEmployee = user.role === "Employee";
    const isAdminOrManager = user.role === "Admin" || user.role === "Manager";

    const [task, setTask] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Edit form state (admin/manager)
    const [editForm, setEditForm] = useState({});

    // Employee update state
    const [empStatus, setEmpStatus] = useState("");
    const [empRemarks, setEmpRemarks] = useState("");

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const showNotification = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const fetcher = (url) => axios.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }).then(res => res.data);

    const { data: taskData, isLoading: taskLoading, mutate: fetchTask } = useSWR(`${API}/tasks/${id}`, fetcher);
    const { data: empData } = useSWR(isAdminOrManager ? `${API}/employees` : null, fetcher);

    useEffect(() => {
        setLoading(taskLoading && !taskData);
        if (taskData && taskData.task) {
            setTask(taskData.task);
            setEditForm(taskData.task);
            setEmpStatus(taskData.task.status);
            setEmpRemarks(taskData.task.remarks || "");
        }
    }, [taskData, taskLoading]);

    useEffect(() => {
        if (empData) {
            setEmployees(empData.employees || []);
        }
    }, [empData]);

    const handleAdminUpdate = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            await axios.put(`${API}/tasks/${id}`, editForm, { headers });
            showNotification("success", "Task updated successfully.");
            setEditing(false);
            fetchTask();
        } catch (err) {
            showNotification("error", err.response?.data?.message || "Update failed.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleEmployeeUpdate = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            await axios.put(`${API}/tasks/${id}`, { status: empStatus, remarks: empRemarks }, { headers });
            showNotification("success", "Task updated successfully.");
            setEditing(false);
            fetchTask();
        } catch (err) {
            showNotification("error", err.response?.data?.message || "Update failed.");
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (d) => {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    };

    const backPath = isEmployee ? "/employee/tasks" : "/admin/tasks";

    if (loading) return (
        <DashboardLayout>
            <div className="attendance-page-container">
                <p style={{ color: "#64748b", padding: "60px 0", textAlign: "center" }}>Loading task details...</p>
            </div>
        </DashboardLayout>
    );

    if (!task) return (
        <DashboardLayout>
            <div className="attendance-page-container">
                <p style={{ color: "#ef4444", padding: "60px 0", textAlign: "center" }}>Task not found.</p>
            </div>
        </DashboardLayout>
    );

    const priCfg = priorityConfig[task.priority] || priorityConfig["Medium"];
    const stsCfg = statusConfig[task.status] || statusConfig["Pending"];

    return (
        <DashboardLayout>
            <div className="attendance-page-container">
                {/* Back */}
                <button onClick={() => navigate(backPath)}
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "#4f8cff", fontWeight: "600", fontSize: "14px", marginBottom: "24px", padding: 0 }}>
                    <FaArrowLeft /> Back to Tasks
                </button>

                {message && <div className={`alert-banner alert-${message.type}`} style={{ marginBottom: "20px" }}>{message.text}</div>}

                {/* Hero header card */}
                <div style={{ background: "white", borderRadius: "16px", padding: "28px 32px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                <span style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: "700", color: "#4f8cff", background: "#eff6ff", padding: "4px 10px", borderRadius: "6px" }}>
                                    {task.task_id || `#${task.id}`}
                                </span>
                                <span style={{ background: priCfg.bg, color: priCfg.color, padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", whiteSpace: "nowrap" }}>
                                    {priCfg.dot} {task.priority}
                                </span>
                            </div>
                            <h1 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: "800", color: "#1e293b" }}>{task.task_title}</h1>
                            {task.department && <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>Department: <strong>{task.department}</strong></p>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ background: stsCfg.bg, color: stsCfg.color, border: `1.5px solid ${stsCfg.border}`, padding: "8px 20px", borderRadius: "30px", fontWeight: "700", fontSize: "14px" }}>
                                {task.status}
                            </span>
                            {(!editing && (isAdminOrManager || (isEmployee && task.status !== "Completed"))) && (
                                <button onClick={() => setEditing(true)}
                                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#4f8cff", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
                                    <FaEdit /> Edit Task
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                    {[
                        { icon: <FaUser />, label: "Assigned To", value: task.employee_name || task.employee_id },
                        { icon: <FaUser />, label: "Assigned By", value: task.assigned_by || "—" },
                        { icon: <FaBuilding />, label: "Department", value: task.department || "—" },
                        { icon: <FaFlag />, label: "Priority", value: `${priCfg.dot} ${task.priority}` },
                        { icon: <FaCalendarAlt />, label: "Due Date", value: formatDate(task.deadline) },
                        { icon: <FaClock />, label: "Created On", value: formatDate(task.created_at) },
                        { icon: <FaCalendarAlt />, label: "Completed On", value: task.completion_date ? formatDate(task.completion_date) : "Not yet" },
                        { icon: <FaIdBadge />, label: "Employee ID", value: task.employee_id },
                    ].map(({ icon, label, value }) => (
                        <div key={label} style={{ background: "white", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                            <span style={{ color: "#4f8cff", fontSize: "16px", marginTop: "2px", flexShrink: 0 }}>{icon}</span>
                            <div>
                                <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
                                <p style={{ margin: "4px 0 0", fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Description */}
                {task.description && (
                    <div style={{ background: "white", borderRadius: "12px", padding: "22px 24px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: "20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                            <FaStickyNote style={{ color: "#4f8cff" }} />
                            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Description</h3>
                        </div>
                        <p style={{ margin: 0, color: "#475569", lineHeight: "1.8", background: "#f8fafc", padding: "16px", borderRadius: "8px", borderLeft: "4px solid #4f8cff" }}>
                            {task.description}
                        </p>
                    </div>
                )}

                {/* Remarks */}
                {task.remarks && !editing && (
                    <div style={{ background: "white", borderRadius: "12px", padding: "22px 24px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: "20px", borderLeft: "4px solid #f59e0b" }}>
                        <h3 style={{ margin: "0 0 10px", fontSize: "15px", fontWeight: "700", color: "#92400e" }}>Remarks / Completion Notes</h3>
                        <p style={{ margin: 0, color: "#475569", lineHeight: "1.8" }}>{task.remarks}</p>
                    </div>
                )}

                {/* ─── ADMIN / MANAGER EDIT FORM ─── */}
                {isAdminOrManager && editing && (
                    <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", marginBottom: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h2 style={{ margin: 0, fontWeight: "700", fontSize: "18px" }}>Edit Task</h2>
                            <button onClick={() => setEditing(false)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "18px" }}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleAdminUpdate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Task Title</label>
                                <input type="text" value={editForm.task_title || ""} onChange={e => setEditForm({ ...editForm, task_title: e.target.value })} required />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Description</label>
                                <textarea value={editForm.description || ""} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    rows="3" style={{ width: "100%", padding: "12px", border: "1px solid #dcdcdc", borderRadius: "8px", outline: "none", resize: "none", fontSize: "14px" }} />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Assign To</label>
                                    <select value={editForm.employee_id || ""} onChange={e => setEditForm({ ...editForm, assigned_to: e.target.value, employee_id: e.target.value })}
                                        style={{ width: "100%", padding: "12px", border: "1px solid #dcdcdc", borderRadius: "8px", outline: "none", fontSize: "14px" }}>
                                        {employees.map(emp => (
                                            <option key={emp.employee_id} value={emp.employee_id}>
                                                {emp.first_name} {emp.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Due Date</label>
                                    <input type="date" value={editForm.deadline ? editForm.deadline.split("T")[0] : ""} onChange={e => setEditForm({ ...editForm, deadline: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Priority</label>
                                    <select value={editForm.priority || "Medium"} onChange={e => setEditForm({ ...editForm, priority: e.target.value })}
                                        style={{ width: "100%", padding: "12px", border: "1px solid #dcdcdc", borderRadius: "8px", outline: "none", fontSize: "14px" }}>
                                        <option>High</option><option>Medium</option><option>Low</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Status</label>
                                    <select value={editForm.status || "Pending"} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                                        style={{ width: "100%", padding: "12px", border: "1px solid #dcdcdc", borderRadius: "8px", outline: "none", fontSize: "14px" }}>
                                        {["Pending", "In Progress", "On Hold", "Completed"].map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Remarks</label>
                                <textarea value={editForm.remarks || ""} onChange={e => setEditForm({ ...editForm, remarks: e.target.value })}
                                    rows="3" placeholder="Add notes or feedback..."
                                    style={{ width: "100%", padding: "12px", border: "1px solid #dcdcdc", borderRadius: "8px", outline: "none", resize: "none", fontSize: "14px" }} />
                            </div>

                            <div style={{ display: "flex", gap: "12px" }}>
                                <button type="submit" disabled={actionLoading}
                                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#4f8cff", color: "white", border: "none", padding: "13px 28px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "15px", opacity: actionLoading ? 0.6 : 1 }}>
                                    <FaCheck /> {actionLoading ? "Saving..." : "Save Changes"}
                                </button>
                                <button type="button" onClick={() => setEditing(false)}
                                    style={{ background: "#f1f5f9", color: "#475569", border: "none", padding: "13px 24px", borderRadius: "10px", cursor: "pointer", fontWeight: "600" }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ─── EMPLOYEE UPDATE FORM ─── */}
                {isEmployee && editing && task.status !== "Completed" && (
                    <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", marginBottom: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h2 style={{ margin: 0, fontWeight: "700", fontSize: "18px" }}>Edit Task</h2>
                            <button onClick={() => setEditing(false)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "18px" }}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleEmployeeUpdate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Update Status</label>
                                <select value={empStatus} onChange={e => setEmpStatus(e.target.value)}
                                    style={{ width: "100%", padding: "12px", border: "1px solid #dcdcdc", borderRadius: "8px", outline: "none", fontSize: "14px" }}>
                                    {["Pending", "In Progress", "On Hold", "Completed"].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Completion Notes / Remarks</label>
                                <textarea value={empRemarks} onChange={e => setEmpRemarks(e.target.value)}
                                    placeholder="Describe what you've done, any blockers, or completion notes..."
                                    rows="4"
                                    style={{ width: "100%", padding: "12px", border: "1px solid #dcdcdc", borderRadius: "8px", outline: "none", resize: "none", fontSize: "14px" }} />
                            </div>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <button type="submit" disabled={actionLoading}
                                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#4f8cff", color: "white", border: "none", padding: "13px 28px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "15px", opacity: actionLoading ? 0.6 : 1 }}>
                                    <FaCheck /> {actionLoading ? "Saving..." : "Save Changes"}
                                </button>
                                <button type="button" onClick={() => setEditing(false)}
                                    style={{ background: "#f1f5f9", color: "#475569", border: "none", padding: "13px 24px", borderRadius: "10px", cursor: "pointer", fontWeight: "600" }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default TaskDetail;
