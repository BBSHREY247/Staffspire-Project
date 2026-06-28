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

            alert(response.data.message);
            navigate("/admin/employees");
        } catch (error) {
            console.log(error);
            alert("Failed To Create Employee");
        }
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
        </DashboardLayout>
    );
}

export default AddEmployee;