import React from "react";
import DashboardLayout from "../layouts/DashboardLayout";

function ManagerDashboard() {

    const user =
    JSON.parse(
        localStorage.getItem("user")
    );

    return (
        <DashboardLayout>
            <div>
                <h1>StaffSpire Manager Dashboard</h1>
            </div>
        </DashboardLayout>
    );
}

export default ManagerDashboard;