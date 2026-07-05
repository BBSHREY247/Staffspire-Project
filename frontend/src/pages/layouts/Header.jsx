import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
    FaBell, 
    FaCog, 
    FaUserCircle, 
    FaSearch, 
    FaSignOutAlt, 
    FaChevronDown, 
    FaCheckCircle, 
    FaCalendarTimes, 
    FaClipboardList,
    FaTasks,
    FaKey 
} from "react-icons/fa";
import profilePic from "../../assets/Softspire_Logo.jpeg";

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifMenu, setShowNotifMenu] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const user = JSON.parse(localStorage.getItem("user")) || { name: "Employee", role: "Employee" };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    // Dynamically set title based on the active path
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes("/dashboard")) return "Dashboard";
        if (path.includes("/admin/employees")) return "Employee List";
        if (/\d+/.test(path) && path.includes("/admin/departments")) return "Department Profile";
        if (path.includes("/admin/departments")) return "Departments";
        if (path.includes("/admin/attendance")) return "Attendance Registry";
        if (path.includes("/employee/attendance")) return "Attendance Dashboard";
        if (/\/admin\/leaves\/\d+/.test(path)) return "Leave Request Details";
        if (path.includes("/admin/leaves")) return "Leave Requests Registry";
        if (path.includes("/employee/leaves")) return "My Leave Dashboard";
        if (/\/admin\/tasks\/\d+/.test(path)) return "Task Details";
        if (/\/employee\/tasks\/\d+/.test(path)) return "Task Details";
        if (path.includes("/admin/tasks")) return "Task Management";
        if (path.includes("/employee/tasks")) return "My Tasks";
        if (path.includes("/settings")) return "Settings";
        if (path.includes("/reports")) return "Centralized Reports";
        if (path.includes("/change-password")) return "Change Password";
        return "Employee Management System";
    };

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const res = await axios.get("http://localhost:5000/api/notifications", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data.notifications || []);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.put("http://localhost:5000/api/notifications/read-all", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll notifications every 30 seconds for real-time feel
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Refresh when user toggles dropdown to show latest immediately
    useEffect(() => {
        if (showNotifMenu) {
            fetchNotifications();
        }
    }, [showNotifMenu]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const formatNotifTime = (timestamp) => {
        if (!timestamp) return "";
        const diffMs = new Date() - new Date(timestamp);
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    };

    const getNotifIcon = (title) => {
        const t = (title || "").toLowerCase();
        if (t.includes("task")) return { icon: <FaTasks style={{color: "#3b82f6"}} />, bg: "#dbeafe" };
        if (t.includes("leave")) return { icon: <FaCalendarTimes style={{color: "#ef4444"}} />, bg: "#fee2e2" };
        return { icon: <FaBell style={{color: "#f59e0b"}} />, bg: "#fef3c7" };
    };

    return (
        <header className="header">
            {/* Left Brand and Title */}
            <div className="header-left">
                <div className="logo-brand" onClick={() => navigate(user.role === "Admin" ? "/admin/dashboard" : "/employee/dashboard")} style={{cursor: "pointer"}}>
                    <img className="logo" src={profilePic} alt="" />
                </div>
                <div className="header-title-divider"></div>
                <h2 className="header-page-title">{getPageTitle()}</h2>
            </div>

            {/* Center Search Bar */}
            {/* <div className="header-center">
                <div className="search-container">
                    <FaSearch />
                    <input 
                        type="text" 
                        className="search-bar-input" 
                        placeholder="Search employees, departments, attendance..." 
                    />
                </div>
            </div> */}

            {/* Right Side Actions */}
            <div className="header-right">
                {/* Notifications Bell */}
                <div style={{position: "relative"}}>
                    <button 
                        className="header-action-btn" 
                        onClick={() => {
                            setShowNotifMenu(!showNotifMenu);
                            setShowProfileMenu(false);
                        }}
                    >
                        <FaBell />
                        {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
                    </button>

                    {showNotifMenu && (
                        <div className="notifications-dropdown">
                            <div className="notif-header">
                                <h4>Notifications</h4>
                                <span onClick={handleMarkAllAsRead}>Mark all read</span>
                            </div>
                            <div className="notif-list">
                                {notifications.length === 0 ? (
                                    <div style={{ padding: "24px 16px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                                        No notifications yet
                                    </div>
                                ) : (
                                    notifications.map((n) => {
                                        const { icon, bg } = getNotifIcon(n.title);
                                        return (
                                            <div 
                                                key={n.id} 
                                                className={`notif-item ${!n.is_read ? "notif-unread" : ""}`}
                                                onClick={() => handleMarkAsRead(n.id)}
                                            >
                                                <div className="notif-icon-wrapper" style={{background: bg}}>
                                                    {icon}
                                                </div>
                                                <div className="notif-content" style={{ flex: 1 }}>
                                                    <span className="notif-text" style={{ fontWeight: !n.is_read ? "700" : "500" }}>{n.title}</span>
                                                    <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b", textAlign: "left", lineHeight: "1.4" }}>
                                                        {n.message}
                                                    </p>
                                                    <span className="notif-time" style={{ marginTop: "4px" }}>{formatNotifTime(n.created_at)}</span>
                                                </div>
                                                {!n.is_read && <span className="notif-unread-dot"></span>}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Settings Cog */}
                <button 
                    className="header-action-btn" 
                    onClick={() => {
                        navigate("/settings");
                        setShowNotifMenu(false);
                        setShowProfileMenu(false);
                    }}
                >
                    <FaCog />
                </button>

                {/* Profile Widget Dropdown */}
                <div style={{position: "relative"}}>
                    <div 
                        className="profile-widget"
                        onClick={() => {
                            setShowProfileMenu(!showProfileMenu);
                            setShowNotifMenu(false);
                        }}
                    >
                        <FaUserCircle className="profile-avatar" />
                        <div className="profile-info">
                            <span className="profile-name">{user.name}</span>
                            <span className="profile-role">{user.role}</span>
                        </div>
                        <FaChevronDown className="profile-chevron" style={{transform: showProfileMenu ? "rotate(180deg)" : "rotate(0)"}} />
                    </div>

                    {showProfileMenu && (
                        <ul className="dropdown-menu">
                            <div className="dropdown-header-name">{user.name}</div>
                            <div className="dropdown-header-role">{user.role}</div>
                            
                            <li onClick={() => { navigate("/employee/profile"); setShowProfileMenu(false); }}>
                                <FaUserCircle /> My Profile
                            </li>
                            <li onClick={() => { navigate("/settings"); setShowProfileMenu(false); }}>
                                <FaCog /> Settings
                            </li>
                            <li onClick={() => { navigate("/change-password"); setShowProfileMenu(false); }}>
                                <FaKey /> Change Password
                            </li>
                            <div className="dropdown-divider"></div>
                            <li onClick={handleLogout} style={{color: "#ef4444"}}>
                                <FaSignOutAlt style={{color: "#ef4444"}} /> Logout
                            </li>
                        </ul>
                    )}
                </div>

                {/* Direct Logout Icon */}
                <button className="header-action-btn" onClick={handleLogout} title="Logout">
                    <FaSignOutAlt />
                </button>
            </div>
        </header>
    );
}

export default Header;