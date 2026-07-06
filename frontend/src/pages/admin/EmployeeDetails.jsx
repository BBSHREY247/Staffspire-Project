import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { useParams, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaBuilding, FaIdBadge, FaEdit, FaTrash, FaCheck, FaTimes, FaLock, FaKey } from "react-icons/fa";

function EmployeeDetails() {
    console.log("EmployeeDetails rendered");

    const { id } = useParams();
    const [editing, setEditing] = useState(false);
    const [employee, setEmployee] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [adminPasswordInput, setAdminPasswordInput] = useState("");
    const [revealedPassword, setRevealedPassword] = useState("");
    const navigate = useNavigate();

    const loggedInUser = JSON.parse(localStorage.getItem("user")) || {};
    const isAdmin = loggedInUser.role === "Admin";
    const isManager = loggedInUser.role === "Manager";

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

    const handleVerifyAdminPassword = async () => {
        if (!adminPasswordInput) {
            alert("Admin password is required");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `http://localhost:5000/api/employees/${id}/reveal-password`,
                { adminPassword: adminPasswordInput },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setRevealedPassword(response.data.password);
                setShowPasswordPrompt(false);
                setAdminPasswordInput("");
            }
        } catch (error) {
            console.log(error);
            alert(
                error.response?.data?.message ||
                "Failed to verify admin password"
            );
        }
    };

    const handleRevealPasswordClick = () => {
        if (revealedPassword) {
            setRevealedPassword("");
        } else {
            setAdminPasswordInput(""); // clear any stale value before opening
            setShowPasswordPrompt(true);
        }
    };

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
                                value={employee.first_name || ""}
                                onChange={(e) => setEmployee({ ...employee, first_name: e.target.value })}
                                disabled={isManager}
                                required
                            />
                            <br />

                            <label htmlFor="last_name">Last Name</label>
                            <input
                                type="text"
                                id="last_name"
                                value={employee.last_name || ""}
                                onChange={(e) => setEmployee({ ...employee, last_name: e.target.value })}
                                disabled={isManager}
                                required
                            />
                            <br />

                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={employee.email || ""}
                                onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
                                disabled={isManager}
                                required
                            />
                            <br />

                            <label htmlFor="department">Department</label>
                            <select
                                id="department"
                                value={employee.department || ""}
                                onChange={(e) => setEmployee({ ...employee, department: e.target.value })}
                                disabled={isManager}
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
                                value={employee.designation || ""}
                                onChange={(e) => setEmployee({ ...employee, designation: e.target.value })}
                                required
                            />
                            <br />

                            <label htmlFor="mobile">Mobile Number</label>
                            <input
                                type="text"
                                id="mobile"
                                value={employee.mobile || ""}
                                onChange={(e) => setEmployee({ ...employee, mobile: e.target.value })}
                                placeholder="Enter mobile number"
                                required
                            />
                            <br />

                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                value={employee.status || "Active"}
                                onChange={(e) => setEmployee({ ...employee, status: e.target.value })}
                                required
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                            <br />

                            {isAdmin && (
                                <>
                                    <label htmlFor="role">Role</label>
                                    <select
                                        id="role"
                                        value={employee.role || "Employee"}
                                        onChange={(e) => setEmployee({ ...employee, role: e.target.value })}
                                        required
                                    >
                                        <option value="Employee">Employee</option>
                                        <option value="Manager">Manager</option>
                                    </select>
                                    <br />

                                    <label htmlFor="salary">Salary</label>
                                    <input
                                        type="number"
                                        id="salary"
                                        value={employee.salary || ""}
                                        onChange={(e) => setEmployee({ ...employee, salary: e.target.value })}
                                    />
                                    <br />
                                </>
                            )}

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
                            <div className="details-info-row">
                                <span className="details-info-label"><FaUser style={{ marginRight: "8px", verticalAlign: "middle" }} /> Position / Role</span>
                                <span className="details-info-value">{employee.role || "Employee"}</span>
                            </div>
                            
                            {/* Reversibly Encrypted Password Reveal Row */}
                            {isAdmin && (
                                <div className="details-info-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span className="details-info-label">
                                        <FaKey style={{ marginRight: "8px", verticalAlign: "middle" }} /> Password
                                    </span>
                                    <span className="details-info-value" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        {revealedPassword ? (
                                            <span style={{ fontWeight: "700", fontFamily: "monospace", fontSize: "16px", color: "#4f46e5", background: "#eeebff", padding: "4px 8px", borderRadius: "6px" }}>
                                                {revealedPassword}
                                            </span>
                                        ) : (
                                            <span style={{ color: "#94a3b8", letterSpacing: "3px", fontWeight: "700" }}>••••••••</span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleRevealPasswordClick}
                                            style={{
                                                border: "none",
                                                background: "#e0e7ff",
                                                color: "#4f46e5",
                                                padding: "6px 12px",
                                                borderRadius: "6px",
                                                fontSize: "12.5px",
                                                fontWeight: "600",
                                                cursor: "pointer",
                                                transition: "background 0.2s"
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = "#c7d2fe"}
                                            onMouseLeave={(e) => e.currentTarget.style.background = "#e0e7ff"}
                                        >
                                            {revealedPassword ? "Hide" : "Show Password"}
                                        </button>
                                    </span>
                                </div>
                            )}

                            <div className="actions-container" style={{ marginTop: "24px" }}>
                                {isAdmin && (
                                    <button
                                        className="action-btn-custom action-btn-danger"
                                        onClick={handleDelete}
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                )}
                                {!(isManager && employee.email === loggedInUser.email) && (
                                    <button
                                        className="action-btn-custom action-btn-primary"
                                        onClick={() => setEditing(true)}
                                    >
                                        <FaEdit /> Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Admin Password Prompt Modal */}
            {showPasswordPrompt && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(15, 23, 42, 0.4)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        width: "100%",
                        maxWidth: "400px",
                        padding: "30px",
                        borderRadius: "12px",
                        background: "white",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                        border: "1px solid #e2e8f0"
                    }}>
                        <h3 style={{ margin: "0 0 12px 0", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", color: "#1e293b" }}>
                            <FaLock style={{ color: "#4f46e5" }} /> Verify Admin Identity
                        </h3>
                        <p style={{ margin: "0 0 20px 0", fontSize: "13.5px", color: "#64748b", lineHeight: "1.5" }}>
                            To show the employee's password, please enter your administrator password below.
                        </p>

                        <div className="form-group-custom" style={{ marginBottom: "20px" }}>
                            <label className="form-label-custom" style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>Admin Password</label>
                            <input
                                type="password"
                                placeholder="Enter your admin password"
                                value={adminPasswordInput}
                                onChange={(e) => setAdminPasswordInput(e.target.value)}
                                autoComplete="new-password"
                                style={{
                                    padding: "10px",
                                    width: "100%",
                                    borderRadius: "6px",
                                    border: "1px solid #cbd5e1",
                                    marginTop: "6px",
                                    fontSize: "14px"
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleVerifyAdminPassword();
                                }}
                                autoFocus
                            />
                        </div>

                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button
                                type="button"
                                className="action-btn-custom action-btn-secondary"
                                onClick={() => {
                                    setShowPasswordPrompt(false);
                                    setAdminPasswordInput("");
                                }}
                                style={{ padding: "8px 16px", fontSize: "13px" }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="action-btn-custom action-btn-primary"
                                onClick={handleVerifyAdminPassword}
                                style={{ padding: "8px 16px", fontSize: "13px" }}
                            >
                                Verify & Show
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default EmployeeDetails;