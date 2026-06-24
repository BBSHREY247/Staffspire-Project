import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

function Sidebar() {

    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");

    };

    return (
        <div className="sidebar">
            <h2>StaffSpire</h2>
            <ul className="sidebar-menu">

                <li
                    className={
                        location.pathname === "/admin/dashboard"
                            ? "active-menu"
                            : ""
                    }
                    onClick={() =>
                        navigate("/admin/dashboard")
                    }
                >
                    Dashboard
                </li>

                <li
                    className={
                        location.pathname === "/admin/employees"
                            ? "active-menu"
                            : ""
                    }
                    onClick={() =>
                        navigate("/admin/employees")
                    }
                >
                    Employees
                </li>

                <li onClick={() => navigate("/admin/departments")}>
                    Departments
                </li>

                <li>
                    Attendance
                </li>

                <li>
                    Leaves
                </li>

                <li>
                    Tasks
                </li>

                <li>
                    Reports
                </li>

                <li
                    className={
                        location.pathname === "/settings"
                            ? "active-menu"
                            : ""
                    }
                    onClick={() =>
                        navigate("/settings")
                    }
                >
                    Settings
                </li>
                {/* <li
                    className="active-menu"
                    onClick={() =>
                        navigate("/change-password")
                    }
                >
                    Change Password
                </li> */}

                <li onClick={handleLogout}>
                    Logout
                </li>


            </ul>
        </div>
    );
}

export default Sidebar;