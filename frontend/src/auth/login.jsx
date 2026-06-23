import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";


function Login({switchPage}) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setAlertMsg("");
        setAlertType("");

        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail || !password) {
            setAlertMsg("Email and Password Are Required");
            setAlertType("error");
            return;
        }

        try {

            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                {
                    email: cleanEmail,
                    password
                }
            );

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            setAlertMsg(
                `Welcome ${response.data.user.name} (${response.data.user.role})`
            );
            setAlertType("success");
            const role = response.data.user.role;
        
        if(role === "Admin"){
            navigate("/admin/dashboard");
        }
        if(role === "Manager"){
            navigate("/manager/dashboard");
        }

        if(role === "Employee"){
            navigate("/employee/dashboard");
        }

        } catch (error) {

            console.error(error);
            const errorMsg = error.response?.data?.message || "Login Failed. Try again.";
            setAlertMsg(errorMsg);
            setAlertType("error");

        }
        
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <form className="login" onSubmit={handleLogin} autoComplete="off">
                    <h1>Login</h1>
                    
                    {alertMsg && (
                        <div className={`alert-box alert-${alertType}`}>
                            {alertMsg}
                        </div>
                    )}

                    <label htmlFor="email">
                        Enter Your Existing Email
                    </label>
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={ email }
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="off"
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

                    <button type="submit">
                        Login
                    </button>
                    <br />
                    <br />
                    <p className="forgot-text">
                        forgot password? click the link below.
                    </p>
                    <p
                        className="forgot-link"
                        onClick={() =>
                            navigate("/forgot-password")
                        }
                    >
                        Forgot Password?
                    </p>
                    <br />
                    <p className="forgot-text">
                        Register Admin with Below Link
                    </p>
                    <p
                        className="forgot-link"
                        onClick={() =>
                            navigate("/register-admin")
                        }
                        style={{ marginTop: "10px" }}
                    >
                        Register Admin
                    </p>

                </form>
            </div>
        </div>
    );
}

export default Login;