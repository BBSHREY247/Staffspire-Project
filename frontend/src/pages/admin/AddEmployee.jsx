import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { FaUserPlus } from "react-icons/fa";

function AddEmployee() {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        department: "",
        designation: ""
    });

    const [departments, setDepartments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState({ employeeId: "", temporaryPassword: "" });
    const [copied, setCopied] = useState(false);

    // Fetch existing departments for the select dropdown
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/departments");
                setDepartments(response.data);
            } catch (error) {
                console.error("Failed to load departments:", error);
            }
        };
        fetchDepartments();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:5000/api/employees",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setCreatedCredentials({
                    employeeId: response.data.employeeId,
                    temporaryPassword: response.data.temporaryPassword
                });
                setShowModal(true);
            } else {
                alert(response.data.message || "Failed to Create Employee");
            }
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Failed To Create Employee");
        }
    };

    const handleCopy = () => {
        const textToCopy = `Employee ID: ${createdCredentials.employeeId}\nTemporary Password: ${createdCredentials.temporaryPassword}`;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <DashboardLayout>
            <div className="form-container-centered">
                <div className="form-card">
                    <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center", marginBottom: "30px" }}>
                        <FaUserPlus style={{ color: "var(--primary)" }} /> Add Employee
                    </h1>

                    <form className="form-group" onSubmit={handleSubmit}>
                        <label htmlFor="first_name">First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            id="first_name"
                            placeholder="Employee First Name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                        />
                        <br />

                        <label htmlFor="last_name">Last Name</label>
                        <input
                            type="text"
                            name="last_name"
                            id="last_name"
                            placeholder="Employee Last Name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                        />
                        <br />

                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <br />

                        <label htmlFor="department">Department</label>
                        <select
                            name="department"
                            id="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                                <option
                                    key={dept.id}
                                    value={dept.department_name}
                                >
                                    {dept.department_name}
                                </option>
                            ))}
                        </select>
                        <br />

                        <label htmlFor="designation">Designation</label>
                        <input
                            type="text"
                            name="designation"
                            id="designation"
                            placeholder="e.g. Lead Engineer, HR Associate"
                            value={formData.designation}
                            onChange={handleChange}
                            required
                        />
                        <br />

                        <div style={{ display: "flex", gap: "12px", marginTop: "15px" }}>
                            <button
                                type="button"
                                className="action-btn-custom action-btn-secondary"
                                style={{ flex: 1, padding: "14px" }}
                                onClick={() => navigate("/admin/employees")}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="save-btn"
                                style={{ flex: 2, margin: 0 }}
                            >
                                Save Employee
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {showModal && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(15, 23, 42, 0.75)",
                    backdropFilter: "blur(8px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999
                }}>
                    <div style={{
                        backgroundColor: "#ffffff",
                        padding: "36px",
                        borderRadius: "16px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        width: "90%",
                        maxWidth: "460px",
                        textAlign: "center",
                        border: "1px solid rgba(226, 232, 240, 0.8)"
                    }}>
                        <div style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            backgroundColor: "#ecfdf5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px auto"
                        }}>
                            <svg style={{ width: "30px", height: "30px", color: "#10b981" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        
                        <h2 style={{
                            fontSize: "1.5rem",
                            fontWeight: "700",
                            color: "#0f172a",
                            marginBottom: "12px",
                            fontFamily: "inherit"
                        }}>
                            Employee Created Successfully
                        </h2>
                        
                        <p style={{
                            fontSize: "0.875rem",
                            color: "#64748b",
                            marginBottom: "24px"
                        }}>
                            Please save the following credentials for the employee.
                        </p>

                        <div style={{
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                            padding: "20px",
                            marginBottom: "28px",
                            textAlign: "left",
                            display: "flex",
                            flexDirection: "column",
                            gap: "14px"
                        }}>
                            <div>
                                <span style={{
                                    fontSize: "0.75rem",
                                    fontWeight: "600",
                                    color: "#94a3b8",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em"
                                }}>
                                    Employee ID
                                </span>
                                <div style={{
                                    fontSize: "1.125rem",
                                    fontWeight: "700",
                                    color: "#0f172a",
                                    fontFamily: "monospace",
                                    marginTop: "4px"
                                }}>
                                    {createdCredentials.employeeId}
                                </div>
                            </div>

                            <div style={{
                                borderTop: "1px solid #e2e8f0",
                                paddingTop: "14px"
                            }}>
                                <span style={{
                                    fontSize: "0.75rem",
                                    fontWeight: "600",
                                    color: "#94a3b8",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em"
                                }}>
                                    Password
                                </span>
                                <div style={{
                                    fontSize: "1.125rem",
                                    fontWeight: "700",
                                    color: "#0f172a",
                                    fontFamily: "monospace",
                                    marginTop: "4px"
                                }}>
                                    {createdCredentials.temporaryPassword}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {/* <button
                                type="button"
                                onClick={handleCopy}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    backgroundColor: copied ? "#10b981" : "var(--primary, #4f46e5)",
                                    color: "#ffffff",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px"
                                }}
                            >
                                {copied ? (
                                    <>
                                        <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        Copy Credentials
                                    </>
                                )}
                            </button> */}

                            <button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    navigate("/admin/employees");
                                }}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    backgroundColor: "#f1f5f9",
                                    color: "#475569",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                Close & Return
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default AddEmployee;