import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/login.css";

function RegisterAdmin() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    // Authorization states (if an admin already exists)
    const [adminExists, setAdminExists] = useState(false);
    const [authEmail, setAuthEmail] = useState("");
    const [authPassword, setAuthPassword] = useState("");
    const [showAuthPassword, setShowAuthPassword] = useState(false);

    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState("");
    
    const navigate = useNavigate();

    // Check if any admin already exists when component mounts
    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/auth/check-admin-exists");
                if (res.data && res.data.exists) {
                    setAdminExists(true);
                    setAlertMsg("An administrator already exists. Credentials of an existing admin are required to register another admin.");
                    setAlertType("error");
                }
            } catch (err) {
                console.error("Failed to check if admin exists:", err);
            }
        };
        checkAdmin();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlertMsg("");
        setAlertType("");

        const cleanEmail = email.trim().toLowerCase();

        if (!name.trim() || !cleanEmail || !password) {
            setAlertMsg("All fields are required");
            setAlertType("error");
            return;
        }

        if (adminExists && (!authEmail.trim() || !authPassword)) {
            setAlertMsg("Existing admin authorization credentials are required");
            setAlertType("error");
            return;
        }

        try {
            const payload = {
                name: name.trim(),
                email: cleanEmail,
                password,
                authEmail: adminExists ? authEmail.trim().toLowerCase() : undefined,
                authPassword: adminExists ? authPassword : undefined
            };

            const res = await axios.post(
                "http://localhost:5000/api/auth/register-admin",
                payload
            );

            setAlertMsg(res.data.message);
            setAlertType("success");

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err) {
            const errMsg = err.response?.data?.message || "Registration Failed";
            setAlertMsg(errMsg);
            setAlertType("error");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>User Register</h1>
                
                {alertMsg && (
                    <div className={`alert-box alert-${alertType}`}>
                        {alertMsg}
                    </div>
                )}

                <form className="login" onSubmit={handleSubmit} autoComplete="off">
                    <label htmlFor="name">
                        Enter Your Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <label htmlFor="email">
                        Enter Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label htmlFor="password">
                        Enter Password
                    </label>
                    <div className="password-field">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                        />
                        <span
                            className="eye-icon"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>

                    {/* Rendering existing admin auth fields if at least one admin exists */}
                    {adminExists && (
                        <>
                            <div style={{ margin: "20px 0", borderTop: "1px solid #ddd", paddingTop: "15px" }}>
                                <p style={{ fontSize: "14px", fontWeight: "600", color: "#e11d48", marginBottom: "10px", textAlign: "center" }}>
                                    Authorizing Admin Verification
                                </p>
                            </div>

                            <label htmlFor="authEmail">
                                Existing Admin Email
                            </label>
                            <input
                                type="email"
                                id="authEmail"
                                placeholder="Admin Email"
                                value={authEmail}
                                onChange={(e) => setAuthEmail(e.target.value)}
                                required
                            />

                            <label htmlFor="authPassword">
                                Existing Admin Password
                            </label>
                            <div className="password-field">
                                <input
                                    type={showAuthPassword ? "text" : "password"}
                                    id="authPassword"
                                    placeholder="Admin Password"
                                    value={authPassword}
                                    onChange={(e) => setAuthPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                />
                                <span
                                    className="eye-icon"
                                    onClick={() => setShowAuthPassword(!showAuthPassword)}
                                >
                                    {showAuthPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </>
                    )}

                    <button type="submit" style={{ marginTop: adminExists ? "10px" : "0px" }}>
                        Register Admin
                    </button>
                    
                    <br />
                    <br />
                    <p className="forgot-text">
                        Already have an admin account?
                    </p>
                    <p
                        className="forgot-link"
                        onClick={() => navigate("/login")}
                    >
                        Back to Login
                    </p>
                </form>
            </div>
        </div>
    );
}

export default RegisterAdmin;
