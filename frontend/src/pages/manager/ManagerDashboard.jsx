import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import useSWR from "swr";
import { Chart, registerables } from "chart.js";
import DashboardLayout from "../layouts/DashboardLayout";
import { 
    FaUsers, FaUserCheck, FaUserTimes, 
    FaClipboardList, FaTasks, FaCheckCircle, 
    FaClock, FaChartBar, FaArrowUp, FaCog,
    FaArrowRight, FaPlusCircle, FaTools, FaFileAlt
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

Chart.register(...registerables);

function ManagerDashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const attendanceChartRef = useRef(null);
    const attendanceChartInstance = useRef(null);

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
        activities: [],
        attendanceTrend: {
            labels: [],
            data: []
        },
        projectProgress: []
    });

    const fetcher = (url) => axios.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }).then(res => res.data);
    const { data: dashData, error: dashError, isLoading } = useSWR(token ? "http://localhost:5000/api/admin/manager/dashboard-info" : null, fetcher);

    useEffect(() => {
        setLoading(isLoading && !dashData);
        if (dashError) {
            setError("An error occurred while fetching dashboard statistics.");
        } else if (dashData) {
            if (dashData.success) {
                const resData = dashData;
                setData({
                    departmentInfo: {
                        departmentName: resData.departmentInfo?.departmentName || "",
                        managerName: resData.departmentInfo?.managerName || "",
                        teamSize: resData.departmentInfo?.teamSize !== undefined ? resData.departmentInfo.teamSize : 0,
                        attendanceRate: resData.departmentInfo?.attendanceRate !== undefined ? resData.departmentInfo.attendanceRate : 0
                    },
                    widgets: {
                        presentToday: resData.widgets?.presentToday !== undefined ? resData.widgets.presentToday : 0,
                        lateToday: resData.widgets?.lateToday !== undefined ? resData.widgets.lateToday : 0,
                        absentToday: resData.widgets?.absentToday !== undefined ? resData.widgets.absentToday : 0,
                        pendingLeaves: resData.widgets?.pendingLeaves !== undefined ? resData.widgets.pendingLeaves : 0,
                        activeTasks: resData.widgets?.activeTasks !== undefined ? resData.widgets.activeTasks : 0,
                        completedTasks: resData.widgets?.completedTasks !== undefined ? resData.widgets.completedTasks : 0
                    },
                    activities: resData.activities || [],
                    attendanceTrend: resData.attendanceTrend || {
                        labels: [],
                        data: []
                    },
                    projectProgress: resData.projectProgress || []
                });
            } else {
                setError("Failed to fetch dashboard data.");
            }
        }
    }, [dashData, dashError, isLoading]);

    // Draw Line Chart on data changes
    useEffect(() => {
        if (loading) return;

        const trend = data.attendanceTrend;
        if (attendanceChartRef.current && trend && trend.labels && trend.labels.length > 0) {
            const visibleLabels = trend.labels;
            const visibleData = trend.data;

            const ctxArea = attendanceChartRef.current.getContext('2d');
            if (attendanceChartInstance.current) {
                attendanceChartInstance.current.destroy();
            }

            let gradient = ctxArea.createLinearGradient(0, 0, 0, 240);
            gradient.addColorStop(0, 'rgba(0, 74, 198, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 74, 198, 0)');

            attendanceChartInstance.current = new Chart(ctxArea, {
                type: 'line',
                data: {
                    labels: visibleLabels,
                    datasets: [{
                        label: 'Present',
                        data: visibleData,
                        borderColor: '#004ac6',
                        backgroundColor: gradient,
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.35,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#004ac6',
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#191b23',
                            padding: 12,
                            titleFont: { size: 13, weight: 'bold' },
                            bodyFont: { size: 13 },
                            cornerRadius: 8
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(225, 226, 237, 0.4)' },
                            ticks: { maxTicksLimit: 5 }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });
        }

        return () => {
            if (attendanceChartInstance.current) {
                attendanceChartInstance.current.destroy();
            }
        };
    }, [loading, data.attendanceTrend]);

    if (loading) {
        return (
            <DashboardLayout>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
                    <div style={{ fontSize: "18px", fontWeight: "600", color: "#004ac6" }}>Loading Dashboard...</div>
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

    const { departmentInfo, widgets, activities, attendanceTrend, projectProgress } = data;

    return (
        <DashboardLayout>
            <div className="manager-dashboard-container">
                {/* 1. Breadcrumbs & Actions Header */}
                <div className="manager-page-header">
                    <div className="manager-page-title">
                        <nav style={{ display: "flex", fontSize: "12px", color: "#585F6C", gap: "8px", marginBottom: "4px" }}>
                            <span>Home</span>
                            <span>/</span>
                            <span style={{ color: "#191B23", fontWeight: "500" }}>Team Management</span>
                        </nav>
                        <h2>Department Overview</h2>
                    </div>
                    <div className="manager-header-actions">
                        <button className="btn-review-leaves" onClick={() => navigate("/admin/leaves")}>
                            <FaFileAlt style={{ fontSize: "14px" }} />
                            Review Leaves
                        </button>
                        <button className="btn-assign-task" onClick={() => navigate("/admin/tasks")}>
                            <FaTasks style={{ fontSize: "14px" }} />
                            Assign Team Task
                        </button>
                        <button className="btn-team-report" onClick={() => navigate("/reports")}>
                            <FaChartBar style={{ fontSize: "14px" }} />
                            Team Report
                        </button>
                    </div>
                </div>

                {/* 2. Top Department Info Card */}
                <div className="dept-summary-card">
                    <div className="dept-summary-bg-gradient"></div>
                    <div className="dept-summary-left">
                        <div className="dept-icon-box">
                            <FaCog />
                        </div>
                        <div className="dept-details">
                            <h3>{departmentInfo.departmentName}</h3>
                            <p>Manager: <strong style={{ color: "#191B23" }}>{departmentInfo.managerName}</strong></p>
                        </div>
                    </div>
                    <div className="dept-summary-right">
                        <div className="dept-stat-item">
                            <p className="label">Team Size</p>
                            <p className="value">{departmentInfo.teamSize}</p>
                        </div>
                        <div className="dept-stat-item">
                            <p className="label">Attendance</p>
                            <div className="dept-stat-attendance-container">
                                <p className="value">{departmentInfo.attendanceRate}%</p>
                                <span className="dept-stat-attendance-badge">
                                    <FaArrowUp style={{ fontSize: "10px" }} /> 2%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Five-Column KPI widgets */}
                <div className="manager-kpi-grid">
                    {/* Widget 1: Present */}
                    <div className="manager-kpi-card">
                        <div className="manager-kpi-header blue">
                            <FaUserCheck style={{ fontSize: "18px" }} />
                            <span className="time-tag">Today</span>
                        </div>
                        <div className="manager-kpi-body">
                            <p className="manager-kpi-value">{widgets.presentToday}</p>
                            <p className="manager-kpi-label">Present</p>
                        </div>
                    </div>

                    {/* Widget 2: Late */}
                    <div className="manager-kpi-card">
                        <div className="manager-kpi-header yellow">
                            <FaClock style={{ fontSize: "18px" }} />
                            <span className="time-tag">Today</span>
                        </div>
                        <div className="manager-kpi-body">
                            <p className="manager-kpi-value">{widgets.lateToday}</p>
                            <p className="manager-kpi-label">Late</p>
                        </div>
                    </div>

                    {/* Widget 3: Absent */}
                    <div className="manager-kpi-card">
                        <div className="manager-kpi-header red">
                            <FaUserTimes style={{ fontSize: "18px" }} />
                            <span className="time-tag">Today</span>
                        </div>
                        <div className="manager-kpi-body">
                            <p className="manager-kpi-value">{widgets.absentToday}</p>
                            <p className="manager-kpi-label">Absent</p>
                        </div>
                    </div>

                    {/* Widget 4: Pending Leaves */}
                    <div className="manager-kpi-card">
                        <div className="manager-kpi-header blue">
                            <FaClipboardList style={{ fontSize: "18px" }} />
                            <span className="time-tag">Action Needed</span>
                        </div>
                        <div className="manager-kpi-body">
                            <p className="manager-kpi-value">{widgets.pendingLeaves}</p>
                            <p className="manager-kpi-label">Pending Leaves</p>
                        </div>
                    </div>

                    {/* Widget 5: Active Tasks */}
                    <div className="manager-kpi-card">
                        <div className="manager-kpi-header blue">
                            <FaTasks style={{ fontSize: "18px" }} />
                            <span className="time-tag">In Progress</span>
                        </div>
                        <div className="manager-kpi-body">
                            <p className="manager-kpi-value">{widgets.activeTasks}</p>
                            <p className="manager-kpi-label">Active Tasks</p>
                        </div>
                    </div>
                </div>

                {/* 4. Bento Grid (Trend chart, Progress bars, Activity feed) */}
                <div className="manager-bento-grid">
                    {/* Left side: charts and progress */}
                    <div className="manager-bento-left">
                        {/* Team Attendance Trend Line Chart */}
                        <div className="manager-bento-card">
                            <h3 className="manager-bento-card-title">Team Attendance Trend</h3>
                            <div style={{ height: "240px", position: "relative" }}>
                                <canvas ref={attendanceChartRef}></canvas>
                            </div>
                        </div>

                        {/* Project progress bars card */}
                        <div className="manager-bento-card">
                            <h3 className="manager-bento-card-title" style={{ marginBottom: "24px" }}>Key Project Progress</h3>
                            <div className="progress-list">
                                {projectProgress.length === 0 ? (
                                    <div style={{ color: "#737686", fontSize: "14px", padding: "16px 0", textAlign: "center" }}>
                                        No active tasks or project progress to show.
                                    </div>
                                ) : (
                                    projectProgress.map((proj, idx) => {
                                        let fillColorClass = "blue";
                                        if (idx === 1) fillColorClass = "teal";
                                        else if (idx === 2) fillColorClass = "tint";

                                        return (
                                            <div key={idx}>
                                                <div className="progress-item-header">
                                                    <span>{proj.name}</span>
                                                    <span style={{ fontWeight: "600" }}>{proj.progress}%</span>
                                                </div>
                                                <div className="progress-bar-bg">
                                                    <div className={`progress-bar-fill ${fillColorClass}`} style={{ width: `${proj.progress}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right side: activity feed */}
                    <div className="manager-bento-card" style={{ gridColumn: "span 1" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h3 className="manager-bento-card-title" style={{ marginBottom: 0 }}>Activity Timeline</h3>
                            <button className="text-primary text-label-sm font-label-sm hover:underline" style={{ background: "none", border: "none", color: "#004ac6", cursor: "pointer", fontSize: "12px", fontWeight: "600" }} onClick={() => navigate("/reports")}>View All</button>
                        </div>
                        <div style={{ position: "relative", paddingLeft: "16px", borderLeft: "2px solid #E5E7EB", display: "flex", flexDirection: "column", gap: "24px", margin: "12px 0 0 12px" }}>
                            {activities.length === 0 ? (
                                <div style={{ color: "#737686", fontSize: "14px", padding: "16px 0", textAlign: "left" }}>
                                    No recent team activities to show.
                                </div>
                            ) : (
                                activities.map((act, index) => {
                                    let dotColor = "#004ac6"; // blue
                                    if (act.type === "checkout" || act.type === "checkout") dotColor = "#dc2626"; // red
                                    else if (act.type === "leave") dotColor = "#d97706"; // orange
                                    else if (act.type === "task") dotColor = "#005a82"; // secondary

                                    return (
                                        <div className="relative" key={index} style={{ position: "relative" }}>
                                            <div 
                                                className="absolute rounded-full" 
                                                style={{ 
                                                    left: "-21px", 
                                                    top: "4px", 
                                                    width: "10px", 
                                                    height: "10px", 
                                                    backgroundColor: dotColor,
                                                    border: "4px solid #ffffff",
                                                    boxShadow: "0 0 0 1px #E5E7EB"
                                                }}
                                            ></div>
                                            <p style={{ fontSize: "14px", fontWeight: "500", color: "#191B23", margin: 0, textAlign: "left" }}>
                                                {act.text}
                                            </p>
                                            <p style={{ fontSize: "12px", color: "#585F6C", margin: "4px 0 0 0", textAlign: "left" }}>
                                                {act.time}
                                            </p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ManagerDashboard;