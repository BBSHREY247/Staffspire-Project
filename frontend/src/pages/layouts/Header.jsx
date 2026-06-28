import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifMenu, setShowNotifMenu] = useState(false);

    const user = JSON.parse(localStorage.getItem("user")) || { name: "Shreyash", role: "Admin" };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    // Dynamically set title based on the active path
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes("/admin/dashboard")) return "Dashboard";
        if (path.includes("/admin/employees")) return "Employee List";
        if (path.includes("/admin/departments")) return "Departments";
        if (path.includes("/settings")) return "Settings";
        if (path.includes("/change-password")) return "Change Password";
        return "Employee Management System";
    };

    const mockNotifications = [
        { id: 1, text: "New Employee Added", time: "5 mins ago", icon: <FaCheckCircle style={{color: "#22c55e"}} />, bg: "#d1fae5" },
        { id: 2, text: "Leave Request Submitted", time: "2 hours ago", icon: <FaCheckCircle style={{color: "#3b82f6"}} />, bg: "#dbeafe" },
        { id: 3, text: "Attendance Missing: Om Pawar", time: "1 day ago", icon: <FaCalendarTimes style={{color: "#ef4444"}} />, bg: "#fee2e2" },
        { id: 4, text: "Birthday Today: Om Pawar", time: "Today", icon: <FaBirthdayCake style={{color: "#a855f7"}} />, bg: "#f3e8ff" },
        { id: 5, text: "Password Changed Successfully", time: "3 days ago", icon: <FaKey style={{color: "#f59e0b"}} />, bg: "#fef3c7" },
    ];

    return (
        <header className="header">
            {/* Left Brand and Title */}
            <div className="header-left">
                <div className="logo-brand" onClick={() => navigate("/admin/dashboard")} style={{cursor: "pointer"}}>
                    <span>⚡</span>
                    <span>SoftSpire</span>
                </div>
                <div className="header-title-divider"></div>
                <h2 className="header-page-title">{getPageTitle()}</h2>
            </div>

            {/* Center Search Bar */}
            <div className="header-center">
                <div className="search-container">
                    <FaSearch />
                    <input 
                        type="text" 
                        className="search-bar-input" 
                        placeholder="Search employees, departments, attendance..." 
                    />
                </div>
            </div>

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
                        <span className="badge-count">5</span>
                    </button>

                    {showNotifMenu && (
                        <div className="notifications-dropdown">
                            <div className="notif-header">
                                <h4>Notifications</h4>
                                <span onClick={() => setShowNotifMenu(false)}>Clear All</span>
                            </div>
                            <div className="notif-list">
                                {mockNotifications.map((n) => (
                                    <div key={n.id} className="notif-item">
                                        <div className="notif-icon-wrapper" style={{background: n.bg}}>
                                            {n.icon}
                                        </div>
                                        <div className="notif-content">
                                            <span className="notif-text">{n.text}</span>
                                            <span className="notif-time">{n.time}</span>
                                        </div>
                                    </div>
                                ))}
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
                            
                            <li onClick={() => { navigate("/settings"); setShowProfileMenu(false); }}>
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