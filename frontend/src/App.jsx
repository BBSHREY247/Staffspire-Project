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
import LeaveDashboard from "./pages/employee/LeaveDashboard";
import LeaveRequestsList from "./pages/admin/LeaveRequestsList";
import LeaveRequestDetail from "./pages/admin/LeaveRequestDetail";
import AdminTaskList from "./pages/admin/AdminTaskList";
import TaskDetail from "./pages/admin/TaskDetail";
import MyTasks from "./pages/employee/MyTasks";
import ReportsDashboard from "./pages/reports/ReportsDashboard";
import AlertsShowcase from "./pages/admin/AlertsShowcase";


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
                    path="/admin/leaves"
                    element={<LeaveRequestsList />}
                />

                <Route
                    path="/admin/leaves/:id"
                    element={<LeaveRequestDetail />}
                />

                <Route
                    path="/admin/tasks"
                    element={<AdminTaskList />}
                />

                <Route
                    path="/admin/tasks/:id"
                    element={<TaskDetail />}
                />

                <Route
                    path="/employee/tasks"
                    element={<MyTasks />}
                />

                <Route
                    path="/employee/tasks/:id"
                    element={<TaskDetail />}
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
                    path="/employee/leaves"
                    element={<LeaveDashboard />}
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
                    path="/reports"
                    element={<ReportsDashboard />}
                />
                <Route
                    path="/alerts"
                    element={<AlertsShowcase />}
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