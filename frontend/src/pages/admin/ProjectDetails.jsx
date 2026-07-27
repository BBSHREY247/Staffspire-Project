import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useSWR from "swr";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { 
    FaArrowLeft, FaCheckCircle, FaTasks, FaExclamationCircle, 
    FaUsers, FaClock, FaFolderOpen, FaProjectDiagram, FaHistory, FaFlag, FaUserCircle, FaPlus, FaTimes, FaEdit, FaTrash, FaUserPlus, FaEye, FaExclamationTriangle
} from "react-icons/fa";
import EditProjectModal from "./components/EditProjectModal";
import CustomConfirmModal from "../../components/CustomConfirmModal";
import InlineAlert from "../../components/InlineAlert";

const fetcher = (url) => axios.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }).then(res => res.data);

export default function ProjectDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [activeTab, setActiveTab] = useState("Overview");

    const { data: projectRes, isLoading, mutate } = useSWR(token ? `http://localhost:5000/api/projects/${id}` : null, fetcher);
    const { data: deptData } = useSWR(token ? "http://localhost:5000/api/departments" : null, fetcher);
    const { data: empData } = useSWR(token ? "http://localhost:5000/api/employees" : null, fetcher);

    const [inlineTask, setInlineTask] = useState(null);
    const [isSubmittingTask, setIsSubmittingTask] = useState(false);
    const [alertMsg, setAlertMsg] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: "", count: 0, empId: null });

    const handleSaveInlineTask = async () => {
        if (!inlineTask.task_title || !inlineTask.assigned_to || !inlineTask.deadline) {
            setAlertMsg({ type: "warning", text: "Please enter Title, Assignee, and Due Date!" });
            return;
        }
        try {
            setIsSubmittingTask(true);
            await axios.post("http://localhost:5000/api/tasks", { ...inlineTask, project_id: id, department: deptName }, { headers: { Authorization: `Bearer ${token}` } });
            setInlineTask(null);
            mutate();
            setAlertMsg({ type: "success", text: "Task successfully added to project!" });
        } catch (err) {
            setAlertMsg({ type: "error", text: err.response?.data?.message || "Failed to create task." });
        } finally {
            setIsSubmittingTask(false);
        }
    };

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMemberIds, setSelectedMemberIds] = useState([]);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [newMemberId, setNewMemberId] = useState("");

    const handleAddMember = async () => {
        if (!newMemberId) return;
        try {
            await axios.post("http://localhost:5000/api/projects/members", { project_id: id, employee_id: newMemberId }, { headers: { Authorization: `Bearer ${token}` } });
            setNewMemberId("");
            setIsAddMemberOpen(false);
            mutate();
            setAlertMsg({ type: "success", text: "Employee successfully added to project team!" });
        } catch (err) {
            setAlertMsg({ type: "error", text: err.response?.data?.message || "Failed to add team member." });
        }
    };

    const handleRemoveMember = (empId) => {
        setConfirmModal({ isOpen: true, type: "single", count: 1, empId });
    };

    const handleBulkRemoveMembers = () => {
        setConfirmModal({ isOpen: true, type: "bulk", count: selectedMemberIds.length, empId: null });
    };

    const handleConfirmAction = async () => {
        const currentModal = { ...confirmModal };
        setConfirmModal({ isOpen: false, type: "", count: 0, empId: null });

        if (currentModal.type === "single" && currentModal.empId) {
            try {
                await axios.delete(`http://localhost:5000/api/projects/members?project_id=${id}&employee_id=${currentModal.empId}`, { headers: { Authorization: `Bearer ${token}` } });
                setSelectedMemberIds(selectedMemberIds.filter(itemId => itemId !== currentModal.empId));
                mutate();
                setAlertMsg({ type: "success", text: "Team member removed from project." });
            } catch (err) {
                setAlertMsg({ type: "error", text: err.response?.data?.message || "Failed to remove team member." });
            }
        } else if (currentModal.type === "bulk") {
            try {
                for (let empId of selectedMemberIds) {
                    await axios.delete(`http://localhost:5000/api/projects/members?project_id=${id}&employee_id=${empId}`, { headers: { Authorization: `Bearer ${token}` } });
                }
                setSelectedMemberIds([]);
                mutate();
                setAlertMsg({ type: "success", text: "Selected team member(s) removed from project." });
            } catch (err) {
                setAlertMsg({ type: "error", text: "Some removals may have failed. Refreshing list." });
                mutate();
            }
        }
    };

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

    const { project, members = [], tasks = [], milestones = [] } = projectRes;
    const departments = Array.isArray(deptData) ? deptData : (deptData?.departments || []);
    const employees = Array.isArray(empData) ? empData : (empData?.employees || []);

    const deptObj = departments.find(d => String(d.id) === String(project.department_id) || d.department_name === project.department_id || d.id === project.department_id || String(d.department_name).toLowerCase() === String(project.department_id).toLowerCase());
    const deptName = deptObj ? deptObj.department_name : (project.department_id && isNaN(project.department_id) ? project.department_id : "Unknown Department");
    const manager = employees.find(e => String(e.employee_id) === String(project.manager_id) || e.employee_id === project.manager_id || `${e.first_name} ${e.last_name}` === project.manager_id || String(e.id) === String(project.manager_id));
    const managerName = manager ? `${manager.first_name} ${manager.last_name}` : (project.manager_id && isNaN(project.manager_id) ? project.manager_id : "Unassigned");

    const projectEmployees = employees.filter(emp => emp.department === deptName || members.some(m => m.employee_id === emp.employee_id));
    const assignableEmployees = projectEmployees.length > 0 ? projectEmployees : employees;

    // Widget calculations
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "Completed").length;
    const pendingTasks = tasks.filter(t => t.status !== "Completed").length;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const overdueTasks = tasks.filter(t => new Date(t.deadline) < today && t.status !== "Completed").length;
    
    const endDate = new Date(project.end_date);
    const remainingDays = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
    
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Workload calculation
    const workloadMap = {};
    members.forEach(m => {
        workloadMap[m.employee_id] = {
            name: `${m.first_name || ''} ${m.last_name || ''}`.trim() || `Employee ${m.employee_id}`,
            id: m.employee_id,
            department: m.department || deptName || "—",
            tasksCount: 0,
            completedCount: 0
        };
    });
    tasks.forEach(t => {
        if (t.employee_id) {
            if (!workloadMap[t.employee_id]) {
                workloadMap[t.employee_id] = {
                    name: t.employee_name || `Employee ${t.employee_id}`,
                    id: t.employee_id,
                    department: t.department || deptName || "—",
                    tasksCount: 0,
                    completedCount: 0
                };
            }
            workloadMap[t.employee_id].tasksCount += 1;
            if (t.status === "Completed") workloadMap[t.employee_id].completedCount += 1;
        }
    });
    const workloadList = Object.values(workloadMap);

    // Timeline calculation
    const timelineEvents = [
        {
            id: "proj-create",
            title: "Project Created",
            date: project.created_at ? new Date(project.created_at) : new Date(project.start_date || Date.now()),
            desc: `Project "${project.project_name}" was initialized in ${deptName}.`,
            icon: <FaProjectDiagram color="#4f46e5" />,
            bg: "#e0e7ff"
        }
    ];
    members.forEach(m => {
        timelineEvents.push({
            id: `mem-${m.employee_id}`,
            title: "Member Added",
            date: m.joined_at ? new Date(m.joined_at) : (project.created_at ? new Date(new Date(project.created_at).getTime() + 1000 * 60 * 5) : new Date()),
            desc: `${m.first_name || ''} ${m.last_name || ''} joined the project team.`,
            icon: <FaUserPlus color="#0284c7" />,
            bg: "#e0f2fe"
        });
    });
    tasks.forEach(t => {
        timelineEvents.push({
            id: `task-${t.id}`,
            title: "Task Assigned",
            date: t.created_at ? new Date(t.created_at) : (t.start_date ? new Date(t.start_date) : new Date()),
            desc: `Task "${t.task_title}" was assigned to ${t.employee_name || 'an employee'} (Priority: ${t.priority || 'Medium'}).`,
            icon: <FaTasks color="#d97706" />,
            bg: "#fef3c7"
        });
        if (t.status === "Completed") {
            timelineEvents.push({
                id: `task-comp-${t.id}`,
                title: "Task Completed",
                date: t.completion_date ? new Date(t.completion_date) : (t.updated_at ? new Date(t.updated_at) : new Date()),
                desc: `Task "${t.task_title}" was marked as Completed by ${t.employee_name || 'an employee'}.`,
                icon: <FaCheckCircle color="#16a34a" />,
                bg: "#dcfce7"
            });
        }
    });
    milestones.forEach(ms => {
        if (ms.status === "Completed") {
            timelineEvents.push({
                id: `ms-comp-${ms.id}`,
                title: "Milestone Completed",
                date: ms.updated_at ? new Date(ms.updated_at) : new Date(),
                desc: `Milestone "${ms.title || ms.name}" reached 100% completion!`,
                icon: <FaFlag color="#9333ea" />,
                bg: "#f3e8ff"
            });
        }
    });
    if (project.status === "Completed" || progress === 100) {
        timelineEvents.push({
            id: "proj-comp",
            title: "Project Completed",
            date: project.updated_at ? new Date(project.updated_at) : new Date(project.end_date || Date.now()),
            desc: `Project "${project.project_name}" has reached 100% completion!`,
            icon: <FaCheckCircle color="#15803d" />,
            bg: "#dcfce7"
        });
    }
    timelineEvents.sort((a, b) => a.date - b.date);

    const tabs = ["Overview", "Tasks", "Members", "Workload", "Timeline"];

    return (
        <DashboardLayout>
            <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
                {alertMsg && (
                    <InlineAlert type={alertMsg.type} message={alertMsg.text} onClose={() => setAlertMsg(null)} />
                )}
                {/* Back Button and Edit Button */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                    <button onClick={() => navigate("/admin/projects")} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "0.95rem", fontWeight: "600" }}>
                        <FaArrowLeft /> Back to Projects
                    </button>
                    <button onClick={() => setIsEditModalOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "var(--primary, #3b82f6)", border: "none", color: "white", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontSize: "0.9rem", fontWeight: "600", boxShadow: "0 2px 4px rgba(59, 130, 246, 0.2)" }}>
                        <FaEdit /> Edit Project Details
                    </button>
                </div>

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
                                    <div>
                                        <h3 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "1.3rem" }}>Project Tasks</h3>
                                        <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>Manage tasks inline like a spreadsheet. Click "+ Add Row" at the bottom to insert new tasks.</p>
                                    </div>
                                    <button 
                                        onClick={() => setInlineTask({ task_title: "", description: "", status: "Pending", start_date: new Date().toLocaleDateString('en-CA'), deadline: "", assigned_to: "", priority: "Medium" })}
                                        className="primary-btn"
                                        style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", backgroundColor: "var(--primary, #4f46e5)", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)" }}
                                    >
                                        <FaPlus /> Add Row
                                    </button>
                                </div>
                                <div style={{ overflowX: "auto", border: "1px solid #cbd5e1", borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                                        <thead>
                                            <tr style={{ borderBottom: "2px solid #cbd5e1", backgroundColor: "#f8fafc", textAlign: "left" }}>
                                                <th style={{ padding: "14px 12px", width: "70px", color: "#334155", fontWeight: "700", fontSize: "0.85rem", borderRight: "1px solid #e2e8f0" }}>Sr. No.</th>
                                                <th style={{ padding: "14px 12px", minWidth: "180px", color: "#334155", fontWeight: "700", fontSize: "0.85rem", borderRight: "1px solid #e2e8f0" }}>Title</th>
                                                <th style={{ padding: "14px 12px", minWidth: "200px", color: "#334155", fontWeight: "700", fontSize: "0.85rem", borderRight: "1px solid #e2e8f0" }}>Description</th>
                                                <th style={{ padding: "14px 12px", width: "130px", color: "#334155", fontWeight: "700", fontSize: "0.85rem", borderRight: "1px solid #e2e8f0" }}>Status</th>
                                                <th style={{ padding: "14px 12px", width: "130px", color: "#334155", fontWeight: "700", fontSize: "0.85rem", borderRight: "1px solid #e2e8f0" }}>Start Date</th>
                                                <th style={{ padding: "14px 12px", width: "130px", color: "#334155", fontWeight: "700", fontSize: "0.85rem", borderRight: "1px solid #e2e8f0" }}>Due Date</th>
                                                <th style={{ padding: "14px 12px", minWidth: "160px", color: "#334155", fontWeight: "700", fontSize: "0.85rem", borderRight: "1px solid #e2e8f0" }}>Assigned To</th>
                                                <th style={{ padding: "14px 12px", width: "100px", textAlign: "center", color: "#334155", fontWeight: "700", fontSize: "0.85rem" }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tasks.map((t, idx) => (
                                                <tr key={t.id} style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: idx % 2 === 0 ? "white" : "#fcfcfd" }}>
                                                    <td style={{ padding: "12px", color: "#64748b", fontWeight: "600", borderRight: "1px solid #e2e8f0", fontSize: "0.9rem" }}>{idx + 1}</td>
                                                    <td style={{ padding: "12px", fontWeight: "600", color: "#0f172a", borderRight: "1px solid #e2e8f0", fontSize: "0.9rem" }}>{t.task_title}</td>
                                                    <td style={{ padding: "12px", color: "#475569", borderRight: "1px solid #e2e8f0", fontSize: "0.85rem" }}>{t.description || "—"}</td>
                                                    <td style={{ padding: "12px", borderRight: "1px solid #e2e8f0" }}>
                                                        <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "600", backgroundColor: t.status === "Completed" ? "#dcfce7" : t.status === "In Progress" ? "#dbeafe" : t.status === "On Hold" ? "#f3f4f6" : "#fef9c3", color: t.status === "Completed" ? "#166534" : t.status === "In Progress" ? "#1e40af" : t.status === "On Hold" ? "#374151" : "#854d0e" }}>{t.status}</span>
                                                    </td>
                                                    <td style={{ padding: "12px", color: "#475569", borderRight: "1px solid #e2e8f0", fontSize: "0.85rem" }}>{t.start_date ? new Date(t.start_date).toLocaleDateString() : "—"}</td>
                                                    <td style={{ padding: "12px", color: "#475569", borderRight: "1px solid #e2e8f0", fontSize: "0.85rem" }}>{t.deadline ? new Date(t.deadline).toLocaleDateString() : "—"}</td>
                                                    <td style={{ padding: "12px", color: "#334155", borderRight: "1px solid #e2e8f0", fontSize: "0.9rem", fontWeight: "500" }}>{t.employee_name || "Unassigned"}</td>
                                                    <td style={{ padding: "12px", textAlign: "center" }}>
                                                        <button 
                                                            onClick={() => navigate(`/admin/tasks/${t.id}`)} 
                                                            style={{ background: "none", border: "none", color: "var(--primary, #3b82f6)", cursor: "pointer", display: "inline-flex", alignItems: "center", padding: "6px", borderRadius: "6px", transition: "all 0.2s" }}
                                                            onMouseOver={e => e.currentTarget.style.backgroundColor = "#eff6ff"}
                                                            onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}
                                                            title="View Task Details"
                                                        >
                                                            <FaEye size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {inlineTask ? (
                                                <tr style={{ backgroundColor: "#eff6ff", borderBottom: "2px solid #3b82f6" }}>
                                                    <td style={{ padding: "10px 12px", fontWeight: "700", color: "#1e3a8a", borderRight: "1px solid #bfdbfe" }}>{tasks.length + 1}</td>
                                                    <td style={{ padding: "8px", borderRight: "1px solid #bfdbfe" }}>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Task Title *" 
                                                            value={inlineTask.task_title} 
                                                            onChange={e => setInlineTask({ ...inlineTask, task_title: e.target.value })}
                                                            style={{ width: "100%", padding: "8px 10px", border: "1px solid #60a5fa", borderRadius: "6px", fontSize: "0.9rem", boxSizing: "border-box", outline: "none", backgroundColor: "white" }}
                                                            autoFocus
                                                        />
                                                    </td>
                                                    <td style={{ padding: "8px", borderRight: "1px solid #bfdbfe" }}>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Description..." 
                                                            value={inlineTask.description} 
                                                            onChange={e => setInlineTask({ ...inlineTask, description: e.target.value })}
                                                            style={{ width: "100%", padding: "8px 10px", border: "1px solid #93c5fd", borderRadius: "6px", fontSize: "0.85rem", boxSizing: "border-box", outline: "none", backgroundColor: "white" }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: "8px", borderRight: "1px solid #bfdbfe" }}>
                                                        <select 
                                                            value={inlineTask.status} 
                                                            onChange={e => setInlineTask({ ...inlineTask, status: e.target.value })}
                                                            style={{ width: "100%", padding: "8px", border: "1px solid #93c5fd", borderRadius: "6px", fontSize: "0.85rem", boxSizing: "border-box", outline: "none", backgroundColor: "white", fontWeight: "600" }}
                                                        >
                                                            <option>Pending</option>
                                                            <option>In Progress</option>
                                                            <option>On Hold</option>
                                                            <option>Completed</option>
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: "8px", borderRight: "1px solid #bfdbfe" }}>
                                                        <input 
                                                            type="date" 
                                                            value={inlineTask.start_date} 
                                                            onChange={e => setInlineTask({ ...inlineTask, start_date: e.target.value })}
                                                            style={{ width: "100%", padding: "8px", border: "1px solid #93c5fd", borderRadius: "6px", fontSize: "0.85rem", boxSizing: "border-box", outline: "none", backgroundColor: "white" }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: "8px", borderRight: "1px solid #bfdbfe" }}>
                                                        <input 
                                                            type="date" 
                                                            value={inlineTask.deadline} 
                                                            onChange={e => setInlineTask({ ...inlineTask, deadline: e.target.value })}
                                                            style={{ width: "100%", padding: "8px", border: "1px solid #93c5fd", borderRadius: "6px", fontSize: "0.85rem", boxSizing: "border-box", outline: "none", backgroundColor: "white" }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: "8px", borderRight: "1px solid #bfdbfe" }}>
                                                        <select 
                                                            value={inlineTask.assigned_to} 
                                                            onChange={e => setInlineTask({ ...inlineTask, assigned_to: e.target.value })}
                                                            style={{ width: "100%", padding: "8px", border: "1px solid #60a5fa", borderRadius: "6px", fontSize: "0.85rem", boxSizing: "border-box", outline: "none", backgroundColor: "white" }}
                                                        >
                                                            <option value="">Select Employee *</option>
                                                            {assignableEmployees.map(emp => (
                                                                <option key={emp.employee_id} value={emp.employee_id}>
                                                                    {emp.first_name} {emp.last_name} ({emp.department || "No Dept"})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: "8px", textAlign: "center", whiteSpace: "nowrap" }}>
                                                        <button 
                                                            type="button"
                                                            onClick={handleSaveInlineTask} 
                                                            disabled={isSubmittingTask}
                                                            style={{ backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "6px", padding: "8px 12px", cursor: "pointer", fontWeight: "600", marginRight: "6px", fontSize: "0.85rem" }}
                                                            title="Save Row"
                                                        >
                                                            {isSubmittingTask ? "..." : "Save"}
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => setInlineTask(null)}
                                                            style={{ backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", padding: "8px 10px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}
                                                            title="Cancel"
                                                        >
                                                            ✕
                                                        </button>
                                                    </td>
                                                </tr>
                                            ) : (
                                                <tr>
                                                    <td colSpan={8} style={{ padding: "14px", textAlign: "left", backgroundColor: "#f8fafc" }}>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setInlineTask({ task_title: "", description: "", status: "Pending", start_date: new Date().toLocaleDateString('en-CA'), deadline: "", assigned_to: "", priority: "Medium" })}
                                                            style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "none", border: "1px dashed #94a3b8", color: "#475569", fontWeight: "600", cursor: "pointer", fontSize: "0.9rem", padding: "8px 16px", borderRadius: "8px", width: "100%", justifyContent: "center", transition: "all 0.2s" }}
                                                            onMouseOver={e => { e.currentTarget.style.backgroundColor = "#eff6ff"; e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#2563eb"; }}
                                                            onMouseOut={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.color = "#475569"; }}
                                                        >
                                                            <FaPlus /> + Add New Task Row
                                                        </button>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === "Members" && (
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                        <h3 style={{ margin: 0, color: "#1e293b" }}>Project Team ({members.length})</h3>
                                        {selectedMemberIds.length > 0 && (
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#fef2f2", border: "1px solid #fca5a5", padding: "6px 14px", borderRadius: "8px" }}>
                                                <span style={{ fontSize: "0.85rem", color: "#b91c1c", fontWeight: "600" }}>{selectedMemberIds.length} Selected</span>
                                                <button onClick={handleBulkRemoveMembers} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <FaTrash /> Remove Selected
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        {!isAddMemberOpen ? (
                                            <button onClick={() => setIsAddMemberOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "var(--primary, #3b82f6)", color: "white", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "0.9rem", cursor: "pointer", boxShadow: "0 2px 4px rgba(59, 130, 246, 0.15)" }}>
                                                <FaUserPlus /> + Add Employee to Project
                                            </button>
                                        ) : (
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f8fafc", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                                                <select value={newMemberId} onChange={e => setNewMemberId(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", minWidth: "220px", outline: "none" }}>
                                                    <option value="">Select employee to add...</option>
                                                    {employees.filter(emp => !members.some(m => m.employee_id === emp.employee_id)).map(emp => (
                                                        <option key={emp.employee_id} value={emp.employee_id}>
                                                            {emp.first_name} {emp.last_name} ({emp.department || "No Dept"})
                                                        </option>
                                                    ))}
                                                </select>
                                                <button onClick={handleAddMember} disabled={!newMemberId} style={{ backgroundColor: "#10b981", color: "white", border: "none", padding: "8px 14px", borderRadius: "6px", fontWeight: "600", fontSize: "0.85rem", cursor: !newMemberId ? "not-allowed" : "pointer", opacity: !newMemberId ? 0.6 : 1 }}>
                                                    Add
                                                </button>
                                                <button onClick={() => { setIsAddMemberOpen(false); setNewMemberId(""); }} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "6px", display: "flex", alignItems: "center" }}>
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {members.length === 0 ? (
                                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
                                        No members added to this project yet.
                                    </div>
                                ) : (
                                    <div style={{ overflowX: "auto", border: "1px solid #cbd5e1", borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
                                            <thead>
                                                <tr style={{ borderBottom: "2px solid #cbd5e1", backgroundColor: "#f8fafc", textAlign: "left" }}>
                                                    <th style={{ padding: "14px 12px", width: "50px", textAlign: "center", borderRight: "1px solid #e2e8f0" }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={members.length > 0 && selectedMemberIds.length === members.length}
                                                            onChange={e => handleSelectAllMembers(e.target.checked)}
                                                            style={{ cursor: "pointer" }}
                                                        />
                                                    </th>
                                                    <th style={{ padding: "14px 12px", width: "60px", color: "#334155", fontWeight: "700", fontSize: "0.85rem", borderRight: "1px solid #e2e8f0" }}>Sr.</th>
                                                    <th style={{ padding: "14px 12px", minWidth: "200px", color: "#334155", fontWeight: "700", fontSize: "0.85rem", borderRight: "1px solid #e2e8f0" }}>Employee Name</th>
                                                    <th style={{ padding: "14px 12px", minWidth: "160px", color: "#334155", fontWeight: "700", fontSize: "0.85rem", borderRight: "1px solid #e2e8f0" }}>Department</th>
                                                    <th style={{ padding: "14px 12px", minWidth: "160px", color: "#334155", fontWeight: "700", fontSize: "0.85rem", borderRight: "1px solid #e2e8f0" }}>Designation</th>
                                                    <th style={{ padding: "14px 12px", width: "140px", color: "#334155", fontWeight: "700", fontSize: "0.85rem" }}>Role</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {members.map((m, idx) => {
                                                    const isSelected = selectedMemberIds.includes(m.employee_id);
                                                    const isManager = String(m.employee_id) === String(project.manager_id);
                                                    return (
                                                        <tr key={m.id || m.employee_id} style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: idx % 2 === 0 ? "white" : "#fcfcfd" }}>
                                                            <td style={{ padding: "12px", textAlign: "center", borderRight: "1px solid #e2e8f0" }}>
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={isSelected}
                                                                    onChange={e => {
                                                                        if (e.target.checked) setSelectedMemberIds([...selectedMemberIds, m.employee_id]);
                                                                        else setSelectedMemberIds(selectedMemberIds.filter(id => id !== m.employee_id));
                                                                    }}
                                                                    style={{ cursor: "pointer" }}
                                                                />
                                                            </td>
                                                            <td style={{ padding: "12px", color: "#64748b", fontWeight: "600", borderRight: "1px solid #e2e8f0", fontSize: "0.9rem" }}>{idx + 1}</td>
                                                            <td style={{ padding: "12px", fontWeight: "600", color: "#0f172a", borderRight: "1px solid #e2e8f0", fontSize: "0.9rem" }}>
                                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                    <FaUserCircle size={24} color="#94a3b8" />
                                                                    <span>{m.first_name} {m.last_name}</span>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: "12px", color: "#475569", borderRight: "1px solid #e2e8f0", fontSize: "0.85rem" }}>{m.department || "—"}</td>
                                                            <td style={{ padding: "12px", color: "#475569", borderRight: "1px solid #e2e8f0", fontSize: "0.85rem" }}>{m.designation || "—"}</td>
                                                            <td style={{ padding: "12px", fontSize: "0.85rem" }}>
                                                                <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "700", backgroundColor: isManager ? "#fef3c7" : "#f1f5f9", color: isManager ? "#92400e" : "#475569" }}>
                                                                    {isManager ? "Project Manager" : "Team Member"}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "Workload" && (
                            <div>
                                <div style={{ marginBottom: "20px" }}>
                                    <h3 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "1.3rem" }}>Team Workload & Task Distribution</h3>
                                    <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>Monitor individual capacity, active task distribution, and identify overloaded team members.</p>
                                </div>
                                {workloadList.length === 0 ? (
                                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                                        No team members or tasks found for workload analysis.
                                    </div>
                                ) : (
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
                                        {workloadList.map(emp => {
                                            const activeCount = emp.tasksCount - emp.completedCount;
                                            const isOverloaded = emp.tasksCount >= 5;
                                            const blockBar = "█".repeat(Math.min(emp.tasksCount, 15)) || "—";
                                            const compPct = emp.tasksCount > 0 ? Math.round((emp.completedCount / emp.tasksCount) * 100) : 0;
                                            
                                            return (
                                                <div key={emp.id} style={{ backgroundColor: "white", border: isOverloaded ? "2px solid #f87171" : "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", position: "relative", transition: "all 0.2s" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                            <FaUserCircle size={36} color={isOverloaded ? "#ef4444" : "#64748b"} />
                                                            <div>
                                                                <h4 style={{ margin: "0 0 2px 0", color: "#0f172a", fontSize: "1.05rem" }}>{emp.name}</h4>
                                                                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{emp.department}</span>
                                                            </div>
                                                        </div>
                                                        <span style={{ backgroundColor: isOverloaded ? "#fee2e2" : "#f1f5f9", color: isOverloaded ? "#dc2626" : "#334155", padding: "4px 10px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "700" }}>
                                                            {emp.tasksCount} Tasks
                                                        </span>
                                                    </div>

                                                    <div style={{ marginBottom: "16px", backgroundColor: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                                                        <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                                                            <span>Workload Bar</span>
                                                            <span style={{ fontWeight: "600", color: "#334155" }}>{compPct}% Completed</span>
                                                        </div>
                                                        <div style={{ fontFamily: "monospace", color: isOverloaded ? "#dc2626" : "var(--primary, #4f46e5)", fontSize: "1rem", letterSpacing: "1px", wordBreak: "break-all" }}>
                                                            {blockBar}
                                                        </div>
                                                    </div>

                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "12px", fontSize: "0.85rem" }}>
                                                        <span style={{ color: "#16a34a", fontWeight: "600" }}>✓ {emp.completedCount} Done</span>
                                                        <span style={{ color: "#d97706", fontWeight: "600" }}>⏳ {activeCount} Active</span>
                                                    </div>

                                                    {isOverloaded && (
                                                        <div style={{ marginTop: "14px", backgroundColor: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c", padding: "8px 12px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                                                            <FaExclamationTriangle color="#ef4444" /> Employee Overloaded
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "Timeline" && (
                            <div>
                                <div style={{ marginBottom: "24px" }}>
                                    <h3 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "1.3rem" }}>Project Activity Timeline</h3>
                                    <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>Chronological log of project lifecycle events, assignments, and milestone achievements.</p>
                                </div>
                                {timelineEvents.length === 0 ? (
                                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                                        No activity recorded yet.
                                    </div>
                                ) : (
                                    <div style={{ position: "relative", paddingLeft: "36px", borderLeft: "3px solid #e2e8f0", marginLeft: "16px" }}>
                                        {timelineEvents.map((ev, idx) => (
                                            <div key={ev.id + idx} style={{ position: "relative", marginBottom: "28px" }}>
                                                <div style={{ position: "absolute", left: "-52px", top: "0", width: "32px", height: "32px", borderRadius: "50%", backgroundColor: ev.bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 4px white, 0 2px 4px rgba(0,0,0,0.1)", zIndex: 2 }}>
                                                    {ev.icon}
                                                </div>
                                                <div style={{ backgroundColor: "white", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", maxWidth: "700px", transition: "all 0.2s" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                                        <span style={{ fontWeight: "700", color: "#0f172a", fontSize: "1rem" }}>{ev.title}</span>
                                                        <span style={{ fontSize: "0.75rem", color: "#64748b", backgroundColor: "#f8fafc", padding: "2px 8px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                                                            {ev.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p style={{ margin: 0, color: "#475569", fontSize: "0.9rem", lineHeight: "1.5" }}>{ev.desc}</p>
                                                </div>
                                                {idx < timelineEvents.length - 1 && (
                                                    <div style={{ color: "#94a3b8", fontWeight: "700", marginLeft: "10px", marginTop: "8px", fontSize: "1.1rem" }}>↓</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <EditProjectModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => mutate()}
                    project={project}
                />

                <CustomConfirmModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal({ isOpen: false, type: "", count: 0, empId: null })}
                    onConfirm={handleConfirmAction}
                    title="Confirm Removal"
                    message={confirmModal.type === "bulk" ? `Are you sure you want to remove ${confirmModal.count} selected employee(s) from this project?` : "Are you sure you want to remove this employee from the project?"}
                    confirmText="Remove"
                    cancelText="Cancel"
                    type="danger"
                />
            </div>

        </DashboardLayout>
    );
}
