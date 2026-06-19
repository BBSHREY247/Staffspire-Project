import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Login from "./auth/Login";

import AdminDashboard
from "./pages/AdminDashboard";

import ManagerDashboard
from "./pages/ManagerDashboard";

import EmployeeDashboard
from "./pages/EmployeeDashboard";



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