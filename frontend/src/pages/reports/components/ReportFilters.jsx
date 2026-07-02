import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaSyncAlt } from "react-icons/fa";

function ReportFilters({ reportType, filters, onFilterChange, onReset }) {
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const role = user.role || "Employee";

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                const deptRes = await axios.get("http://localhost:5000/api/departments", { headers });
                setDepartments(deptRes.data || []);
                if (role !== "Employee") {
                    const empRes = await axios.get("http://localhost:5000/api/employees", { headers });
                    if (empRes.data && empRes.data.success) {
                        setEmployees(empRes.data.employees);
                    }
                }
            } catch (error) {
                console.error("Failed to load filter dropdown lists:", error);
            }
        };
        fetchDropdownData();
    }, [role]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onFilterChange({ [name]: value });
    };

    const inputStyle = {
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "10px 14px",
        color: "#1e293b",
        fontSize: "14px",
        fontWeight: "500",
        outline: "none",
        width: "100%",
        transition: "border-color 0.2s, box-shadow 0.2s"
    };

    const labelStyle = {
        fontSize: "11px",
        fontWeight: "700",
        color: "#64748b",
        marginBottom: "5px",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    };

    const fieldStyle = {
        display: "flex",
        flexDirection: "column",
        minWidth: "160px",
        flex: "1 1 160px"
    };

    return (
        <div className="filters-card" style={{
            background: "white",
            borderRadius: "14px",
            padding: "20px 24px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            marginBottom: "20px"
        }}>
            {/* All fields in one row */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>

                {/* Search Bar */}
                {reportType !== "departments" && (
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Search</label>
                        <div style={{ position: "relative" }}>
                            <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "13px" }} />
                            <input
                                type="text"
                                name="search"
                                value={filters.search || ""}
                                onChange={handleChange}
                                placeholder="Name, ID, Title..."
                                style={{ ...inputStyle, paddingLeft: "34px" }}
                                onFocus={(e) => { e.target.style.borderColor = "#4f8cff"; e.target.style.boxShadow = "0 0 0 3px rgba(79,140,255,0.12)"; }}
                                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                            />
                        </div>
                    </div>
                )}

                {/* Department Dropdown */}
                {role === "Admin" && (
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Department</label>
                        <select name="department" value={filters.department || ""} onChange={handleChange} style={inputStyle}
                            onFocus={(e) => { e.target.style.borderColor = "#4f8cff"; }}
                            onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }}
                        >
                            <option value="">All Departments</option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.department_name}>{d.department_name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Employee Dropdown */}
                {role !== "Employee" && reportType !== "employees" && reportType !== "departments" && (
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Employee</label>
                        <select name="employee" value={filters.employee || ""} onChange={handleChange} style={inputStyle}
                            onFocus={(e) => { e.target.style.borderColor = "#4f8cff"; }}
                            onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }}
                        >
                            <option value="">All Employees</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.employee_id}>
                                    {emp.first_name} {emp.last_name} ({emp.employee_id})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Employee Status Filter */}
                {reportType === "employees" && (
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Status</label>
                        <select name="status" value={filters.status || ""} onChange={handleChange} style={inputStyle}>
                            <option value="">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                )}

                {/* Employment Type */}
                {reportType === "employees" && (
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Type</label>
                        <select name="employment_type" value={filters.employment_type || ""} onChange={handleChange} style={inputStyle}>
                            <option value="">All Types</option>
                            <option value="Full Time">Full Time</option>
                            <option value="Part Time">Part Time</option>
                            <option value="Contract">Contract</option>
                        </select>
                    </div>
                )}

                {/* Task Status */}
                {reportType === "tasks" && (
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Status</label>
                        <select name="status" value={filters.status || ""} onChange={handleChange} style={inputStyle}>
                            <option value="">All Statuses</option>
                            <option value="Pending">⏳ Pending</option>
                            <option value="In Progress">🚧 In Progress</option>
                            <option value="On Hold">⏸ On Hold</option>
                            <option value="Completed">✅ Completed</option>
                            <option value="Overdue">❌ Overdue</option>
                        </select>
                    </div>
                )}

                {/* Task Priority */}
                {reportType === "tasks" && (
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Priority</label>
                        <select name="priority" value={filters.priority || ""} onChange={handleChange} style={inputStyle}>
                            <option value="">All Priorities</option>
                            <option value="High">🔴 High</option>
                            <option value="Medium">🟡 Medium</option>
                            <option value="Low">🟢 Low</option>
                        </select>
                    </div>
                )}

                {/* Leave Status */}
                {reportType === "leaves" && (
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Status</label>
                        <select name="status" value={filters.status || ""} onChange={handleChange} style={inputStyle}>
                            <option value="">All Statuses</option>
                            <option value="Pending">⏳ Pending</option>
                            <option value="Approved">✅ Approved</option>
                            <option value="Rejected">❌ Rejected</option>
                        </select>
                    </div>
                )}

                {/* Attendance Month/Year */}
                {reportType === "attendance" && (
                    <>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Month</label>
                            <select name="month" value={filters.month || ""} onChange={handleChange} style={inputStyle}>
                                <option value="">All Months</option>
                                {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m, i) => (
                                    <option key={i+1} value={i+1}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Year</label>
                            <select name="year" value={filters.year || ""} onChange={handleChange} style={inputStyle}>
                                <option value="">All Years</option>
                                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </>
                )}

                {/* Date Range */}
                {reportType !== "departments" && !filters.month && !filters.year && (
                    <>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>From Date</label>
                            <input type="date" name="from" value={filters.from || ""} onChange={handleChange} style={inputStyle}
                                onFocus={(e) => { e.target.style.borderColor = "#4f8cff"; }}
                                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }}
                            />
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>To Date</label>
                            <input type="date" name="to" value={filters.to || ""} onChange={handleChange} style={inputStyle}
                                onFocus={(e) => { e.target.style.borderColor = "#4f8cff"; }}
                                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }}
                            />
                        </div>
                    </>
                )}

                {/* Sorting */}
                <div style={fieldStyle}>
                    <label style={labelStyle}>Sort Order</label>
                    <select name="sort" value={filters.sort || "DESC"} onChange={handleChange} style={inputStyle}>
                        <option value="DESC">Latest First</option>
                        <option value="ASC">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Reset button below fields, right-aligned */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "14px" }}>
                <button
                    onClick={onReset}
                    style={{
                        background: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "9px 20px",
                        color: "#475569",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "#e2e8f0"; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
                >
                    <FaSyncAlt size={11} /> Reset Filters
                </button>
            </div>
        </div>
    );
}

export default ReportFilters;
