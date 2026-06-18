import React from "react";
import DashboardLayout
from "./layouts/dashboardLayout";

function EmployeeDashboard() {

    const user =
    JSON.parse(
        localStorage.getItem("user")
    );

    return (
        <DashboardLayout>
            <div>
                <h1>StaffSpire Employee Dashboard</h1>
            </div>
        </DashboardLayout>
    );
}

export default EmployeeDashboard;