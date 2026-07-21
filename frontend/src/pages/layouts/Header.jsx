import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import useSWR from "swr";
import { 
    FaBell, 
    FaCog, 
    FaUserCircle, 
    FaSearch, 
    FaSignOutAlt, 
    FaChevronDown, 
    FaCheckCircle, 
    FaCalendarTimes, 
    FaBirthdayCake, 
    FaKey 
} from "react-icons/fa";
import profilePic from "../../assets/Softspire_Logo.jpeg"

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifMenu, setShowNotifMenu] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isClearing, setIsClearing] = useState(false);
    const [isMarkingRead, setIsMarkingRead] = useState(false);

    const user = JSON.parse(localStorage.getItem("user:v1")) || { name: "Shreyash", role: "Admin" };
    const token = localStorage.getItem("token");


    const { data: notifData } = useSWR(token ? "http://localhost:5000/api/notifications" : null, fetcher, { refreshInterval: 15000 });

    useEffect(() => {
        if (notifData && notifData.success) {
            setNotifications(notifData.notifications);
        }
    }, [notifData]);

    const handleClearAll = async () => {
        if (!token || isClearing) return;
        setIsClearing(true);
        try {
            await axios.put("http://localhost:5000/api/notifications/read-all", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications([]);
        } catch (error) {
            console.error("Error clearing notifications:", error);
        } finally {
            setIsClearing(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        if (!token || isMarkingRead) return;
        setIsMarkingRead(true);
        try {
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        } finally {
            setIsMarkingRead(false);
        }
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const getNotifDetails = (title) => {
        const lower = title.toLowerCase();
        if (lower.includes("task")) {
            return {
                icon: <FaCheckCircle style={{ color: "#3b82f6" }} />,
                bg: "#dbeafe"
            };
        }
        if (lower.includes("leave")) {
            return {
                icon: <FaCalendarTimes style={{ color: "#ef4444" }} />,
                bg: "#fee2e2"
            };
        }
        return {
            icon: <FaCheckCircle style={{ color: "#22c55e" }} />,
            bg: "#d1fae5"
        };
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
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
                    <button type="button" 
                        className="header-action-btn" 
                        aria-label="Notifications"
                        onClick={() => {
                            setShowNotifMenu(!showNotifMenu);
                            setShowProfileMenu(false);
                        }}
                    >
                        <FaBell />
                        {notifications.filter(n => !n.is_read).length > 0 && (
                            <span className="badge-count">
                                {notifications.filter(n => !n.is_read).length}
                            </span>
                        )}
                    </button>

                    {showNotifMenu && (
                        <div className="notifications-dropdown">
                            <div className="notif-header">
                                <h4>Notifications</h4>
                                <span onClick={handleClearAll} style={{ cursor: "pointer", color: "red"}}>Clear All</span>
                            </div>
                            <div className="notif-list">
                                {notifications.length === 0 ? (
                                    <div className="notif-empty">No notifications found</div>
                                ) : (
                                    notifications.map((n) => {
                                        const details = getNotifDetails(n.title);
                                        return (
                                            <div 
                                                key={n.id} 
                                                className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                                                onClick={() => handleMarkAsRead(n.id)}
                                            >
                                                <div className="notif-icon-wrapper" style={{background: details.bg}}>
                                                    {details.icon}
                                                </div>
                                                <div className="notif-content">
                                                    <strong style={{fontSize: '12.5px', textAlign: 'left', display: 'block', color: '#1e293b'}}>{n.title}</strong>
                                                    <span className="notif-text">{n.message}</span>
                                                    <span className="notif-time">{formatTime(n.created_at)}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Settings Cog */}
                <button type="button" 
                    className="header-action-btn" 
                    aria-label="Settings"
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
                <button type="button" className="header-action-btn" onClick={handleLogout} title="Logout" aria-label="Logout">
                    <FaSignOutAlt />
                </button>
            </div>
        </header>
    );
}

export default Header;