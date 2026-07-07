import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import InlineAlert from "../components/InlineAlert";

function ResetPassword() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlertMsg("");

        if (newPassword !== confirmPassword) {
            setAlertMsg("Passwords do not match. Please try again.");
            setAlertType("error");
            return;
        }

        if (newPassword.length < 6) {
            setAlertMsg("Password must be at least 6 characters.");
            setAlertType("warning");
            return;
        }

        setIsLoading(true);

        try {
            const email = localStorage.getItem("resetEmail");
            await axios.put(
                "http://localhost:5000/api/auth/reset-password",
                { email, newPassword }
            );

            setAlertMsg("Password reset successfully! Redirecting to login...");
            setAlertType("success");
            localStorage.removeItem("resetEmail");
            localStorage.removeItem("otpVerified");
            setTimeout(() => navigate("/"), 1800);
        } catch (error) {
            setAlertMsg(
                error.response?.data?.message || "Failed to reset password. Please try again."
            );
            setAlertType("error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page-root">
            <div className="login-card">
                <div className="login-card-header">
                    <div className="login-logo-ring">
                        <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "#6366f1" }}>
                            lock
                        </span>
                    </div>
                    <h1 className="login-title">Reset Password</h1>
                    <p className="login-subtitle">Choose a strong new password for your account.</p>
                </div>

                <div className="login-card-body">
                    <InlineAlert
                        type={alertType}
                        message={alertMsg}
                        onClose={() => setAlertMsg("")}
                    />

                    <form onSubmit={handleSubmit}>
                        {/* New Password */}
                        <div className="login-field">
                            <label htmlFor="new-password">New Password</label>
                            <div className="login-password-wrap">
                                <input
                                    id="new-password"
                                    type={showNew ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="login-input"
                                    required
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    className="login-eye-btn"
                                    onClick={() => setShowNew(p => !p)}
                                    tabIndex={-1}
                                >
                                    <span className="material-symbols-outlined">
                                        {showNew ? "visibility_off" : "visibility"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="login-field">
                            <label htmlFor="confirm-password">Confirm Password</label>
                            <div className="login-password-wrap">
                                <input
                                    id="confirm-password"
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Re-enter new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="login-input"
                                    required
                                    style={{
                                        borderColor: confirmPassword && confirmPassword !== newPassword
                                            ? "#ef4444" : undefined
                                    }}
                                />
                                <button
                                    type="button"
                                    className="login-eye-btn"
                                    onClick={() => setShowConfirm(p => !p)}
                                    tabIndex={-1}
                                >
                                    <span className="material-symbols-outlined">
                                        {showConfirm ? "visibility_off" : "visibility"}
                                    </span>
                                </button>
                            </div>
                            {confirmPassword && confirmPassword !== newPassword && (
                                <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "block" }}>
                                    ⚠ Passwords do not match
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="login-btn-primary"
                            disabled={isLoading}
                            style={{ marginTop: "8px" }}
                        >
                            {isLoading ? (
                                <>
                                    <span className="material-symbols-outlined login-btn-icon" style={{ animation: "spin 1s linear infinite" }}>progress_activity</span>
                                    Resetting...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined login-btn-icon">lock_reset</span>
                                    Reset Password
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;