import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { FaEye, FaPlus } from "react-icons/fa";

function EmployeeList() {
    const [employees, setEmployees] = useState([]);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const isAdmin = user.role === "Admin";

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                "http://localhost:5000/api/employees",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setEmployees(response.data.employees);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Helper to get initials for employee avatar
    const getInitials = (firstName, lastName) => {
        const f = firstName ? firstName.charAt(0).toUpperCase() : "";
        const l = lastName ? lastName.charAt(0).toUpperCase() : "";
        return `${f}${l}` || "EE";
    };

    return (
        <DashboardLayout>
            <div className="employee-header" style={{ marginBottom: "24px" }}>
                <h1 className="page-title" style={{ margin: 0 }}>
                    {user.role === "Manager" ? "View Team" : "Employee Directory"}
                </h1>
                {isAdmin && (
                    <button
                        className="add-btn"
                        onClick={() => navigate("/admin/employees/add")}
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: "600" }}
                    >
                        <FaPlus /> Add Employee
                    </button>
                )}
            </div>

            <div className="table-container-custom">
                <table className="employee-table">
                    <thead>
                        <tr>
                            <th>Avatar</th>
                            <th>ID</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th style={{ textAlign: "center" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((employee) => (
                            <tr key={employee.id}>
                                <td>
                                    <div className="avatar-badge">
                                        {getInitials(employee.first_name, employee.last_name)}
                                    </div>
                                </td>
                                <td>{employee.employee_id || `#${employee.id}`}</td>
                                <td style={{ fontWeight: "600" }}>
                                    {employee.first_name} {employee.last_name}
                                </td>
                                <td>{employee.email}</td>
                                <td>
                                    <span style={{ 
                                        background: "#f1f5f9", 
                                        color: "#475569", 
                                        padding: "4px 10px", 
                                        borderRadius: "20px", 
                                        fontSize: "12.5px", 
                                        fontWeight: "600" 
                                    }}>
                                        {employee.department || "N/A"}
                                    </span>
                                </td>
                                <td style={{ color: "#64748b", fontWeight: "500" }}>{employee.designation}</td>
                                <td style={{ textAlign: "center" }}>
                                    <button
                                        className="table-action-btn"
                                        onClick={() => navigate(`/admin/employees/${employee.id}`)}
                                        title="View Details"
                                    >
                                        <FaEye />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {employees.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>
                                    No employees found in the directory.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
}

export default EmployeeList;