import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaBuilding, FaPlus } from "react-icons/fa";
import DashboardLayout from "../layouts/DashboardLayout";

function Departments() {
    const [searchTerm, setSearchTerm] = useState("");
    const [departments, setDepartments] = useState([]);
    const [departmentName, setDepartmentName] = useState("");
    const [editingId, setEditingId] = useState(null);

    const fetchDepartments = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/departments");
            setDepartments(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleAddDepartment = async (e) => {
        e.preventDefault();

        if (!departmentName.trim()) {
            alert("Department name is required");
            return;
        }

        try {
            if (editingId) {
                await axios.put(
                    `http://localhost:5000/api/departments/${editingId}`,
                    { department_name: departmentName }
                );
                setEditingId(null);
            } else {
                await axios.post(
                    "http://localhost:5000/api/departments",
                    { department_name: departmentName }
                );
            }
            setDepartmentName("");
            fetchDepartments();
        } catch (error) {
            console.log(error);
        }
    };

    const handleDeleteDepartment = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this department?"
        );
        if (!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:5000/api/departments/${id}`);
            fetchDepartments();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <DashboardLayout>
            <h1 className="page-title">Departments Manager</h1>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px", alignItems: "start" }}>
                {/* Form Card */}
                <div className="form-card" style={{ width: "100%", maxWidth: "100%", padding: "30px" }}>
                    <h3 style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <FaBuilding style={{ color: "var(--primary)" }} /> 
                        {editingId ? "Edit Department" : "Add Department"}
                    </h3>
                    <form onSubmit={handleAddDepartment} className="form-group" style={{ margin: 0 }}>
                        <input
                            type="text"
                            placeholder="Department Name (e.g. Sales, HR)"
                            value={departmentName}
                            onChange={(e) => setDepartmentName(e.target.value)}
                            style={{ padding: "12px", width: "100%", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "15px" }}
                            required
                        />
                        <button 
                            type="submit" 
                            className="save-btn" 
                            style={{ margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                        >
                            {editingId ? "Update" : <><FaPlus /> Add</>}
                        </button>
                        {editingId && (
                            <button 
                                type="button" 
                                className="action-btn-custom action-btn-secondary" 
                                style={{ width: "100%", padding: "12px", borderRadius: "8px", marginTop: "8px" }}
                                onClick={() => {
                                    setEditingId(null);
                                    setDepartmentName("");
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </form>
                </div>

                {/* Table Card */}
                <div className="table-container-custom">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th style={{ width: "80px" }}>ID</th>
                                <th>Department Name</th>
                                <th style={{ textAlign: "center", width: "120px" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map((dept) => (
                                <tr key={dept.id}>
                                    <td>#{dept.id}</td>
                                    <td style={{ fontWeight: "600" }}>{dept.department_name}</td>
                                    <td style={{ textAlign: "center" }}>
                                        <button
                                            className="table-action-btn"
                                            onClick={() => {
                                                setEditingId(dept.id);
                                                setDepartmentName(dept.department_name);
                                            }}
                                            title="Edit"
                                            style={{ marginRight: "6px" }}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="table-action-btn"
                                            onClick={() => handleDeleteDepartment(dept.id)}
                                            title="Delete"
                                            style={{ color: "#ef4444" }}
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {departments.length === 0 && (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: "center", color: "#64748b", padding: "30px" }}>
                                        No departments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default Departments;