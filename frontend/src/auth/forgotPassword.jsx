import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import InlineAlert from "../components/InlineAlert";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState("");
    const navigate = useNavigate();

    const showAlert = (msg, type) => {
        setAlertMsg(msg);
        setAlertType(type);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlertMsg("");
        setIsLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/forgot-password",
                { email }
            );

            localStorage.setItem("resetEmail", email);
            localStorage.setItem("generatedOTP", response.data.otp);

            showAlert("OTP sent successfully! Check your email.", "success");
            setTimeout(() => navigate("/verify-otp"), 1500);
        } catch (error) {
            showAlert(
                error.response?.data?.message || "Failed to send OTP. Please try again.",
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page-root">
            <div className="login-card">
                {/* Header */}
                <div className="login-card-header">
                    <div className="login-logo-ring">
                        <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "#6366f1" }}>
                            lock_reset
                        </span>
                    </div>
                    <h1 className="login-title">Forgot Password</h1>
                    <p className="login-subtitle">Enter your registered email to receive a one-time password.</p>
                </div>

                <div className="login-card-body">
                    <InlineAlert
                        type={alertType}
                        message={alertMsg}
                        onClose={() => setAlertMsg("")}
                    />

                    <form onSubmit={handleSubmit}>
                        <div className="login-field">
                            <label htmlFor="fp-email">Email Address</label>
                            <div className="login-input-wrap">
                                <span className="material-symbols-outlined login-input-icon">mail</span>
                                <input
                                    id="fp-email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="login-input has-icon"
                                    required
                                    autoFocus
                                />
                            </div>
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
                                    Sending OTP...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined login-btn-icon">send</span>
                                    Send OTP
                                </>
                            )}
                        </button>

                        <div style={{ textAlign: "center", marginTop: "16px" }}>
                            <a href="/" style={{ color: "#6366f1", fontSize: "0.85rem", textDecoration: "none" }}>
                                ← Back to Login
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;