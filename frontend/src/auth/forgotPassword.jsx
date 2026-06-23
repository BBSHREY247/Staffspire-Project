import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

function ForgotPassword() {

    const [email, setEmail] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await axios.post(
                "http://localhost:5000/api/auth/forgot-password",
                { email }
            );

            alert(response.data.message);

            localStorage.setItem(
                "resetEmail",
                email
            );

            localStorage.setItem(
                "generatedOTP",
                response.data.otp
            );
            navigate("/verify-otp");

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

                <h1>Forgot Password</h1>

                <form className="login" onSubmit={handleSubmit} >

                    <input
                        type="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e)=>
                            setEmail(
                                e.target.value
                            )
                        }
                        required
                    />

                    <button type="submit">
                        Verify Email
                    </button>

                </form>

            </div>

        </div>

    );

}

export default ForgotPassword;