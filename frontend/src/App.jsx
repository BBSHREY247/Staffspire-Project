import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Login from "./auth/Login";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeList from "./pages/admin/EmployeeList";
import AddEmployee from "./pages/admin/AddEmployee";
import EmployeeDetails from "./pages/admin/EmployeeDetails";
import ChangePassword from "./pages/admin/changePassword";
import Settings from "./pages/settings/settings";
import ForgotPassword from "./auth/ForgotPassword";
import VerifyOTP from "./auth/VerifyOTP";
import ResetPassword from "./auth/ResetPassword";
import RegisterAdmin from "./auth/RegisterAdmin";
import Departments from "./pages/admin/Departments";
import DepartmentDetails from "./pages/admin/DepartmentDetails";
import MyProfile from "./pages/employee/MyProfile";
import Attendance from "./pages/employee/Attendance";
import AttendanceList from "./pages/admin/AttendanceList";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard />}
                />

                <Route
                    path="/admin/employees"
                    element={<EmployeeList />}
                />

                <Route
                    path="/admin/attendance"
                    element={<AttendanceList />}
                />

                <Route
                    path="/manager/dashboard"
                    element={<ManagerDashboard />}
                />

                <Route
                    path="/employee/dashboard"
                    element={<EmployeeDashboard />}
                />
                <Route
                    path="/employee/profile"
                    element={<MyProfile />}
                />
                <Route
                    path="/employee/attendance"
                    element={<Attendance />}
                />
                <Route
                    path="/admin/employees/add"
                    element={<AddEmployee />}
                />
                <Route
                    path="/admin/employees/:id"
                    element={<EmployeeDetails />}
                />
                <Route
                    path="/change-password"
                    element={<ChangePassword />}
                />
                <Route
                    path="/settings"
                    element={<Settings />}
                />
                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />

                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />
                <Route
                    path="/verify-otp"
                    element={<VerifyOTP />}
                />

                <Route
                    path="/register-admin"
                    element={<RegisterAdmin />}
                />
                <Route
                    path="/admin/departments"
                    element={<Departments />}
                />
                <Route
                    path="/admin/departments/:id"
                    element={<DepartmentDetails />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;