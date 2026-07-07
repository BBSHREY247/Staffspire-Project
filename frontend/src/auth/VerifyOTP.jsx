import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";
import InlineAlert from "../components/InlineAlert";

function VerifyOTP() {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlertMsg("");
        setIsLoading(true);

        try {
            const email = localStorage.getItem("resetEmail");

            await axios.post(
                "http://localhost:5000/api/auth/verify-otp",
                { email, otp }
            );

            setAlertMsg("OTP verified! Redirecting...");
            setAlertType("success");
            localStorage.setItem("otpVerified", "true");
            setTimeout(() => navigate("/reset-password"), 1200);
        } catch (error) {
            setAlertMsg(
                error.response?.data?.message || "OTP Verification Failed. Please try again."
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
                            password
                        </span>
                    </div>
                    <h1 className="login-title">Verify OTP</h1>
                    <p className="login-subtitle">Enter the 6-digit code sent to your email.</p>
                </div>

                <div className="login-card-body">
                    <InlineAlert
                        type={alertType}
                        message={alertMsg}
                        onClose={() => setAlertMsg("")}
                    />

                    <form onSubmit={handleSubmit}>
                        <div className="login-field">
                            <label htmlFor="otp-input">One-Time Password</label>
                            <div className="login-input-wrap">
                                <span className="material-symbols-outlined login-input-icon">pin</span>
                                <input
                                    id="otp-input"
                                    type="text"
                                    placeholder="e.g. 284609"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="login-input has-icon"
                                    maxLength={6}
                                    required
                                    autoFocus
                                    style={{ letterSpacing: "0.25em", fontSize: "1.1rem" }}
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
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined login-btn-icon">verified</span>
                                    Verify OTP
                                </>
                            )}
                        </button>

                        <div style={{ textAlign: "center", marginTop: "16px" }}>
                            <a href="/forgot-password" style={{ color: "#6366f1", fontSize: "0.85rem", textDecoration: "none" }}>
                                ← Resend OTP
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default VerifyOTP;