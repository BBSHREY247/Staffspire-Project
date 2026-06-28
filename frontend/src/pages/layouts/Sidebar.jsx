import { useNavigate, useLocation } from "react-router-dom";
import { 
    FaHome, 
    FaUsers, 
    FaBuilding, 
    FaCalendarCheck, 
    FaClipboardList, 
    FaTasks, 
    FaChartBar, 
    FaCog, 
    FaSignOutAlt 
} from "react-icons/fa";

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const user = JSON.parse(localStorage.getItem("user")) || {};
    const role = user.role || "Employee";

    const adminMenuItems = [
        { name: "Dashboard", path: "/admin/dashboard", icon: <FaHome /> },
        { name: "Employees", path: "/admin/employees", icon: <FaUsers /> },
        { name: "Departments", path: "/admin/departments", icon: <FaBuilding /> },
        { name: "Attendance", path: "#", icon: <FaCalendarCheck /> },
        { name: "Leaves", path: "#", icon: <FaClipboardList /> },
        { name: "Tasks", path: "#", icon: <FaTasks /> },
        { name: "Reports", path: "#", icon: <FaChartBar /> },
        { name: "Settings", path: "/settings", icon: <FaCog /> },
    ];

    const employeeMenuItems = [
        { name: "Dashboard", path: "/employee/dashboard", icon: <FaHome /> },
        { name: "My Profile", path: "#profile-section", icon: <FaUsers /> },
        { name: "Attendance", path: "#attendance-section", icon: <FaCalendarCheck /> },
        { name: "Leave Requests", path: "#leaves-section", icon: <FaClipboardList /> },
        { name: "My Tasks", path: "#tasks-section", icon: <FaTasks /> },
        { name: "Reports", path: "#reports-section", icon: <FaChartBar /> },
        { name: "Settings", path: "/settings", icon: <FaCog /> },
    ];

    const menuItems = role === "Admin" ? adminMenuItems : employeeMenuItems;

    return (
        <aside className="sidebar">
            <ul className="sidebar-menu" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: "calc(100vh - 110px)", width: "100%" }}>
                {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path || 
                        (item.path !== "/admin/dashboard" && item.path !== "/employee/dashboard" && item.path !== "/settings" && !item.path.startsWith("#") && item.path !== "#" && location.pathname.startsWith(item.path));
                    return (
                        <li
                            key={index}
                            className={isActive ? "active-menu" : ""}
                            onClick={() => {
                                if (item.path !== "#") {
                                    if (item.path.startsWith("#")) {
                                        navigate("/employee/dashboard");
                                        setTimeout(() => {
                                            const el = document.getElementById(item.path.substring(1));
                                            if (el) el.scrollIntoView({ behavior: "smooth" });
                                        }, 100);
                                    } else {
                                        navigate(item.path);
                                    }
                                }
                            }}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </li>
                    );
                })}
                <li onClick={handleLogout} style={{ marginTop: "auto", color: "#fca5a5" }}>
                    <FaSignOutAlt style={{ color: "#fca5a5" }} />
                    <span>Logout</span>
                </li>
            </ul>
        </aside>
    );
}

export default Sidebar;