import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { useParams, useNavigate } from "react-router-dom";
import { FaBuilding, FaUsers, FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import CustomConfirmModal from "../../components/CustomConfirmModal";


function DepartmentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [dept, setDept] = useState(null);
    const [employeeCount, setEmployeeCount] = useState(0);
    const [newName, setNewName] = useState("");

    // Custom confirm modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


    const fetchDepartmentDetails = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:5000/api/departments/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (response.data.success) {
                setDept(response.data.department);
                setNewName(response.data.department.department_name);
                setEmployeeCount(response.data.employeeCount);
            }
        } catch (error) {
            console.log("Error loading department details:", error);
        }
    };

    useEffect(() => {
        fetchDepartmentDetails();
    }, [id]);

    const handleUpdate = async () => {
        if (!newName.trim()) {
            alert("Department name is required");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `http://localhost:5000/api/departments/${id}`,
                { department_name: newName },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            alert("Department updated successfully");
            setEditing(false);
            fetchDepartmentDetails();
        } catch (error) {
            console.log(error);
            alert("Failed to update department");
        }
    };

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `http://localhost:5000/api/departments/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            navigate("/admin/departments");
        } catch (error) {
            console.log(error);
            alert("Failed to delete department");
        } finally {
            setIsDeleteModalOpen(false);
        }
    };


    if (!dept) {
        return (
            <DashboardLayout>
                <div style={{ textAlign: "center", padding: "100px" }}>
                    <p style={{ fontSize: "18px", color: "#64748b" }}>Loading department profile...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="employee-header" style={{ marginBottom: "20px" }}>
                <h1 className="page-title" style={{ margin: 0 }}>Department Profile</h1>
                <button 
                    className="action-btn-custom action-btn-secondary"
                    onClick={() => navigate("/admin/departments")}
                >
                    Back to List
                </button>
            </div>

            <div className="profile-details-grid">
                {/* Left Card: Summary */}
                <div className="details-card">
                    <div className="details-card-avatar" style={{ background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)", color: "#4f46e5" }}>
                        <FaBuilding />
                    </div>
                    <h2 className="details-card-name">
                        {dept.department_name}
                    </h2>
                    <span className="details-card-role">Department</span>

                    <div className="details-card-divider"></div>

                    <div className="details-card-info-item">
                        <span className="details-card-info-label">Department ID</span>
                        <span className="details-card-info-value">#{dept.id}</span>
                    </div>

                    <div className="details-card-info-item">
                        <span className="details-card-info-label">Active Employees</span>
                        <span className="details-card-info-value" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <FaUsers style={{ color: "#4f46e5" }} /> {employeeCount}
                        </span>
                    </div>
                </div>

                {/* Right Card: Info / Edit form */}
                <div className="info-card">
                    <h3 className="info-card-title">
                        {editing ? "Modify Department Name" : "Department Information"}
                    </h3>

                    <div className="info-form">
                        <div className="info-form-grid" style={{ gridTemplateColumns: "1fr" }}>
                            <div className="form-group-custom">
                                <label className="form-label-custom">Department Name</label>
                                {editing ? (
                                    <input 
                                        type="text" 
                                        className="form-input-custom" 
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        style={{ width: "100%", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                                    />
                                ) : (
                                    <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", fontWeight: "600", fontSize: "15px" }}>
                                        {dept.department_name}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: "flex", gap: "12px", marginTop: "30px" }}>
                            {editing ? (
                                <>
                                    <button 
                                        className="action-btn-custom action-btn-primary"
                                        onClick={handleUpdate}
                                        style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                                    >
                                        <FaCheck /> Save Changes
                                    </button>
                                    <button 
                                        className="action-btn-custom action-btn-secondary"
                                        onClick={() => { setEditing(false); setNewName(dept.department_name); }}
                                        style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                                    >
                                        <FaTimes /> Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        className="action-btn-custom action-btn-primary"
                                        onClick={() => setEditing(true)}
                                        style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                                    >
                                        <FaEdit /> Edit Department
                                    </button>
                                    <button 
                                        className="action-btn-custom"
                                        onClick={handleDeleteClick}
                                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#ef4444", color: "white" }}
                                    >
                                        <FaTrash /> Delete Department
                                    </button>

                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <CustomConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the department '${dept?.department_name}'? This action cannot be undone.`}
                confirmText="Delete Anyway"
                cancelText="Cancel"
                type="danger"
            />
        </DashboardLayout>
    );
}

export default DepartmentDetails;
