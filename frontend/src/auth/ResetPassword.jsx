import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ResetPassword() {
    const [showNewPassword, setShowNewPassword] =
    useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

    const [newPassword, setNewPassword] =
    useState("");

    const [confirmPassword,
    setConfirmPassword] =
    useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {

        e.preventDefault();

        if(
            newPassword !==
            confirmPassword
        ){
            alert(
                "Passwords Do Not Match"
            );
            return;
        }

        try {

            const email =
            localStorage.getItem(
                "resetEmail"
            );

            const response =
            await axios.put(

                "http://localhost:5000/api/auth/reset-password",

                {
                    email,
                    newPassword
                }

            );

            alert(
                response.data.message
            );

            localStorage.removeItem(
                "resetEmail"
            );

            navigate("/");

        }
        catch(error){

            alert(
                error.response?.data?.message
            );

        }

    };

    return (

        <div className="auth-container">

            <div className="auth-card">

                <h1>Reset Password</h1>

                <form className="login" onSubmit={handleSubmit}>
                    <div className="password-field">

                        <input
                            type={
                                showNewPassword
                                ? "text"
                                : "password"
                            }
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e)=>
                                setNewPassword(
                                    e.target.value
                                )
                            }
                            required
                        />

                        <span
                            className="eye-icon"
                            onClick={() =>
                                setShowNewPassword(
                                    !showNewPassword
                                )
                            }
                        >
                            {
                                showNewPassword
                                ? <FaEyeSlash />
                                : <FaEye />
                            }
                        </span>

                    </div>

                    <div className="password-field">

                        <input
                            type={
                                showConfirmPassword
                                ? "text"
                                : "password"
                            }
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e)=>
                                setConfirmPassword(
                                    e.target.value
                                )
                            }
                            required
                        />

                        <span
                            className="eye-icon"
                            onClick={() =>
                                setShowConfirmPassword(
                                    !showConfirmPassword
                                )
                            }
                        >
                            {
                                showConfirmPassword
                                ? <FaEyeSlash />
                                : <FaEye />
                            }
                        </span>

                    </div>

                    <button type="submit">
                        Reset Password
                    </button>

                </form>

            </div>

        </div>

    );

}

export default ResetPassword;