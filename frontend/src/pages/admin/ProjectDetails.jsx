import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useSWR from "swr";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { 
    FaArrowLeft, FaCheckCircle, FaTasks, FaExclamationCircle, 
    FaUsers, FaClock, FaFolderOpen, FaProjectDiagram, FaHistory, FaFlag, FaUserCircle
} from "react-icons/fa";

const fetcher = (url) => axios.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }).then(res => res.data);

export default function ProjectDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [activeTab, setActiveTab] = useState("Overview");

    const { data: projectRes, isLoading } = useSWR(token ? `http://localhost:5000/api/projects/${id}` : null, fetcher);
    const { data: deptData } = useSWR(token ? "http://localhost:5000/api/departments" : null, fetcher);
    const { data: empData } = useSWR(token ? "http://localhost:5000/api/employees" : null, fetcher);

    if (isLoading) {
        return (
            <DashboardLayout>
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading Project Details...</div>
            </DashboardLayout>
        );
    }

    if (!projectRes || !projectRes.project) {
        return (
            <DashboardLayout>
                <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>Project not found or an error occurred.</div>
            </DashboardLayout>
        );
    }

    const { project, members, milestones, tasks } = projectRes;
    const departments = Array.isArray(deptData) ? deptData : (deptData?.departments || []);
    const employees = Array.isArray(empData) ? empData : (empData?.employees || []);

    const deptName = departments.find(d => d.id === project.department_id)?.department_name || "Unknown Department";
    const manager = employees.find(e => e.employee_id === project.manager_id);
    const managerName = manager ? `${manager.first_name} ${manager.last_name}` : "Unassigned";

    // Widget calculations
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "Completed").length;
    const pendingTasks = tasks.filter(t => t.status !== "Completed").length;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const overdueTasks = tasks.filter(t => new Date(t.due_date) < today && t.status !== "Completed").length;
    
    const endDate = new Date(project.end_date);
    const remainingDays = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
    
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const tabs = ["Overview", "Tasks", "Members", "Milestones", "Activity"];

    return (
        <DashboardLayout>
            <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
                {/* Back Button */}
                <button onClick={() => navigate("/admin/projects")} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#64748b", cursor: "pointer", marginBottom: "20px", fontSize: "0.95rem", fontWeight: "600" }}>
                    <FaArrowLeft /> Back to Projects
                </button>

                {/* Top Section */}
                <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
                        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                            <div style={{ width: "64px", height: "64px", backgroundColor: project.project_color || "#4f46e5", borderRadius: "16px", display: "flex", justifyContent: "center", alignItems: "center", color: "white" }}>
                                <FaFolderOpen size={32} />
                            </div>
                            <div>
                                <h1 style={{ margin: "0 0 8px 0", fontSize: "1.8rem", color: "#0f172a" }}>{project.project_name} <span style={{ fontSize: "1rem", color: "#64748b", fontWeight: "normal" }}>({project.project_code})</span></h1>
                                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                                    <span style={{ padding: "4px 10px", backgroundColor: project.status === 'Completed' ? '#dcfce7' : project.status === 'On Hold' ? '#f1f5f9' : '#dbeafe', color: project.status === 'Completed' ? '#166534' : project.status === 'On Hold' ? '#475569' : '#1e40af', borderRadius: "6px", fontSize: "0.8rem", fontWeight: "700" }}>{project.status}</span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "4px", color: project.priority === 'High' ? '#ef4444' : project.priority === 'Medium' ? '#f59e0b' : '#3b82f6', fontSize: "0.85rem", fontWeight: "600" }}>
                                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: project.priority === 'High' ? '#ef4444' : project.priority === 'Medium' ? '#f59e0b' : '#3b82f6' }} />
                                        {project.priority} Priority
                                    </span>
                                    <span style={{ fontSize: "0.85rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}><FaProjectDiagram /> {deptName}</span>
                                    <span style={{ fontSize: "0.85rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}><FaUserCircle /> Manager: {managerName}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: "200px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>Project Progress</span>
                                <span style={{ fontSize: "0.9rem", fontWeight: "700", color: project.project_color || "#4f46e5" }}>{progress}%</span>
                            </div>
                            <div style={{ width: "100%", height: "10px", backgroundColor: "#e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                                <div style={{ width: `${progress}%`, height: "100%", backgroundColor: progress === 100 ? "#10b981" : (project.project_color || "#4f46e5"), transition: "width 0.5s ease-in-out" }}></div>
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "8px", textAlign: "right" }}>
                                Deadline: {new Date(project.end_date).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Widgets */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                    {[
                        { title: "Total Tasks", value: totalTasks, icon: <FaTasks />, color: "#3b82f6", bg: "#eff6ff" },
                        { title: "Completed", value: completedTasks, icon: <FaCheckCircle />, color: "#10b981", bg: "#ecfdf5" },
                        { title: "Pending", value: pendingTasks, icon: <FaClock />, color: "#f59e0b", bg: "#fffbeb" },
                        { title: "Overdue", value: overdueTasks, icon: <FaExclamationCircle />, color: "#ef4444", bg: "#fef2f2" },
                        { title: "Team Members", value: members.length, icon: <FaUsers />, color: "#8b5cf6", bg: "#f5f3ff" },
                        { title: "Remaining Days", value: remainingDays, icon: <FaFlag />, color: "#06b6d4", bg: "#ecfeff" }
                    ].map((w, i) => (
                        <div key={i} style={{ backgroundColor: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: w.bg, color: w.color, display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" }}>
                                {w.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600", marginBottom: "4px" }}>{w.title}</div>
                                <div style={{ fontSize: "1.5rem", color: "#0f172a", fontWeight: "bold" }}>{w.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs & Content */}
                <div style={{ backgroundColor: "white", borderRadius: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
                    <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc", overflowX: "auto" }}>
                        {tabs.map(tab => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)}
                                style={{ 
                                    padding: "16px 24px", border: "none", background: "none", 
                                    borderBottom: activeTab === tab ? `3px solid ${project.project_color || 'var(--primary, #4f46e5)'}` : "3px solid transparent",
                                    color: activeTab === tab ? "#0f172a" : "#64748b", fontWeight: "600", cursor: "pointer", fontSize: "0.95rem",
                                    transition: "all 0.2s"
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div style={{ padding: "24px" }}>
                        {/* Tab Content Rendering */}
                        
                        {activeTab === "Overview" && (
                            <div>
                                <h3 style={{ marginTop: 0, color: "#1e293b" }}>Project Description</h3>
                                <p style={{ color: "#475569", lineHeight: "1.6" }}>{project.description || "No description provided."}</p>
                                <hr style={{ border: "0", borderTop: "1px solid #e2e8f0", margin: "24px 0" }}/>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
                                    <div>
                                        <h4 style={{ color: "#1e293b", margin: "0 0 12px 0" }}>Key Details</h4>
                                        <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#475569", display: "flex", flexDirection: "column", gap: "10px" }}>
                                            <li><strong>Start Date:</strong> {new Date(project.start_date).toLocaleDateString()}</li>
                                            <li><strong>Deadline:</strong> {new Date(project.end_date).toLocaleDateString()}</li>
                                            <li><strong>Department:</strong> {deptName}</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 style={{ color: "#1e293b", margin: "0 0 12px 0" }}>Manager</h4>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                            <FaUserCircle size={36} color="#94a3b8" />
                                            <div>
                                                <div style={{ fontWeight: "600", color: "#1e293b" }}>{managerName}</div>
                                                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{manager?.email || ""}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "Tasks" && (
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                    <h3 style={{ margin: 0, color: "#1e293b" }}>Project Tasks</h3>
                                </div>
                                {tasks.length === 0 ? (
                                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b", backgroundColor: "#f8fafc", borderRadius: "8px" }}>No tasks assigned to this project yet.</div>
                                ) : (
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                                                <th style={{ padding: "12px", textAlign: "left", color: "#475569" }}>Task Title</th>
                                                <th style={{ padding: "12px", textAlign: "left", color: "#475569" }}>Assigned To</th>
                                                <th style={{ padding: "12px", textAlign: "left", color: "#475569" }}>Status</th>
                                                <th style={{ padding: "12px", textAlign: "left", color: "#475569" }}>Due Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tasks.map(t => (
                                                <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                                    <td style={{ padding: "12px", fontWeight: "500", color: "#1e293b" }}>{t.title}</td>
                                                    <td style={{ padding: "12px", color: "#475569" }}>{t.employee_name || "Unassigned"}</td>
                                                    <td style={{ padding: "12px" }}>
                                                        <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "600", backgroundColor: t.status === "Completed" ? "#dcfce7" : "#f1f5f9", color: t.status === "Completed" ? "#166534" : "#475569" }}>{t.status}</span>
                                                    </td>
                                                    <td style={{ padding: "12px", color: "#475569" }}>{new Date(t.due_date).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {activeTab === "Members" && (
                            <div>
                                <h3 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>Project Team ({members.length})</h3>
                                {members.length === 0 ? (
                                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b", backgroundColor: "#f8fafc", borderRadius: "8px" }}>No team members assigned yet.</div>
                                ) : (
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                                        {members.map(m => (
                                            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                                <FaUserCircle size={48} color="#94a3b8" />
                                                <div>
                                                    <div style={{ fontWeight: "bold", color: "#1e293b" }}>{m.first_name} {m.last_name}</div>
                                                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{m.designation}</div>
                                                    <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "4px" }}>{m.department}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "Milestones" && (
                            <div>
                                <h3 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>Project Milestones</h3>
                                {milestones.length === 0 ? (
                                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b", backgroundColor: "#f8fafc", borderRadius: "8px" }}>No milestones created yet.</div>
                                ) : (
                                    <div style={{ position: "relative", paddingLeft: "24px" }}>
                                        {milestones.map((m, i) => (
                                            <div key={m.id} style={{ position: "relative", paddingBottom: "32px", borderLeft: i === milestones.length - 1 ? "none" : "2px solid #e2e8f0", marginLeft: "10px", paddingLeft: "24px" }}>
                                                <div style={{ position: "absolute", left: "-35px", top: 0, width: "24px", height: "24px", backgroundColor: m.status === 'Completed' ? "#10b981" : "white", border: m.status === 'Completed' ? "none" : "2px solid #cbd5e1", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", color: "white", zIndex: 1 }}>
                                                    {m.status === 'Completed' && <FaCheckCircle size={16} />}
                                                </div>
                                                <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", marginTop: "-4px" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                                        <h4 style={{ margin: 0, color: "#1e293b", fontSize: "1.1rem" }}>{m.title}</h4>
                                                        <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600", padding: "4px 8px", backgroundColor: "white", borderRadius: "6px", border: "1px solid #e2e8f0" }}>{new Date(m.due_date).toLocaleDateString()}</span>
                                                    </div>
                                                    <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem" }}>{m.description}</p>
                                                    <div style={{ marginTop: "12px" }}>
                                                        <span style={{ fontSize: "0.8rem", fontWeight: "600", color: m.status === "Completed" ? "#10b981" : "#f59e0b" }}>{m.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "Activity" && (
                            <div>
                                <h3 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>Recent Activity</h3>
                                <div style={{ padding: "40px", textAlign: "center", color: "#64748b", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                                    <FaHistory size={32} color="#cbd5e1" style={{ marginBottom: "12px" }} />
                                    <div>No recent activity logged for this project.</div>
                                    <div style={{ fontSize: "0.85rem", marginTop: "8px" }}>Activity feed will display project updates, task completions, and milestone progress.</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
