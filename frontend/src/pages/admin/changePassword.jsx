import { useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { FaEye, FaEyeSlash, FaLock, FaCheck } from "react-icons/fa";

function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert("Passwords Do Not Match");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                "http://localhost:5000/api/auth/change-password",
                {
                    currentPassword,
                    newPassword
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(response.data.message);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            console.log(error);
            alert(
                error.response?.data?.message ||
                "Failed To Change Password"
            );
        }
    };

    return (
        <DashboardLayout>
            <div className="form-container-centered" style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                <div className="form-card" style={{ 
                    width: "100%", 
                    maxWidth: "500px", 
                    padding: "36px", 
                    background: "white", 
                    borderRadius: "16px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
                    border: "1px solid #e2e8f0"
                }}>
                    <h2 style={{ 
                        marginBottom: "30px", 
                        fontWeight: "700", 
                        color: "#0f172a", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "10px",
                        fontSize: "1.5rem" 
                    }}>
                        <FaLock style={{ color: "#4f46e5" }} /> Change Password
                    </h2>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        
                        {/* Current Password */}
                        <div className="form-group-custom">
                            <label className="form-label-custom" style={{ fontWeight: "600", fontSize: "14px", color: "#475569" }}>Current Password</label>
                            <div style={{ position: "relative", marginTop: "6px" }}>
                                <input
                                    type={showCurrent ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    style={{ 
                                        width: "100%", 
                                        padding: "12px 40px 12px 12px", 
                                        border: "1px solid #cbd5e1", 
                                        borderRadius: "8px",
                                        fontSize: "15px"
                                    }}
                                    required
                                />
                                <span
                                    style={{ 
                                        position: "absolute", 
                                        right: "12px", 
                                        top: "50%", 
                                        transform: "translateY(-50%)", 
                                        cursor: "pointer", 
                                        color: "#64748b",
                                        display: "flex",
                                        alignItems: "center"
                                    }}
                                    onClick={() => setShowCurrent(!showCurrent)}
                                >
                                    {showCurrent ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="form-group-custom">
                            <label className="form-label-custom" style={{ fontWeight: "600", fontSize: "14px", color: "#475569" }}>New Password</label>
                            <div style={{ position: "relative", marginTop: "6px" }}>
                                <input
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={{ 
                                        width: "100%", 
                                        padding: "12px 40px 12px 12px", 
                                        border: "1px solid #cbd5e1", 
                                        borderRadius: "8px",
                                        fontSize: "15px"
                                    }}
                                    required
                                />
                                <span
                                    style={{ 
                                        position: "absolute", 
                                        right: "12px", 
                                        top: "50%", 
                                        transform: "translateY(-50%)", 
                                        cursor: "pointer", 
                                        color: "#64748b",
                                        display: "flex",
                                        alignItems: "center"
                                    }}
                                    onClick={() => setShowNew(!showNew)}
                                >
                                    {showCurrent ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="form-group-custom">
                            <label className="form-label-custom" style={{ fontWeight: "600", fontSize: "14px", color: "#475569" }}>Confirm Password</label>
                            <div style={{ position: "relative", marginTop: "6px" }}>
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{ 
                                        width: "100%", 
                                        padding: "12px 40px 12px 12px", 
                                        border: "1px solid #cbd5e1", 
                                        borderRadius: "8px",
                                        fontSize: "15px"
                                    }}
                                    required
                                />
                                <span
                                    style={{ 
                                        position: "absolute", 
                                        right: "12px", 
                                        top: "50%", 
                                        transform: "translateY(-50%)", 
                                        cursor: "pointer", 
                                        color: "#64748b",
                                        display: "flex",
                                        alignItems: "center"
                                    }}
                                    onClick={() => setShowConfirm(!showConfirm)}
                                >
                                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>

                        <button
                            className="save-btn"
                            type="submit"
                            style={{ 
                                width: "100%", 
                                marginTop: "12px", 
                                display: "inline-flex", 
                                alignItems: "center", 
                                justifyContent: "center", 
                                gap: "8px",
                                padding: "14px"
                            }}
                        >
                            <FaCheck /> Update Password
                        </button>

                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ChangePassword;