import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ResetPassword() {

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

                <form onSubmit={handleSubmit}>

                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e)=>
                            setNewPassword(
                                e.target.value
                            )
                        }
                        required
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e)=>
                            setConfirmPassword(
                                e.target.value
                            )
                        }
                        required
                    />

                    <button type="submit">
                        Reset Password
                    </button>

                </form>

            </div>

        </div>

    );

}

export default ResetPassword;