import { useNavigate } from "react-router-dom";

function Sidebar() {

    const navigate = useNavigate();

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");

    };

    return (
        <div className="sidebar">
            <h2>StaffSpire</h2>
            <li
                onClick={() =>
                navigate("/admin/employees")
            }
            >
                Employees
            </li>
            <ul>
                <li onClick={handleLogout}>
                    Logout
                </li>
            </ul>
        </div>
    );
}

export default Sidebar;