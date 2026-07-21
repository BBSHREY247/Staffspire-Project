import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { FaEye, FaEyeSlash, FaLock, FaCheck } from "react-icons/fa";
import InlineAlert from "../../components/InlineAlert";

function ChangePassword() {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setAlertMsg("Passwords do not match. Please try again.");
            setAlertType("error");
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

            setAlertMsg(response.data.message || "Password changed successfully!");
            setAlertType("success");

            // Clear forced password change flag
            localStorage.removeItem("forcePasswordChange");

            // Update user in localStorage
            const user = JSON.parse(localStorage.getItem("user")) || {};
            user.must_change_password = 0;
            localStorage.setItem("user", JSON.stringify(user));

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                if (user.role === "Admin") navigate("/admin/dashboard");
                else if (user.role === "Manager") navigate("/manager/dashboard");
                else navigate("/employee/dashboard");
            }, 1500);
        } catch (error) {
            console.log(error);
            setAlertMsg(
                error.response?.data?.message ||
                "Failed To Change Password"
            );
            setAlertType("error");
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

                        <InlineAlert
                            type={alertType}
                            message={alertMsg}
                            onClose={() => setAlertMsg("")}
                        />

                        {/* Current Password */}

                        <div className="form-group-custom">
                            <label className="form-label-custom" style={{ fontWeight: "600", fontSize: "14px", color: "#475569" }}>Current Password</label>
                            <div style={{ position: "relative", marginTop: "6px" }}>
                                <input
                                    aria-label="Current Password"
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
                                <button
                                    type="button"
                                    aria-label="Toggle password visibility"
                                    style={{ 
                                        position: "absolute", 
                                        right: "12px", 
                                        top: "50%", 
                                        transform: "translateY(-50%)", 
                                        cursor: "pointer", 
                                        color: "#64748b",
                                        display: "flex",
                                        alignItems: "center",
                                        background: "none",
                                        border: "none",
                                        padding: 0
                                    }}
                                    onClick={() => setShowCurrent(!showCurrent)}
                                >
                                    {showCurrent ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="form-group-custom">
                            <label className="form-label-custom" style={{ fontWeight: "600", fontSize: "14px", color: "#475569" }}>New Password</label>
                            <div style={{ position: "relative", marginTop: "6px" }}>
                                <input
                                    aria-label="New Password"
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
                                <button
                                    type="button"
                                    aria-label="Toggle password visibility"
                                    style={{ 
                                        position: "absolute", 
                                        right: "12px", 
                                        top: "50%", 
                                        transform: "translateY(-50%)", 
                                        cursor: "pointer", 
                                        color: "#64748b",
                                        display: "flex",
                                        alignItems: "center",
                                        background: "none",
                                        border: "none",
                                        padding: 0
                                    }}
                                    onClick={() => setShowNew(!showNew)}
                                >
                                    {showCurrent ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="form-group-custom">
                            <label className="form-label-custom" style={{ fontWeight: "600", fontSize: "14px", color: "#475569" }}>Confirm Password</label>
                            <div style={{ position: "relative", marginTop: "6px" }}>
                                <input
                                    aria-label="Confirm Password"
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
                                <button
                                    type="button"
                                    aria-label="Toggle password visibility"
                                    style={{ 
                                        position: "absolute", 
                                        right: "12px", 
                                        top: "50%", 
                                        transform: "translateY(-50%)", 
                                        cursor: "pointer", 
                                        color: "#64748b",
                                        display: "flex",
                                        alignItems: "center",
                                        background: "none",
                                        border: "none",
                                        padding: 0
                                    }}
                                    onClick={() => setShowConfirm(!showConfirm)}
                                >
                                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                </button>
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