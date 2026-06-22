import DashboardLayout from "../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";

function Settings() {

    const navigate = useNavigate();

    return (
        <DashboardLayout>

            <h1>Settings</h1>
            <br />

            <button
                className="setting-btn"
                onClick={() =>
                    navigate("/change-password")
                }
            >
                Change Password
            </button>

        </DashboardLayout>
    );
}

export default Settings;