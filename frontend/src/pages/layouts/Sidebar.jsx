import { useNavigate, useLocation } from "react-router-dom";
import profilePic from "../../assets/Softspire_Logo.jpeg";

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
        { name: "Dashboard", path: "/admin/dashboard", icon: "dashboard" },
        { name: "Employees", path: "/admin/employees", icon: "groups" },
        { name: "Departments", path: "/admin/departments", icon: "domain" },
        { name: "Attendance", path: "/admin/attendance", icon: "calendar_month" },
        { name: "Leaves", path: "/admin/leaves", icon: "event_available" },
        { name: "Tasks", path: "/admin/tasks", icon: "task_alt" },
        { name: "Reports", path: "/reports", icon: "insights" },
        { name: "Settings", path: "/settings", icon: "settings" },
    ];

    const employeeMenuItems = [
        { name: "Dashboard", path: "/employee/dashboard", icon: "dashboard" },
        { name: "My Profile", path: "/employee/profile", icon: "person" },
        { name: "Attendance", path: "/employee/attendance", icon: "calendar_month" },
        { name: "Leave Requests", path: "/employee/leaves", icon: "event_available" },
        { name: "My Tasks", path: "/employee/tasks", icon: "task_alt" },
        { name: "Reports", path: "/reports", icon: "insights" },
        { name: "Settings", path: "/settings", icon: "settings" },
    ];

    const managerMenuItems = [
        { name: "Dashboard", path: "/manager/dashboard", icon: "dashboard" },
        { name: "My Profile", path: "/employee/profile", icon: "person" },
        { name: "My Attendance", path: "/employee/attendance", icon: "calendar_month" },
        { name: "My Leaves", path: "/employee/leaves", icon: "event_available" },
        { name: "View Team", path: "/admin/employees", icon: "groups" },
        { name: "Team Attendance", path: "/admin/attendance", icon: "calendar_month" },
        { name: "Team Leaves", path: "/admin/leaves", icon: "event_available" },
        { name: "Tasks", path: "/admin/tasks", icon: "task_alt" },
        { name: "Reports", path: "/reports", icon: "insights" },
        { name: "Change Password", path: "/change-password", icon: "settings" },
    ];

    const menuItems = role === "Admin" ? adminMenuItems : role === "Manager" ? managerMenuItems : employeeMenuItems;

    return (
        <aside className="hidden md:flex bg-white h-screen w-64 fixed left-0 top-0 z-40 border-r border-slate-200 flex-col py-6 gap-2">
            <div className="px-6 mb-8 cursor-pointer" onClick={() => navigate(role === "Admin" ? "/admin/dashboard" : role === "Manager" ? "/manager/dashboard" : "/employee/dashboard")}>
                <img 
                    src={profilePic} 
                    alt="Softspire Solutions Logo" 
                    className="h-10 w-auto object-contain mb-1 rounded animate-fade-in" 
                />
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Enterprise HRIS</p>
            </div>
            
            <nav className="flex-1 flex flex-col gap-1.5 px-3">
                {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path || 
                        (item.path !== "/admin/dashboard" && item.path !== "/employee/dashboard" && item.path !== "/settings" && item.path !== "#" && location.pathname.startsWith(item.path));
                    
                    return (
                        <button
                            key={index}
                            onClick={() => item.path !== "#" && navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                                isActive 
                                    ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600 scale-[0.98]" 
                                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                            }`}
                        >
                            <span 
                                className="material-symbols-outlined text-[20px]"
                                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                            >
                                {item.icon}
                            </span>
                            <span className="text-sm font-medium">{item.name}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="mt-auto px-3 flex flex-col gap-1">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;