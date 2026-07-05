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
        <header className="bg-white/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-slate-200 shadow-sm flex justify-between items-center h-16 px-6 md:px-10 md:w-[calc(100%-16rem)] right-0">
            {/* Mobile Header Brand (Hidden on Web) */}
            <div className="flex items-center md:hidden">
                <span className="text-xl font-bold tracking-tight text-blue-600">StaffSpire</span>
            </div>

            {/* Page Title (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 font-medium">
                <span>Home</span>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-blue-600 font-semibold">{getPageTitle()}</span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-auto">
                {/* Search Bar (Hidden on Mobile) */}
                <div className="relative hidden md:block">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input 
                        className="h-10 pl-10 pr-4 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-xs outline-none w-64" 
                        placeholder="Search..." 
                        type="text" 
                    />
                </div>

                {/* Notifications Bell */}
                <div className="relative">
                    <button 
                        onClick={() => {
                            setShowNotifMenu(!showNotifMenu);
                            setShowProfileMenu(false);
                        }}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-[22px]">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                    </button>

                    {showNotifMenu && (
                        <div className="absolute right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl w-80 z-50 py-2 animate-dropdownFade">
                            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-100">
                                <h4 className="text-sm font-bold text-slate-800">Notifications</h4>
                                <span 
                                    onClick={handleMarkAllAsRead} 
                                    className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline"
                                >
                                    Mark all read
                                </span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="py-6 text-center text-slate-400 text-xs">
                                        No notifications yet
                                    </div>
                                ) : (
                                    notifications.map((n) => {
                                        const { icon, bg } = getNotifIcon(n.title);
                                        return (
                                            <div 
                                                key={n.id} 
                                                onClick={() => {
                                                    handleMarkAsRead(n.id);
                                                    setShowNotifMenu(false);
                                                }}
                                                className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors ${
                                                    !n.is_read ? "bg-blue-50/20" : ""
                                                }`}
                                            >
                                                <div 
                                                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm"
                                                    style={{ backgroundColor: bg }}
                                                >
                                                    {icon}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className={`text-xs text-slate-800 ${!n.is_read ? "font-bold" : "font-semibold"}`}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                                                        {n.message}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 mt-1">
                                                        {formatNotifTime(n.created_at)}
                                                    </p>
                                                </div>
                                                {!n.is_read && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-600 align-self-center mt-3 shrink-0"></span>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Avatar Widget */}
                <div className="relative">
                    <div 
                        onClick={() => {
                            setShowProfileMenu(!showProfileMenu);
                            setShowNotifMenu(false);
                        }}
                        className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-slate-100/60 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
                            <FaUserCircle className="w-full h-full text-slate-400 text-[32px]" />
                        </div>
                        <div className="hidden sm:flex flex-col text-left">
                            <span className="text-xs font-semibold text-slate-700 leading-none">{user.name}</span>
                            <span className="text-[10px] text-slate-500 leading-none mt-1">{user.role}</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 text-sm transition-transform duration-200" style={{ transform: showProfileMenu ? "rotate(180deg)" : "rotate(0)" }}>
                            expand_more
                        </span>
                    </div>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl w-48 z-50 py-1.5 animate-dropdownFade">
                            <div className="px-4 py-2 border-b border-slate-100">
                                <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
                                <p className="text-[10px] text-slate-400 leading-none mt-1">{user.role}</p>
                            </div>
                            <button 
                                onClick={() => { navigate("/employee/profile"); setShowProfileMenu(false); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-xs text-slate-600 hover:bg-slate-50"
                            >
                                <span className="material-symbols-outlined text-sm">person</span>
                                My Profile
                            </button>
                            <button 
                                onClick={() => { navigate("/settings"); setShowProfileMenu(false); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-xs text-slate-600 hover:bg-slate-50"
                            >
                                <span className="material-symbols-outlined text-sm">settings</span>
                                Settings
                            </button>
                            <button 
                                onClick={() => { navigate("/change-password"); setShowProfileMenu(false); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-xs text-slate-600 hover:bg-slate-50"
                            >
                                <span className="material-symbols-outlined text-sm">lock</span>
                                Change Password
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                            >
                                <span className="material-symbols-outlined text-sm">logout</span>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;