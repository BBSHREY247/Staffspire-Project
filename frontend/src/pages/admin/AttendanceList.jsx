import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { FaSearch, FaCalendarAlt, FaHistory, FaCheckCircle, FaUserClock } from "react-icons/fa";

function AttendanceList() {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/api/attendance", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttendance(response.data.attendance || []);
        } catch (error) {
            console.error("Error fetching attendance list:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const getInitials = (firstName, lastName) => {
        const f = firstName ? firstName.charAt(0).toUpperCase() : "";
        const l = lastName ? lastName.charAt(0).toUpperCase() : "";
        return `${f}${l}` || "EE";
    };

    const formatTime12h = (timeStr) => {
        if (!timeStr) return "--:--";
        try {
            const [hours, minutes] = timeStr.split(":");
            let h = parseInt(hours);
            const ampm = h >= 12 ? "PM" : "AM";
            h = h % 12 || 12;
            return `${String(h).padStart(2, "0")}:${minutes} ${ampm}`;
        } catch (e) {
            return timeStr;
        }
    };

    const formatDateNice = (dateStr) => {
        if (!dateStr) return "";
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric"
            });
        } catch (e) {
            return dateStr;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Present": return "badge-present";
            case "Late": return "badge-late";
            case "Half Day": return "badge-halfday";
            case "Absent": return "badge-absent";
            default: return "badge-neutral";
        }
    };

    const filteredAttendance = attendance.filter((record) => {
        const fullName = `${record.first_name || ""} ${record.last_name || ""}`.toLowerCase();
        const empId = (record.employee_id || "").toLowerCase();
        const query = searchQuery.toLowerCase();
        
        const matchesQuery = fullName.includes(query) || empId.includes(query);
        
        let matchesDate = true;
        if (dateFilter) {
            const recordDateStr = new Date(record.attendance_date).toLocaleDateString("sv"); // YYYY-MM-DD
            matchesDate = recordDateStr === dateFilter;
        }

        return matchesQuery && matchesDate;
    });

    // Compute basic summary stats for header overview cards
    const totalRecords = filteredAttendance.length;
    const presentCount = filteredAttendance.filter(r => r.status === "Present").length;
    const lateCount = filteredAttendance.filter(r => r.status === "Late").length;
    const halfDayCount = filteredAttendance.filter(r => r.status === "Half Day").length;

    const getLocationStatusClass = (locStatus) => {
        if (locStatus === "Inside Office") return "badge-present"; // green
        if (locStatus === "Outside Office") return "badge-absent"; // red
        return "badge-neutral";
    };

    return (
        <DashboardLayout>
            <div className="attendance-page-container">
                <div className="employee-header" style={{ marginBottom: "24px" }}>
                    <h1 className="page-title" style={{ margin: 0 }}>Attendance Registry</h1>
                </div>

                {/* Stat Overview Cards */}
                <div className="admin-stats-grid">
                    <div className="attendance-card stat-metric-card">
                        <div className="stat-meta">
                            <span className="stat-label">Total Logs</span>
                            <FaHistory className="stat-icon" style={{ color: "#3b82f6" }} />
                        </div>
                        <div className="stat-val">{totalRecords}</div>
                    </div>
                    <div className="attendance-card stat-metric-card">
                        <div className="stat-meta">
                            <span className="stat-label">On Time</span>
                            <FaCheckCircle className="stat-icon" style={{ color: "#22c55e" }} />
                        </div>
                        <div className="stat-val">{presentCount}</div>
                    </div>
                    <div className="attendance-card stat-metric-card">
                        <div className="stat-meta">
                            <span className="stat-label">Late Arrivals</span>
                            <FaUserClock className="stat-icon" style={{ color: "#f59e0b" }} />
                        </div>
                        <div className="stat-val">{lateCount}</div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="filters-card">
                    <div className="search-box">
                        <FaSearch className="filter-icon" />
                        <input
                            type="text"
                            placeholder="Search employee name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="date-filter-box">
                        <FaCalendarAlt className="filter-icon" />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                        {dateFilter && (
                            <button className="clear-date-btn" onClick={() => setDateFilter("")}>
                                Clear Date
                            </button>
                        )}
                    </div>
                </div>

                {/* Logs Table */}
                <div className="table-container-custom">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>Avatar</th>
                                <th>Emp ID</th>
                                <th>Name</th>
                                <th>Department</th>
                                <th>Date</th>
                                <th>Check-In</th>
                                <th>Check-Out</th>
                                <th>Working Hours</th>
                                <th>Status</th>
                                {/* <th>Geofence</th>
                                <th>Distance</th>
                                <th>Map</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="12" style={{ textAlign: "center", color: "#64748b" }}>
                                        Loading logs...
                                    </td>
                                </tr>
                            ) : filteredAttendance.length === 0 ? (
                                <tr>
                                    <td colSpan="12" style={{ textAlign: "center", color: "#64748b" }}>
                                        No attendance logs matching criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredAttendance.map((record) => (
                                    <tr key={record.id}>
                                        <td>
                                            <div className="avatar-badge">
                                                {getInitials(record.first_name, record.last_name)}
                                            </div>
                                        </td>
                                        <td>{record.employee_id}</td>
                                        <td style={{ fontWeight: "600" }}>
                                            {record.first_name} {record.last_name}
                                        </td>
                                        <td>
                                            <span className="dept-tag">{record.department || "N/A"}</span>
                                        </td>
                                        <td style={{ fontWeight: "500" }}>{formatDateNice(record.attendance_date)}</td>
                                        <td>{formatTime12h(record.check_in)}</td>
                                        <td>{record.check_out ? formatTime12h(record.check_out) : "--:--"}</td>
                                        <td style={{ fontFamily: "monospace" }}>{record.working_hours || "--:--"}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        {/* <td>
                                            <span className={`status-badge ${getLocationStatusClass(record.location_status)}`}>
                                                {record.location_status || "N/A"}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: "600", color: "#475569" }}>
                                            {record.distance_from_office !== null && record.distance_from_office !== undefined 
                                                ? `${record.distance_from_office}m` 
                                                : "N/A"}
                                        </td> */}
                                        {/* <td>
                                            {record.latitude && record.longitude ? (
                                                <a 
                                                    href={`https://www.google.com/maps?q=${record.latitude},${record.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        background: "#4f8cff",
                                                        color: "white",
                                                        padding: "4px 10px",
                                                        borderRadius: "6px",
                                                        textDecoration: "none",
                                                        fontSize: "12px",
                                                        fontWeight: "600"
                                                    }}
                                                >
                                                    View Map
                                                </a>
                                            ) : "N/A"}
                                        </td> */}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default AttendanceList;
