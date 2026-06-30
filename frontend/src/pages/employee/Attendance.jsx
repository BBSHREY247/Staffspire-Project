import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { FaClock, FaSignInAlt, FaSignOutAlt, FaCalendarCheck, FaHourglassHalf, FaCalendarDay } from "react-icons/fa";

function Attendance() {
    const [todayRecord, setTodayRecord] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Live clock update
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch today's status
            const todayRes = await axios.get("http://localhost:5000/api/attendance/today", { headers });
            setTodayRecord(todayRes.data.attendance);

            // Fetch history
            const historyRes = await axios.get("http://localhost:5000/api/attendance/history", { headers });
            setHistory(historyRes.data.history || []);
        } catch (error) {
            console.error("Error fetching attendance data:", error);
            showNotification("error", "Failed to fetch attendance data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendanceData();
    }, []);

    const showNotification = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const getCoordinates = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser."));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    let errMsg = "Failed to retrieve location.";
                    if (error.code === error.PERMISSION_DENIED) {
                        errMsg = "Location permission is required to mark attendance.";
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        errMsg = "Location information is unavailable.";
                    } else if (error.code === error.TIMEOUT) {
                        errMsg = "Request to get location timed out.";
                    }
                    reject(new Error(errMsg));
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    };

    const handleCheckIn = async () => {
        try {
            setActionLoading(true);
            showNotification("neutral", "Retrieving GPS coordinates...");
            const coords = await getCoordinates();

            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:5000/api/attendance/check-in",
                {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    accuracy: coords.accuracy
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            const locStatus = response.data.locationStatus || "Unknown";
            const dist = response.data.distance !== undefined ? `${response.data.distance}m` : "N/A";
            showNotification("success", `Checked in successfully! Status: ${locStatus} (Distance: ${dist})`);
            fetchAttendanceData();
        } catch (error) {
            console.error("Check-in error:", error);
            showNotification(
                "error",
                error.message || error.response?.data?.message || "Check-in failed. Please try again."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckOut = async () => {
        try {
            setActionLoading(true);
            showNotification("neutral", "Retrieving GPS coordinates...");
            const coords = await getCoordinates();

            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:5000/api/attendance/check-out",
                {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    accuracy: coords.accuracy
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const locStatus = response.data.locationStatus || "Unknown";
            const dist = response.data.distance !== undefined ? `${response.data.distance}m` : "N/A";
            showNotification("success", `Checked out successfully! Status: ${locStatus} (Distance: ${dist})`);
            fetchAttendanceData();
        } catch (error) {
            console.error("Check-out error:", error);
            showNotification(
                "error",
                error.message || error.response?.data?.message || "Check-out failed. Please try again."
            );
        } finally {
            setActionLoading(false);
        }
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

    return (
        <DashboardLayout>
            <div className="attendance-page-container">
                <div className="employee-header" style={{ marginBottom: "24px" }}>
                    <h1 className="page-title" style={{ margin: 0 }}>Attendance Dashboard</h1>
                </div>

                {message && (
                    <div className={`alert-banner alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="attendance-grid">
                    {/* Live Clock & Action Panel */}
                    <div className="attendance-card clock-panel-card">
                        <div className="card-header">
                            <FaClock className="panel-icon" />
                            <h3>Live Clocking</h3>
                        </div>
                        <div className="clock-display">
                            <div className="time">{currentTime.toLocaleTimeString()}</div>
                            <div className="date">
                                {currentTime.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                })}
                            </div>
                        </div>

                        <div className="action-buttons">
                            <button
                                className="check-btn check-in-btn"
                                onClick={handleCheckIn}
                                disabled={loading || actionLoading || !!todayRecord}
                            >
                                <FaSignInAlt /> Check In
                            </button>
                            <button
                                className="check-btn check-out-btn"
                                onClick={handleCheckOut}
                                disabled={
                                    loading ||
                                    actionLoading ||
                                    !todayRecord ||
                                    !!todayRecord?.check_out
                                }
                            >
                                <FaSignOutAlt /> Check Out
                            </button>
                        </div>
                    </div>

                    {/* Today's Status Cards */}
                    <div className="status-overview">
                        <div className="summary-card-row">
                            <div className="attendance-card mini-summary-card">
                                <div className="card-meta">
                                    <span className="card-title">Today's Status</span>
                                    <FaCalendarDay className="card-metric-icon" />
                                </div>
                                <div className="card-val">
                                    <span className={`status-badge ${getStatusClass(todayRecord?.status || "Absent")}`}>
                                        {todayRecord ? todayRecord.status : "Absent"}
                                    </span>
                                </div>
                            </div>

                            <div className="attendance-card mini-summary-card">
                                <div className="card-meta">
                                    <span className="card-title">Check-in Time</span>
                                    <FaSignInAlt className="card-metric-icon check-in-col" />
                                </div>
                                <div className="card-val">
                                    {todayRecord?.check_in ? formatTime12h(todayRecord.check_in) : "--:--"}
                                </div>
                            </div>
                        </div>

                        <div className="summary-card-row">
                            <div className="attendance-card mini-summary-card">
                                <div className="card-meta">
                                    <span className="card-title">Check-out Time</span>
                                    <FaSignOutAlt className="card-metric-icon check-out-col" />
                                </div>
                                <div className="card-val">
                                    {todayRecord?.check_out ? formatTime12h(todayRecord.check_out) : "--:--"}
                                </div>
                            </div>

                            <div className="attendance-card mini-summary-card">
                                <div className="card-meta">
                                    <span className="card-title">Working Hours</span>
                                    <FaHourglassHalf className="card-metric-icon hours-col" />
                                </div>
                                <div className="card-val">
                                    {todayRecord?.working_hours || "00:00:00"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="history-section">
                    <h2>Attendance History</h2>
                    <div className="table-container-custom">
                        <table className="employee-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Check-In</th>
                                    <th>Check-Out</th>
                                    <th>Working Hours</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: "center", color: "#64748b" }}>
                                            Loading logs...
                                        </td>
                                    </tr>
                                ) : history.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: "center", color: "#64748b" }}>
                                            No logs found.
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((record) => (
                                        <tr key={record.id}>
                                            <td style={{ fontWeight: "600" }}>
                                                {formatDateNice(record.attendance_date)}
                                            </td>
                                            <td>{formatTime12h(record.check_in)}</td>
                                            <td>{record.check_out ? formatTime12h(record.check_out) : "--:--"}</td>
                                            <td style={{ fontFamily: "monospace", fontSize: "14px" }}>
                                                {record.working_hours || "--:--"}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${getStatusClass(record.status)}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default Attendance;
