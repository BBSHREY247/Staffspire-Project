import React from "react";
import {
    FaProjectDiagram, FaCheckCircle, FaTasks, FaClock, FaUsers,
    FaFlag, FaUserCircle, FaPrint, FaTimes, FaAward, FaExclamationTriangle,
    FaChartLine, FaClipboardList, FaLightbulb, FaShieldAlt, FaCalendarAlt, FaRocket
} from "react-icons/fa";
import "../../../styles/projectReport.css";

// Helper: format date nicely
const fmtDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "—";
    return dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

// Helper: day difference
const daysBetween = (d1, d2) => {
    if (!d1 || !d2) return 0;
    const a = new Date(d1), b = new Date(d2);
    if (isNaN(a) || isNaN(b)) return 0;
    return Math.max(0, Math.ceil((b - a) / (1000 * 60 * 60 * 24)));
};

// Status badge helper
const StatusBadge = ({ status }) => {
    let cls = "rpt-badge ";
    if (status === "Completed") cls += "rpt-badge-completed";
    else if (status === "In Progress") cls += "rpt-badge-progress";
    else if (status === "On Hold") cls += "rpt-badge-hold";
    else cls += "rpt-badge-pending";
    return <span className={cls}>{status}</span>;
};

const PriorityBadge = ({ priority }) => {
    let cls = "rpt-badge ";
    if (priority === "Critical") cls += "rpt-badge-critical";
    else if (priority === "High") cls += "rpt-badge-high";
    else if (priority === "Medium") cls += "rpt-badge-medium";
    else cls += "rpt-badge-low";
    return <span className={cls}>{priority || "Medium"}</span>;
};

export default function ProjectReport({
    isOpen,
    onClose,
    project = {},
    members = [],
    tasks = [],
    milestones = [],
    deptName = "—",
    managerName = "—",
    progress = 0,
    workloadList = []
}) {
    if (!isOpen) return null;

    const user = JSON.parse(localStorage.getItem("user:v1")) || {};
    const generatedBy = user.name || user.email || "System Administrator";

    // Calculations
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "Completed").length;
    const pendingTasks = tasks.filter(t => t.status !== "Completed").length;
    const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;
    const onHoldTasks = tasks.filter(t => t.status === "On Hold").length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdueTasks = tasks.filter(t => new Date(t.deadline) < today && t.status !== "Completed").length;
    const onTimeTasks = tasks.filter(t => {
        if (t.status !== "Completed") return false;
        const comp = t.completion_date ? new Date(t.completion_date) : (t.updated_at ? new Date(t.updated_at) : null);
        if (!comp || !t.deadline) return true;
        return comp <= new Date(t.deadline);
    }).length;
    const lateTasks = completedTasks - onTimeTasks;

    const totalDuration = daysBetween(project.start_date, project.end_date);
    const actualCompDate = project.updated_at || project.end_date;

    // Priority distribution
    const priCritical = tasks.filter(t => t.priority === "Critical").length;
    const priHigh = tasks.filter(t => t.priority === "High").length;
    const priMedium = tasks.filter(t => !t.priority || t.priority === "Medium").length;
    const priLow = tasks.filter(t => t.priority === "Low").length;

    // Milestone stats
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === "Completed").length;

    // Task completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const onTimeRate = completedTasks > 0 ? Math.round((onTimeTasks / completedTasks) * 100) : 0;
    const milestoneRate = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    // Avg task duration (completed tasks only)
    let avgTaskDuration = 0;
    const completedWithDates = tasks.filter(t => t.status === "Completed" && t.start_date);
    if (completedWithDates.length > 0) {
        const totalDays = completedWithDates.reduce((sum, t) => {
            const end = t.completion_date || t.updated_at || t.deadline;
            return sum + daysBetween(t.start_date, end);
        }, 0);
        avgTaskDuration = Math.round(totalDays / completedWithDates.length);
    }

    // Team utilization
    const membersWithTasks = workloadList.filter(w => w.tasksCount > 0).length;
    const teamUtilization = members.length > 0 ? Math.round((membersWithTasks / members.length) * 100) : 0;

    // Project health assessment
    let healthStatus = "Excellent";
    let healthColor = "#16a34a";
    if (completionRate < 50 || onTimeRate < 40) { healthStatus = "Needs Improvement"; healthColor = "#ef4444"; }
    else if (completionRate < 80 || onTimeRate < 60) { healthStatus = "Good"; healthColor = "#f59e0b"; }
    else if (completionRate < 95 || onTimeRate < 80) { healthStatus = "Very Good"; healthColor = "#0284c7"; }

    // Auto-generate observations
    const highlights = [];
    if (completionRate === 100) highlights.push("All assigned tasks were successfully completed.");
    if (milestoneRate === 100 && totalMilestones > 0) highlights.push("All project milestones were achieved on schedule.");
    if (onTimeRate >= 80 && completedTasks > 0) highlights.push(`${onTimeRate}% of tasks were delivered on or before their deadlines.`);
    if (members.length >= 3) highlights.push(`A cross-functional team of ${members.length} members collaborated on this project.`);
    if (completedTasks > 0 && avgTaskDuration > 0) highlights.push(`Average task completion time was ${avgTaskDuration} day${avgTaskDuration !== 1 ? 's' : ''}.`);
    if (highlights.length === 0) highlights.push("The project was completed within the defined scope.");

    const risks = [];
    if (overdueTasks > 0) risks.push(`${overdueTasks} task${overdueTasks > 1 ? 's' : ''} remained overdue at the time of project closure.`);
    if (lateTasks > 0) risks.push(`${lateTasks} task${lateTasks > 1 ? 's were' : ' was'} completed after their original deadline.`);
    const overloaded = workloadList.filter(w => w.workloadPoints >= 10 || w.tasksCount >= 5);
    if (overloaded.length > 0) risks.push(`${overloaded.length} team member${overloaded.length > 1 ? 's were' : ' was'} identified as having high workload during the project.`);
    if (pendingTasks > 0 && progress < 100) risks.push(`${pendingTasks} task${pendingTasks > 1 ? 's remain' : ' remains'} incomplete.`);
    if (risks.length === 0) risks.push("No significant risk factors were identified during this project.");

    const recommendations = [];
    if (overdueTasks > 0) recommendations.push("Implement stricter deadline tracking with automated reminders for future projects.");
    if (overloaded.length > 0) recommendations.push("Consider distributing workload more evenly across team members in future initiatives.");
    if (avgTaskDuration > 14) recommendations.push("Break down large tasks into smaller, more manageable sub-tasks to improve velocity.");
    if (teamUtilization < 70) recommendations.push("Optimize team sizing to ensure higher member engagement and utilization.");
    recommendations.push("Document lessons learned and best practices identified during this project for organizational knowledge base.");

    const handlePrint = () => {
        window.print();
    };

    // Section counter
    let sectionNum = 0;

    return (
        <div className="report-overlay" onClick={onClose}>
            <div className="report-document" onClick={e => e.stopPropagation()}>

                {/* ===== COVER PAGE ===== */}
                <div className="report-cover">
                    <div className="cover-logo-row">
                        <div className="cover-logo-icon"><FaProjectDiagram /></div>
                        <div>
                            <div className="cover-company-name">StaffSpire</div>
                            <div className="cover-company-sub">Project Management System</div>
                        </div>
                    </div>

                    <div className="cover-doc-type">Project Completion Report</div>
                    <h1 className="cover-project-title">{project.project_name}</h1>
                    <div className="cover-project-code">Code: {project.project_code} &nbsp;•&nbsp; {deptName}</div>

                    <div className="cover-meta-grid">
                        <div className="cover-meta-item">
                            <div className="cover-meta-label">Project Manager</div>
                            <div className="cover-meta-value">{managerName}</div>
                        </div>
                        <div className="cover-meta-item">
                            <div className="cover-meta-label">Department</div>
                            <div className="cover-meta-value">{deptName}</div>
                        </div>
                        <div className="cover-meta-item">
                            <div className="cover-meta-label">Duration</div>
                            <div className="cover-meta-value">{fmtDate(project.start_date)} — {fmtDate(project.end_date)}</div>
                        </div>
                        <div className="cover-meta-item">
                            <div className="cover-meta-label">Status</div>
                            <div className="cover-meta-value" style={{ color: "#4ade80" }}>✓ {project.status || "Completed"}</div>
                        </div>
                    </div>

                    <div className="cover-confidential">
                        CONFIDENTIAL — This document contains proprietary project information. Distribution is restricted to authorized personnel only.
                    </div>
                </div>

                {/* ===== REPORT BODY ===== */}
                <div className="report-body">

                    {/* 1. Executive Summary */}
                    <div className="report-section">
                        <div className="report-section-header">
                            <div className="section-number">{++sectionNum}</div>
                            <div>
                                <h2 className="section-title">Executive Summary</h2>
                                <p className="section-subtitle">High-level overview of project outcomes and key metrics</p>
                            </div>
                        </div>
                        <div className="exec-summary-text">
                            Project <strong>"{project.project_name}"</strong> ({project.project_code}) was executed by the <strong>{deptName}</strong> department
                            under the leadership of <strong>{managerName}</strong>.
                            The project spanned <strong>{totalDuration} days</strong> from {fmtDate(project.start_date)} to {fmtDate(project.end_date)},
                            with a team of <strong>{members.length} member{members.length !== 1 ? "s" : ""}</strong>.
                            <br /><br />
                            A total of <strong>{totalTasks} task{totalTasks !== 1 ? "s" : ""}</strong> were assigned, of which <strong>{completedTasks}</strong> ({completionRate}%)
                            were completed. <strong>{onTimeTasks}</strong> task{onTimeTasks !== 1 ? "s were" : " was"} delivered on-time, yielding an on-time delivery rate
                            of <strong>{onTimeRate}%</strong>.
                            {totalMilestones > 0 && <> The project had <strong>{totalMilestones} milestone{totalMilestones !== 1 ? "s" : ""}</strong>, of which <strong>{completedMilestones}</strong> ({milestoneRate}%) were achieved.</>}
                            <br /><br />
                            Overall project health is assessed as: <strong style={{ color: healthColor }}>{healthStatus}</strong>.
                        </div>
                    </div>

                    {/* 2. Project Overview */}
                    <div className="report-section">
                        <div className="report-section-header">
                            <div className="section-number">{++sectionNum}</div>
                            <div>
                                <h2 className="section-title">Project Overview</h2>
                                <p className="section-subtitle">Key project details and configuration</p>
                            </div>
                        </div>
                        <div className="report-table-container">
                            <table className="report-table">
                                <tbody>
                                    {[
                                        ["Project Name", project.project_name],
                                        ["Project Code", project.project_code],
                                        ["Department", deptName],
                                        ["Project Manager", managerName],
                                        ["Priority", project.priority || "Medium"],
                                        ["Start Date", fmtDate(project.start_date)],
                                        ["Target End Date", fmtDate(project.end_date)],
                                        ["Actual Completion", fmtDate(actualCompDate)],
                                        ["Total Duration", `${totalDuration} days`],
                                        ["Description", project.description || "No description provided."]
                                    ].map(([label, value], i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 700, color: "#1e293b", width: "200px", background: i % 2 === 0 ? "#fafbfc" : "white" }}>{label}</td>
                                            <td style={{ background: i % 2 === 0 ? "#fafbfc" : "white" }}>{value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 3. Task Summary & Breakdown */}
                    <div className="report-section">
                        <div className="report-section-header">
                            <div className="section-number">{++sectionNum}</div>
                            <div>
                                <h2 className="section-title">Task Summary & Breakdown</h2>
                                <p className="section-subtitle">Comprehensive task metrics and detailed task listing</p>
                            </div>
                        </div>

                        <div className="report-kpi-grid">
                            {[
                                { label: "Total Tasks", value: totalTasks, color: "#3b82f6" },
                                { label: "Completed", value: completedTasks, color: "#16a34a" },
                                { label: "In Progress", value: inProgressTasks, color: "#0284c7" },
                                { label: "On Hold", value: onHoldTasks, color: "#64748b" },
                                { label: "Overdue", value: overdueTasks, color: "#ef4444" },
                                { label: "On-Time", value: onTimeTasks, color: "#10b981" }
                            ].map((kpi, i) => (
                                <div key={i} className="report-kpi-card" style={{ "--kpi-color": kpi.color }}>
                                    <div className="kpi-value">{kpi.value}</div>
                                    <div className="kpi-label">{kpi.label}</div>
                                </div>
                            ))}
                        </div>

                        {tasks.length > 0 && (
                            <div className="report-table-container">
                                <table className="report-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Task Title</th>
                                            <th>Assigned To</th>
                                            <th>Priority</th>
                                            <th>Status</th>
                                            <th>Start Date</th>
                                            <th>Due Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasks.map((t, i) => (
                                            <tr key={t.id || i}>
                                                <td style={{ fontWeight: 600, color: "#64748b" }}>{i + 1}</td>
                                                <td style={{ fontWeight: 600, color: "#0f172a" }}>{t.task_title}</td>
                                                <td>{t.employee_name || "Unassigned"}</td>
                                                <td><PriorityBadge priority={t.priority} /></td>
                                                <td><StatusBadge status={t.status} /></td>
                                                <td>{fmtDate(t.start_date)}</td>
                                                <td>{fmtDate(t.deadline)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* 4. Team Roster & Contribution */}
                    <div className="report-section">
                        <div className="report-section-header">
                            <div className="section-number">{++sectionNum}</div>
                            <div>
                                <h2 className="section-title">Team Roster & Contribution</h2>
                                <p className="section-subtitle">Team members and individual workload analysis</p>
                            </div>
                        </div>

                        {members.length > 0 && (
                            <div className="report-table-container" style={{ marginBottom: "20px" }}>
                                <table className="report-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Department</th>
                                            <th>Designation</th>
                                            <th>Tasks</th>
                                            <th>Completed</th>
                                            <th>Workload Pts</th>
                                            <th>Completion %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {workloadList.length > 0 ? workloadList.map((w, i) => {
                                            const compPct = w.workloadPoints > 0 ? Math.round((w.completedPoints / w.workloadPoints) * 100) : 0;
                                            const memberInfo = members.find(m => m.employee_id === w.id);
                                            return (
                                                <tr key={w.id || i}>
                                                    <td style={{ fontWeight: 600, color: "#64748b" }}>{i + 1}</td>
                                                    <td style={{ fontWeight: 600, color: "#0f172a" }}>{w.name}</td>
                                                    <td>{memberInfo?.department || w.department || "—"}</td>
                                                    <td>{memberInfo?.designation || "—"}</td>
                                                    <td style={{ textAlign: "center" }}>{w.tasksCount}</td>
                                                    <td style={{ textAlign: "center" }}>{w.completedCount}</td>
                                                    <td style={{ textAlign: "center" }}>{w.workloadPoints}</td>
                                                    <td>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                            <div className="rpt-progress-bar-bg" style={{ flex: 1 }}>
                                                                <div className="rpt-progress-bar-fill" style={{
                                                                    width: `${compPct}%`,
                                                                    background: compPct === 100 ? "#16a34a" : compPct >= 50 ? "#3b82f6" : "#f59e0b"
                                                                }} />
                                                            </div>
                                                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155", minWidth: "36px" }}>{compPct}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }) : members.map((m, i) => (
                                            <tr key={m.employee_id || i}>
                                                <td style={{ fontWeight: 600, color: "#64748b" }}>{i + 1}</td>
                                                <td style={{ fontWeight: 600, color: "#0f172a" }}>{m.first_name} {m.last_name}</td>
                                                <td>{m.department || "—"}</td>
                                                <td>{m.designation || "—"}</td>
                                                <td style={{ textAlign: "center" }}>—</td>
                                                <td style={{ textAlign: "center" }}>—</td>
                                                <td style={{ textAlign: "center" }}>—</td>
                                                <td>—</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* 5. Milestone Tracker */}
                    {milestones.length > 0 && (
                        <div className="report-section">
                            <div className="report-section-header">
                                <div className="section-number">{++sectionNum}</div>
                                <div>
                                    <h2 className="section-title">Milestone Tracker</h2>
                                    <p className="section-subtitle">Key project milestones and their achievement status</p>
                                </div>
                            </div>
                            <div className="report-table-container">
                                <table className="report-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Milestone</th>
                                            <th>Description</th>
                                            <th>Due Date</th>
                                            <th>Status</th>
                                            <th>Completed On</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {milestones.map((ms, i) => (
                                            <tr key={ms.id || i}>
                                                <td style={{ fontWeight: 600, color: "#64748b" }}>{i + 1}</td>
                                                <td style={{ fontWeight: 600, color: "#0f172a" }}>{ms.title || ms.name}</td>
                                                <td>{ms.description || "—"}</td>
                                                <td>{fmtDate(ms.due_date)}</td>
                                                <td><StatusBadge status={ms.status} /></td>
                                                <td>{ms.status === "Completed" ? fmtDate(ms.completion_date || ms.updated_at) : "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 6. Performance Metrics */}
                    <div className="report-section">
                        <div className="report-section-header">
                            <div className="section-number">{++sectionNum}</div>
                            <div>
                                <h2 className="section-title">Project Performance Metrics</h2>
                                <p className="section-subtitle">Quantitative analysis of project execution performance</p>
                            </div>
                        </div>
                        <div className="perf-metrics-grid">
                            <div className="perf-metric-card">
                                <div className="perf-metric-value" style={{ color: completionRate === 100 ? "#16a34a" : "#f59e0b" }}>
                                    {completionRate}%
                                </div>
                                <div className="perf-metric-label">Task Completion Rate</div>
                                <div className="perf-metric-detail">{completedTasks} of {totalTasks} tasks</div>
                            </div>
                            <div className="perf-metric-card">
                                <div className="perf-metric-value" style={{ color: onTimeRate >= 80 ? "#16a34a" : onTimeRate >= 50 ? "#f59e0b" : "#ef4444" }}>
                                    {onTimeRate}%
                                </div>
                                <div className="perf-metric-label">On-Time Delivery</div>
                                <div className="perf-metric-detail">{onTimeTasks} of {completedTasks} on time</div>
                            </div>
                            <div className="perf-metric-card">
                                <div className="perf-metric-value" style={{ color: "#3b82f6" }}>
                                    {avgTaskDuration}d
                                </div>
                                <div className="perf-metric-label">Avg Task Duration</div>
                                <div className="perf-metric-detail">Across {completedWithDates.length} completed tasks</div>
                            </div>
                            <div className="perf-metric-card">
                                <div className="perf-metric-value" style={{ color: teamUtilization >= 70 ? "#16a34a" : "#f59e0b" }}>
                                    {teamUtilization}%
                                </div>
                                <div className="perf-metric-label">Team Utilization</div>
                                <div className="perf-metric-detail">{membersWithTasks} of {members.length} members active</div>
                            </div>
                            {totalMilestones > 0 && (
                                <div className="perf-metric-card">
                                    <div className="perf-metric-value" style={{ color: milestoneRate === 100 ? "#16a34a" : "#7c3aed" }}>
                                        {milestoneRate}%
                                    </div>
                                    <div className="perf-metric-label">Milestone Achievement</div>
                                    <div className="perf-metric-detail">{completedMilestones} of {totalMilestones} milestones</div>
                                </div>
                            )}
                            <div className="perf-metric-card">
                                <div className="perf-metric-value" style={{ color: healthColor }}>
                                    {healthStatus}
                                </div>
                                <div className="perf-metric-label">Overall Health</div>
                                <div className="perf-metric-detail">Based on completion & delivery</div>
                            </div>
                        </div>

                        {/* Priority Distribution */}
                        <div style={{ marginTop: "20px" }}>
                            <h4 style={{ margin: "0 0 12px", color: "#1e293b", fontSize: "0.95rem" }}>Priority Distribution</h4>
                            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                {[
                                    { label: "Critical", count: priCritical, color: "#7f1d1d", bg: "#fef2f2" },
                                    { label: "High", count: priHigh, color: "#b91c1c", bg: "#fee2e2" },
                                    { label: "Medium", count: priMedium, color: "#c2410c", bg: "#ffedd5" },
                                    { label: "Low", count: priLow, color: "#475569", bg: "#f1f5f9" }
                                ].map((p, i) => (
                                    <div key={i} style={{
                                        background: p.bg, color: p.color, padding: "10px 18px", borderRadius: "10px",
                                        fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px",
                                        border: `1px solid ${p.bg}`
                                    }}>
                                        <span style={{ fontSize: "1.2rem", fontWeight: 900 }}>{p.count}</span> {p.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 7. Observations & Recommendations */}
                    <div className="report-section">
                        <div className="report-section-header">
                            <div className="section-number">{++sectionNum}</div>
                            <div>
                                <h2 className="section-title">Observations & Recommendations</h2>
                                <p className="section-subtitle">Key findings, risk areas, and actionable suggestions</p>
                            </div>
                        </div>
                        <div className="report-obs-grid">
                            <div className="report-obs-card highlights">
                                <div className="obs-card-title" style={{ color: "#166534" }}>
                                    <FaCheckCircle color="#16a34a" /> Highlights
                                </div>
                                <ul className="obs-card-list">
                                    {highlights.map((h, i) => <li key={i}>{h}</li>)}
                                </ul>
                            </div>
                            <div className="report-obs-card risks">
                                <div className="obs-card-title" style={{ color: "#991b1b" }}>
                                    <FaExclamationTriangle color="#ef4444" /> Risk Areas
                                </div>
                                <ul className="obs-card-list">
                                    {risks.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                            </div>
                            <div className="report-obs-card recommendations">
                                <div className="obs-card-title" style={{ color: "#1e40af" }}>
                                    <FaLightbulb color="#3b82f6" /> Recommendations
                                </div>
                                <ul className="obs-card-list">
                                    {recommendations.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ===== REPORT FOOTER ===== */}
                <div className="report-footer">
                    <div className="report-footer-block">
                        <strong>Report Generated</strong>
                        {new Date().toLocaleString("en-US", {
                            weekday: "long", year: "numeric", month: "long", day: "numeric",
                            hour: "2-digit", minute: "2-digit"
                        })}
                    </div>
                    <div className="report-footer-block">
                        <strong>Generated By</strong>
                        {generatedBy}
                    </div>
                    <div className="report-footer-block">
                        <strong>Project Manager</strong>
                        {managerName}
                    </div>
                    <div className="report-footer-block">
                        <strong>Document Reference</strong>
                        RPT-{project.project_code}-{new Date().toISOString().slice(0, 10).replace(/-/g, "")}
                    </div>
                    <div className="report-footer-notice">
                        This is a system-generated report from StaffSpire Project Management System.
                        The data presented reflects the state of the project at the time of report generation.
                        For any discrepancies, please contact the project manager or system administrator.
                    </div>
                </div>

            </div>

            {/* Floating Toolbar */}
            <div className="report-toolbar" onClick={e => e.stopPropagation()}>
                <button className="btn-print-report" onClick={handlePrint}>
                    <FaPrint /> Print / Save as PDF
                </button>
                <button className="btn-close-report" onClick={onClose}>
                    <FaTimes /> Close Report
                </button>
            </div>
        </div>
    );
}
