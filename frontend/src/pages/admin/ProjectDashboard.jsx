import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import useSWR from "swr";
import { Chart, registerables } from "chart.js";
import DashboardLayout from "../layouts/DashboardLayout";
import { 
    FaFolder, FaCheckCircle, FaPauseCircle, FaExclamationTriangle, 
    FaChartLine, FaPlus, FaEllipsisH, FaSearch
} from "react-icons/fa";

Chart.register(...registerables);

const fetcher = (url) => axios.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }).then(res => res.data);

function ProjectDashboard() {
    const token = localStorage.getItem("token");
    const [search, setSearch] = useState("");

    // Fetch analytics
    const { data: analyticsData, isLoading: analyticsLoading } = useSWR(token ? "http://localhost:5000/api/projects/analytics" : null, fetcher);
    // Fetch projects
    const { data: projectsData, isLoading: projectsLoading } = useSWR(token ? "http://localhost:5000/api/projects" : null, fetcher);

    const stats = analyticsData?.stats || { total: 0, active: 0, completed: 0, on_hold: 0, overdue: 0, avg_progress: 0 };
    const deptDist = analyticsData?.deptDist || [];
    const projects = projectsData?.projects || [];

    const deptChartRef = useRef(null);
    const statusChartRef = useRef(null);
    const deptChartInstance = useRef(null);
    const statusChartInstance = useRef(null);

    // Filter projects
    const filteredProjects = projects.filter(p => 
        p.project_name.toLowerCase().includes(search.toLowerCase()) || 
        (p.project_code && p.project_code.toLowerCase().includes(search.toLowerCase()))
    );

    useEffect(() => {
        if (analyticsLoading) return;

        // 1. Department Distribution (Doughnut)
        if (deptChartRef.current && deptDist.length > 0) {
            const ctxDonut = deptChartRef.current.getContext('2d');
            if (deptChartInstance.current) deptChartInstance.current.destroy();

            deptChartInstance.current = new Chart(ctxDonut, {
                type: 'doughnut',
                data: {
                    labels: deptDist.map(d => d.name),
                    datasets: [{
                        data: deptDist.map(d => d.value),
                        backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4'],
                        borderWidth: 0, hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, cutout: '75%',
                    plugins: { legend: { position: 'right' } }
                }
            });
        }

        // 2. Project Statuses (Bar)
        if (statusChartRef.current && stats.total > 0) {
            const ctxBar = statusChartRef.current.getContext('2d');
            if (statusChartInstance.current) statusChartInstance.current.destroy();

            statusChartInstance.current = new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: ['Active', 'Completed', 'On Hold', 'Overdue'],
                    datasets: [{
                        label: 'Projects',
                        data: [stats.active, stats.completed, stats.on_hold, stats.overdue],
                        backgroundColor: ['#3b82f6', '#22c55e', '#6b7280', '#ef4444'],
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }
            });
        }

        return () => {
            if (deptChartInstance.current) deptChartInstance.current.destroy();
            if (statusChartInstance.current) statusChartInstance.current.destroy();
        };
    }, [analyticsLoading, deptDist, stats]);

    return (
        <DashboardLayout>
            <div className="attendance-page-container">
                <div className="employee-header" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h1 className="page-title" style={{ margin: 0 }}>Project Progress Tracker</h1>
                    <button type="button" style={{
                        background: "linear-gradient(135deg, #4f8cff, #6366f1)", color: "white", 
                        border: "none", padding: "12px 22px", borderRadius: "10px", 
                        cursor: "pointer", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px"
                    }}>
                        <FaPlus /> New Project
                    </button>
                </div>

                {/* KPI Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                    <div style={{ background: "white", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                        <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "8px" }}>Total Projects</div>
                        <div style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                            {stats.total} <FaFolder style={{ color: "#4f8cff", fontSize: "20px" }} />
                        </div>
                    </div>
                    <div style={{ background: "white", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                        <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "8px" }}>Active</div>
                        <div style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                            {stats.active} <FaChartLine style={{ color: "#3b82f6", fontSize: "20px" }} />
                        </div>
                    </div>
                    <div style={{ background: "white", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                        <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "8px" }}>Completed</div>
                        <div style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                            {stats.completed} <FaCheckCircle style={{ color: "#22c55e", fontSize: "20px" }} />
                        </div>
                    </div>
                    <div style={{ background: "white", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                        <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "8px" }}>On Hold</div>
                        <div style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                            {stats.on_hold} <FaPauseCircle style={{ color: "#6b7280", fontSize: "20px" }} />
                        </div>
                    </div>
                    <div style={{ background: "white", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                        <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "8px" }}>Overdue</div>
                        <div style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                            {stats.overdue} <FaExclamationTriangle style={{ color: "#ef4444", fontSize: "20px" }} />
                        </div>
                    </div>
                    <div style={{ background: "white", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                        <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "8px" }}>Avg Progress</div>
                        <div style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                            {stats.avg_progress}%
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>
                    <div className="bento-card" style={{ height: "320px" }}>
                        <h3 style={{ margin: "0 0 16px" }}>Department Distribution</h3>
                        <div style={{ position: "relative", height: "calc(100% - 40px)" }}>
                            <canvas ref={deptChartRef}></canvas>
                        </div>
                    </div>
                    <div className="bento-card" style={{ height: "320px" }}>
                        <h3 style={{ margin: "0 0 16px" }}>Projects by Status</h3>
                        <div style={{ position: "relative", height: "calc(100% - 40px)" }}>
                            <canvas ref={statusChartRef}></canvas>
                        </div>
                    </div>
                </div>

                {/* Projects List */}
                <div className="bento-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <h3 style={{ margin: 0 }}>Active Projects</h3>
                        <div className="search-box" style={{ width: "250px", display: "flex", alignItems: "center", background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <FaSearch style={{ color: "#94a3b8", marginRight: "8px" }} />
                            <input 
                                type="text" placeholder="Search projects..." 
                                value={search} onChange={e => setSearch(e.target.value)}
                                style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "14px" }}
                            />
                        </div>
                    </div>

                    <div className="table-container-custom">
                        <table className="employee-table">
                            <thead>
                                <tr>
                                    <th>Project</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Timeline</th>
                                    <th>Progress</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projectsLoading ? (
                                    <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading projects...</td></tr>
                                ) : filteredProjects.length === 0 ? (
                                    <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No projects found.</td></tr>
                                ) : filteredProjects.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <div style={{ background: p.project_color || "#4f8cff", width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                                                    <FaFolder />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: "600", color: "#1e293b" }}>{p.project_name}</div>
                                                    <div style={{ fontSize: "12px", color: "#64748b" }}>{p.project_code}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="dept-tag">{p.department_id || "Cross-Functional"}</span></td>
                                        <td>
                                            <span style={{ 
                                                background: p.status === 'Completed' ? '#dcfce7' : p.status === 'Overdue' ? '#fee2e2' : '#dbeafe', 
                                                color: p.status === 'Completed' ? '#14532d' : p.status === 'Overdue' ? '#7f1d1d' : '#1e40af',
                                                padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" 
                                            }}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: "13px", color: "#475569" }}>
                                            {new Date(p.start_date).toLocaleDateString()} - {new Date(p.end_date).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <div style={{ flex: 1, height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                                                    <div style={{ width: `${p.completion_percentage}%`, height: "100%", background: p.completion_percentage === 100 ? "#22c55e" : "#4f8cff" }}></div>
                                                </div>
                                                <span style={{ fontSize: "12px", fontWeight: "600", color: "#475569", width: "30px" }}>{p.completion_percentage}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <button type="button" style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                                                <FaEllipsisH />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ProjectDashboard;
