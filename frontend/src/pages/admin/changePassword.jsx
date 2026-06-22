import { useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ChangePassword() {

    const [currentPassword, setCurrentPassword] =
    useState("");

    const [newPassword, setNewPassword] =
    useState("");

    const [confirmPassword, setConfirmPassword] =
    useState("");

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        if(newPassword !== confirmPassword){

            alert("Passwords Do Not Match");
            return;

        }

        try{

            const token =
            localStorage.getItem("token");

            const response =
            await axios.put(

                "http://localhost:5000/api/auth/change-password",

                {
                    currentPassword,
                    newPassword
                },

                {
                    headers:{
                        Authorization:
                        `Bearer ${token}`
                    }
                }

            );

            alert(
                response.data.message
            );
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }
        catch(error){

            console.log(error);

            alert(
                error.response?.data?.message ||
                "Failed To Change Password"
            );

        }

    };

    return(

        <DashboardLayout>

            <div className="form-card">

                <h1>Change Password</h1>
                <br />

                <form onSubmit={handleSubmit}>
                    <label htmlFor="password">Current Password</label>
                    <div className="password-field">

                        <input
                            type={showCurrent ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) =>
                                setCurrentPassword(e.target.value)
                            }
                        />
            
                        <span
                            className="eye-icon"
                            onClick={() =>
                                setShowCurrent(!showCurrent)
                            }
                        >
                            {showCurrent ? <FaEyeSlash /> : <FaEye />}

                        </span>

                    </div>
                    <br />  

                    <label htmlFor="password">New Password</label>
                    <div className="password-field">

                        <input
                            type={showNew ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) =>
                                setNewPassword(e.target.value)
                            }
                        />

                        <span
                            className="eye-icon"
                            onClick={() =>
                                setShowNew(!showNew)
                            }
                        >
                            {showNew ? <FaEyeSlash /> : <FaEye />}

                        </span>

                    </div>

                    <br />

                    <label htmlFor="password">Confirm Password</label>

                    <div className="password-field">

                        <input
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                        />

                        <span
                            className="eye-icon"
                            onClick={() =>
                                setShowConfirm(!showConfirm)
                            }
                        >
                            {showConfirm ? <FaEyeSlash /> : <FaEye />}

                        </span>

                    </div>

                    <button
                        className="save-btn"
                        type="submit"
                    >
                        Change Password
                    </button>

                </form>

            </div>

        </DashboardLayout>

    );

}

export default ChangePassword;