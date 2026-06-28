import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { useParams, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaBuilding, FaIdBadge, FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";

function EmployeeDetails() {
    console.log("EmployeeDetails rendered");

    const { id } = useParams();
    const [editing, setEditing] = useState(false);
    const [employee, setEmployee] = useState(null);
    const [departments, setDepartments] = useState([]);
    const navigate = useNavigate();

    const fetchEmployee = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:5000/api/employees/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setEmployee(response.data.employee);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/departments");
            setDepartments(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchEmployee();
        fetchDepartments();
    }, []);

    if (!employee) {
        return (
            <DashboardLayout>
                <div style={{ textAlign: "center", padding: "100px" }}>
                    <p style={{ fontSize: "18px", color: "#64748b" }}>Loading employee details...</p>
                </div>
            </DashboardLayout>
        );
    }

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                `http://localhost:5000/api/employees/${id}`,
                employee,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            alert(response.data.message);
            setEditing(false);
        } catch (error) {
            console.log(error);
            alert("Failed to update employee details");
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Delete this employee?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(
                `http://localhost:5000/api/employees/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            alert(response.data.message);
            navigate("/admin/employees");
        } catch (error) {
            console.log(error);
            alert("Failed to delete employee");
        }
    };

    // Helper to get initials for profile avatar
    const getInitials = (firstName, lastName) => {
        const f = firstName ? firstName.charAt(0).toUpperCase() : "";
        const l = lastName ? lastName.charAt(0).toUpperCase() : "";
        return `${f}${l}` || "EE";
    };

    return (
        <DashboardLayout>
            <div className="employee-header" style={{ marginBottom: "20px" }}>
                <h1 className="page-title" style={{ margin: 0 }}>Employee Profile</h1>
                <button 
                    className="action-btn-custom action-btn-secondary"
                    onClick={() => navigate("/admin/employees")}
                >
                    Back to List
                </button>
            </div>

            <div className="profile-details-grid">
                {/* Left Card: Summary */}
                <div className="details-card">
                    <div className="details-card-avatar">
                        {getInitials(employee.first_name, employee.last_name)}
                    </div>
                    <h2 className="details-card-name">
                        {employee.first_name} {employee.last_name}
                    </h2>
                    <span className="details-card-role">{employee.designation}</span>

                    <div className="details-card-divider"></div>

                    <div className="details-card-info-item">
                        <span className="details-card-info-label">Employee ID</span>
                        <span className="details-card-info-value">{employee.employee_id || `#${employee.id}`}</span>
                    </div>

                    <div className="details-card-info-item">
                        <span className="details-card-info-label">Email Address</span>
                        <span className="details-card-info-value" style={{ wordBreak: "break-all" }}>{employee.email}</span>
                    </div>

                    <div className="details-card-info-item">
                        <span className="details-card-info-label">Department</span>
                        <span className="details-card-info-value">{employee.department || "N/A"}</span>
                    </div>
                </div>

                {/* Right Card: Full Info / Edit Fields */}
                <div className="info-card">
                    <h3 className="info-card-title">
                        {editing ? "Modify Employee Information" : "General Information"}
                    </h3>

                    {editing ? (
                        <form className="form-group" style={{ margin: 0 }} onSubmit={(e) => e.preventDefault()}>
                            <label htmlFor="first_name">First Name</label>
                            <input
                                type="text"
                                id="first_name"
                                value={employee.first_name}
                                onChange={(e) => setEmployee({ ...employee, first_name: e.target.value })}
                                required
                            />
                            <br />

                            <label htmlFor="last_name">Last Name</label>
                            <input
                                type="text"
                                id="last_name"
                                value={employee.last_name}
                                onChange={(e) => setEmployee({ ...employee, last_name: e.target.value })}
                                required
                            />
                            <br />

                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={employee.email}
                                onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
                                required
                            />
                            <br />

                            <label htmlFor="department">Department</label>
                            <select
                                id="department"
                                value={employee.department}
                                onChange={(e) => setEmployee({ ...employee, department: e.target.value })}
                                required
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.department_name}>
                                        {dept.department_name}
                                    </option>
                                ))}
                            </select>
                            <br />

                            <label htmlFor="designation">Designation</label>
                            <input
                                type="text"
                                id="designation"
                                value={employee.designation}
                                onChange={(e) => setEmployee({ ...employee, designation: e.target.value })}
                                required
                            />
                            <br />

                            <div className="actions-container">
                                <button
                                    type="button"
                                    className="action-btn-custom action-btn-secondary"
                                    onClick={() => setEditing(false)}
                                >
                                    <FaTimes /> Cancel
                                </button>
                                <button
                                    type="button"
                                    className="action-btn-custom action-btn-primary"
                                    onClick={handleUpdate}
                                >
                                    <FaCheck /> Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div>
                            <div className="details-info-row">
                                <span className="details-info-label"><FaIdBadge style={{ marginRight: "8px", verticalAlign: "middle" }} /> ID Reference</span>
                                <span className="details-info-value">#{employee.id}</span>
                            </div>
                            <div className="details-info-row">
                                <span className="details-info-label"><FaUser style={{ marginRight: "8px", verticalAlign: "middle" }} /> First Name</span>
                                <span className="details-info-value">{employee.first_name}</span>
                            </div>
                            <div className="details-info-row">
                                <span className="details-info-label"><FaUser style={{ marginRight: "8px", verticalAlign: "middle" }} /> Last Name</span>
                                <span className="details-info-value">{employee.last_name}</span>
                            </div>
                            <div className="details-info-row">
                                <span className="details-info-label"><FaEnvelope style={{ marginRight: "8px", verticalAlign: "middle" }} /> Email Address</span>
                                <span className="details-info-value">{employee.email}</span>
                            </div>
                            <div className="details-info-row">
                                <span className="details-info-label"><FaBuilding style={{ marginRight: "8px", verticalAlign: "middle" }} /> Department</span>
                                <span className="details-info-value">{employee.department || "N/A"}</span>
                            </div>
                            <div className="details-info-row">
                                <span className="details-info-label"><FaIdBadge style={{ marginRight: "8px", verticalAlign: "middle" }} /> Designation</span>
                                <span className="details-info-value">{employee.designation}</span>
                            </div>

                            <div className="actions-container">
                                <button
                                    className="action-btn-custom action-btn-danger"
                                    onClick={handleDelete}
                                >
                                    <FaTrash /> Delete
                                </button>
                                <button
                                    className="action-btn-custom action-btn-primary"
                                    onClick={() => setEditing(true)}
                                >
                                    <FaEdit /> Edit Profile
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default EmployeeDetails;