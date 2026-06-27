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

    const menuItems = [
        { name: "Dashboard", path: "/admin/dashboard", icon: <FaHome /> },
        { name: "Employees", path: "/admin/employees", icon: <FaUsers /> },
        { name: "Departments", path: "/admin/departments", icon: <FaBuilding /> },
        { name: "Attendance", path: "#", icon: <FaCalendarCheck /> },
        { name: "Leaves", path: "#", icon: <FaClipboardList /> },
        { name: "Tasks", path: "#", icon: <FaTasks /> },
        { name: "Reports", path: "#", icon: <FaChartBar /> },
        { name: "Settings", path: "/settings", icon: <FaCog /> },
    ];

    return (
        <aside className="sidebar">
            <ul className="sidebar-menu" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: "calc(100vh - 110px)", width: "100%" }}>
                {menuItems.map((item, index) => {
                    // Check if current route matches
                    const isActive = location.pathname === item.path || 
                        (item.path !== "/admin/dashboard" && item.path !== "/settings" && item.path !== "#" && location.pathname.startsWith(item.path));
                    return (
                        <li
                            key={index}
                            className={isActive ? "active-menu" : ""}
                            onClick={() => {
                                if (item.path !== "#") {
                                    navigate(item.path);
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