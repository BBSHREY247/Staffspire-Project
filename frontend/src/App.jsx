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
                    path="/manager/dashboard"
                    element={<ManagerDashboard />}
                />

                <Route
                    path="/employee/dashboard"
                    element={<EmployeeDashboard />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;