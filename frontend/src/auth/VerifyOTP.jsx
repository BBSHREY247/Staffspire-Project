import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";

function VerifyOTP() {

    const [otp, setOtp] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const email =
            localStorage.getItem(
                "resetEmail"
            );

            const response =
            await axios.post(

                "http://localhost:5000/api/auth/verify-otp",

                {
                    email,
                    otp
                }

            );

            alert(
                response.data.message
            );

            localStorage.setItem(
                "otpVerified",
                "true"
            );

            navigate(
                "/reset-password"
            );

        }
        catch(error){

            alert(
                error.response?.data?.message ||
                "OTP Verification Failed"
            );

        }

    };

    return (

        <div className="auth-container">

            <div className="auth-card">

                <h1>Verify OTP</h1>

                <form className="login" onSubmit={handleSubmit}>

                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) =>
                            setOtp(e.target.value)
                        }
                        required
                    />

                    <button type="submit">
                        Verify OTP
                    </button>

                </form>

            </div>

        </div>

    );

}

export default VerifyOTP;