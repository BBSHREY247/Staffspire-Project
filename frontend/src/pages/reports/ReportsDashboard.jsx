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
                { label: "Total Employees", value: stats.totalEmployees, border: "border-t-blue-500" },
                { label: "Active", value: stats.activeEmployees, border: "border-t-emerald-500" },
                { label: "Inactive", value: stats.inactiveEmployees, border: "border-t-red-500" }
            ];
        } else if (activeTab === "attendance") {
            items = [
                { label: "Present", value: stats.presentDays, border: "border-t-emerald-500" },
                { label: "Absent", value: stats.absentDays, border: "border-t-red-500" },
                { label: "Late", value: stats.lateDays, border: "border-t-amber-500" },
                { label: "Attendance Rate", value: `${stats.attendancePercentage}%`, border: "border-t-indigo-500" }
            ];
        } else if (activeTab === "leaves") {
            items = [
                { label: "Total Requests", value: stats.totalRequests, border: "border-t-blue-500" },
                { label: "Approved", value: stats.approved, border: "border-t-emerald-500" },
                { label: "Pending", value: stats.pending, border: "border-t-amber-500" },
                { label: "Rejected", value: stats.rejected, border: "border-t-red-500" }
            ];
        } else if (activeTab === "tasks") {
            items = [
                { label: "Total Tasks", value: stats.totalTasks, border: "border-t-blue-500" },
                { label: "Pending + In Progress", value: stats.pending + stats.inProgress, border: "border-t-amber-500" },
                { label: "Completed", value: stats.completed, border: "border-t-emerald-500" },
                { label: "Overdue", value: stats.overdue, border: "border-t-red-500" }
            ];
        } else if (activeTab === "departments") {
            items = [
                { label: "Total Employees", value: stats.employeeCount, border: "border-t-blue-500" },
                { label: "Avg Attendance", value: `${stats.attendancePercentage}%`, border: "border-t-emerald-500" },
                { label: "Avg Leave Rate", value: `${stats.leavePercentage}%`, border: "border-t-indigo-500" }
            ];
        }

        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {items.map((item, i) => (
                    <div 
                        key={i} 
                        className={`bg-white rounded-xl p-4 border border-slate-200 border-t-4 ${item.border} shadow-sm hover:translate-y-[-2px] transition-all duration-200 text-left`}
                    >
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {item.label}
                        </div>
                        <div className="text-lg font-bold text-slate-800 mt-1">
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="w-full flex flex-col gap-6 text-slate-800">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600 text-2xl">query_stats</span>
                            Reports Center
                        </h2>
                        <p className="text-sm text-slate-500 font-medium mt-1 text-left">
                            Generate and export reports for employees, attendance, leaves, and tasks.
                        </p>
                    </div>
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-505 rounded-lg text-xs font-semibold border border-slate-200">
                        {loading ? "Loading..." : `${data.length} records found`}
                    </span>
                </div>

                {/* Summary Cards */}
                <ReportSummaryCards />

                {/* Tab Navigation */}
                <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex gap-1 overflow-x-auto shadow-sm">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 px-6 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
                                activeTab === tab.id
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.name}</span>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-5">
                    <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600 text-base">analytics</span>
                        {tabs.find(t => t.id === activeTab)?.name || "Report"} Details
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
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <ReportTable
                        columns={config.columns}
                        keys={config.keys}
                        data={data}
                    />
                </div>

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
