import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import ReportFilters from "./components/ReportFilters";
import ReportTable from "./components/ReportTable";
import ExportButtons from "./components/ExportButtons";
import ReportSummaryCards from "./components/ReportSummaryCards";
import PrintReport from "./components/PrintReport";
import { FaChartBar } from "react-icons/fa";

const API = "http://localhost:5000/api";

function ReportsDashboard() {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const role = user.role || "Employee";

    const getTabsForRole = () => {
        if (role === "Admin") {
            return [
                { id: "employees", name: "Employee Report", icon: "👥" },
                { id: "attendance", name: "Attendance Report", icon: "📋" },
                { id: "leaves", name: "Leave Report", icon: "🏖️" },
                { id: "tasks", name: "Task Report", icon: "📌" },
                { id: "departments", name: "Department Report", icon: "🏢" }
            ];
        } else if (role === "Manager") {
            return [
                { id: "attendance", name: "Attendance Report", icon: "📋" },
                { id: "leaves", name: "Leave Report", icon: "🏖️" },
                { id: "tasks", name: "Task Report", icon: "📌" },
                { id: "departments", name: "Department Summary", icon: "🏢" }
            ];
        } else {
            return [
                { id: "attendance", name: "My Attendance", icon: "📋" },
                { id: "leaves", name: "My Leaves", icon: "🏖️" },
                { id: "tasks", name: "My Tasks", icon: "📌" }
            ];
        }
    };

    const tabs = getTabsForRole();
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || "attendance");
    const [data, setData] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        search: "", department: "", employee: "", status: "", priority: "",
        month: "", year: "", from: "", to: "", sort: "DESC"
    });

    useEffect(() => {
        setFilters({
            search: "", department: "", employee: "", status: "", priority: "",
            month: "", year: "", from: "", to: "", sort: "DESC"
        });
        setData([]);
        setStats(null);
    }, [activeTab]);

    const fetchReportData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== "") queryParams.append(k, v);
            });

            const url = `${API}/reports/${activeTab}?${queryParams.toString()}`;
            const response = await axios.get(url, { headers });
            if (response.data && response.data.success) {
                setData(response.data.data || []);
                setStats(response.data.stats || null);
            }
        } catch (error) {
            console.error("Error loading report data:", error);
        } finally {
            setLoading(false);
        }
    }, [activeTab, filters]);

    useEffect(() => { fetchReportData(); }, [fetchReportData]);

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleReset = () => {
        setFilters({
            search: "", department: "", employee: "", status: "", priority: "",
            month: "", year: "", from: "", to: "", sort: "DESC"
        });
    };

    const getColumnsConfig = () => {
        switch (activeTab) {
            case "employees":
                return {
                    columns: ["Employee ID", "Name", "Department", "Designation", "Email", "Mobile", "Joining Date", "Type", "Status"],
                    keys: ["employee_id", "name", "department", "designation", "email", "mobile", "joining_date", "employment_type", "status"]
                };
            case "attendance":
                return {
                    columns: ["Date", "Employee ID", "Employee Name", "Department", "Check In", "Check Out", "Working Hours", "Status"],
                    keys: ["date", "employee_id", "employee_name", "department", "check_in", "check_out", "working_hours", "attendance_status"]
                };
            case "leaves":
                return {
                    columns: ["Employee ID", "Employee", "Department", "Leave Type", "Start Date", "End Date", "Days", "Status"],
                    keys: ["employee_id", "employee", "department", "leave_type", "start_date", "end_date", "total_days", "status"]
                };
            case "tasks":
                return {
                    columns: ["Task ID", "Task Title", "Assigned To", "Assigned By", "Priority", "Due Date", "Created", "Status"],
                    keys: ["task_id", "task_title", "assigned_employee", "assigned_by", "priority", "due_date", "start_date", "status"]
                };
            default:
                return {
                    columns: ["Department", "Head", "Employees", "Present", "Absent", "Tasks", "Leaves"],
                    keys: ["department", "department_head", "employees", "present_today", "absent_today", "active_tasks", "pending_leaves"]
                };
        }
    };

    const config = getColumnsConfig();
    const handlePrint = () => window.print();

    // Stats panel helper
    const renderStatsPanel = () => {
        if (!stats) return null;

        let items = [];
        if (activeTab === "employees") {
            items = [
                { label: "Total Employees", value: stats.totalEmployees, color: "#4f8cff", bg: "#eff6ff" },
                { label: "Active", value: stats.activeEmployees, color: "#22c55e", bg: "#dcfce7" },
                { label: "Inactive", value: stats.inactiveEmployees, color: "#ef4444", bg: "#fee2e2" }
            ];
        } else if (activeTab === "attendance") {
            items = [
                { label: "Present", value: stats.presentDays, color: "#22c55e", bg: "#dcfce7" },
                { label: "Absent", value: stats.absentDays, color: "#ef4444", bg: "#fee2e2" },
                { label: "Late", value: stats.lateDays, color: "#f59e0b", bg: "#fef9c3" },
                { label: "Attendance Rate", value: `${stats.attendancePercentage}%`, color: "#8b5cf6", bg: "#f3e8ff" }
            ];
        } else if (activeTab === "leaves") {
            items = [
                { label: "Total Requests", value: stats.totalRequests, color: "#4f8cff", bg: "#eff6ff" },
                { label: "Approved", value: stats.approved, color: "#22c55e", bg: "#dcfce7" },
                { label: "Pending", value: stats.pending, color: "#f59e0b", bg: "#fef9c3" },
                { label: "Rejected", value: stats.rejected, color: "#ef4444", bg: "#fee2e2" }
            ];
        } else if (activeTab === "tasks") {
            items = [
                { label: "Total Tasks", value: stats.totalTasks, color: "#4f8cff", bg: "#eff6ff" },
                { label: "Pending + In Progress", value: stats.pending + stats.inProgress, color: "#f59e0b", bg: "#fef9c3" },
                { label: "Completed", value: stats.completed, color: "#22c55e", bg: "#dcfce7" },
                { label: "Overdue", value: stats.overdue, color: "#ef4444", bg: "#fee2e2" }
            ];
        } else if (activeTab === "departments") {
            items = [
                { label: "Total Employees", value: stats.employeeCount, color: "#4f8cff", bg: "#eff6ff" },
                { label: "Avg Attendance", value: `${stats.attendancePercentage}%`, color: "#22c55e", bg: "#dcfce7" },
                { label: "Avg Leave Rate", value: `${stats.leavePercentage}%`, color: "#8b5cf6", bg: "#f3e8ff" }
            ];
        }

        return (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: "14px", marginBottom: "20px" }}>
                {items.map((item, i) => (
                    <div key={i} style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "16px 18px",
                        boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                        borderTop: `3px solid ${item.color}`,
                        transition: "transform 0.2s ease"
                    }}
                        onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                        onMouseOut={(e) => e.currentTarget.style.transform = "none"}
                    >
                        <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</div>
                        <div style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b", marginTop: "6px" }}>{item.value}</div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="attendance-page-container">
                {/* Header */}
                <div className="employee-header" style={{ marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h1 className="page-title" style={{ margin: 0 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                            <FaChartBar style={{ color: "#4f8cff" }} /> Reports Center
                        </span>
                    </h1>
                    <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "500" }}>
                        {loading ? "Loading..." : `${data.length} records found`}
                    </span>
                </div>

                {/* Summary Cards */}
                <ReportSummaryCards />

                {/* Tab Navigation */}
                <div style={{
                    background: "white",
                    borderRadius: "14px",
                    padding: "6px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    marginBottom: "20px",
                    display: "flex",
                    gap: "4px",
                    overflowX: "auto"
                }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                background: activeTab === tab.id ? "linear-gradient(135deg, #4f8cff, #6366f1)" : "transparent",
                                border: "none",
                                borderRadius: "10px",
                                padding: "12px 18px",
                                color: activeTab === tab.id ? "white" : "#64748b",
                                fontWeight: "700",
                                cursor: "pointer",
                                fontSize: "13.5px",
                                transition: "all 0.25s ease",
                                whiteSpace: "nowrap",
                                boxShadow: activeTab === tab.id ? "0 4px 14px rgba(79,140,255,0.3)" : "none"
                            }}
                            onMouseOver={(e) => {
                                if (activeTab !== tab.id) {
                                    e.target.style.background = "#f1f5f9";
                                    e.target.style.color = "#1e293b";
                                }
                            }}
                            onMouseOut={(e) => {
                                if (activeTab !== tab.id) {
                                    e.target.style.background = "transparent";
                                    e.target.style.color = "#64748b";
                                }
                            }}
                        >
                            {tab.icon} {tab.name}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <ReportFilters
                    reportType={activeTab}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleReset}
                />

                {/* Export Buttons Row */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                    gap: "12px"
                }}>
                    <div style={{ fontSize: "14px", color: "#475569", fontWeight: "600" }}>
                        📊 {tabs.find(t => t.id === activeTab)?.name || "Report"}
                    </div>
                    <ExportButtons
                        reportType={activeTab}
                        filters={filters}
                        onPrint={handlePrint}
                    />
                </div>

                {/* Stats Panel */}
                {renderStatsPanel()}

                {/* Data Table */}
                <ReportTable
                    columns={config.columns}
                    keys={config.keys}
                    data={data}
                />

                {/* Hidden Print Layout */}
                <PrintReport
                    reportTitle={tabs.find(t => t.id === activeTab)?.name || "StaffSpire Report"}
                    columns={config.columns}
                    keys={config.keys}
                    data={data}
                />
            </div>
        </DashboardLayout>
    );
}

export default ReportsDashboard;
