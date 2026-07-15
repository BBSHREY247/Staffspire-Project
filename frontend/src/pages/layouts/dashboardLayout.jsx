import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

function DashboardLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const force = localStorage.getItem("forcePasswordChange");
        if (force === "true" && location.pathname !== "/change-password") {
            navigate("/change-password");
        }
    }, [location.pathname, navigate]);

    useEffect(() => {
        const storedTheme = localStorage.getItem("dashboard-theme") || "light";
        document.documentElement.setAttribute("data-theme", storedTheme);
    }, []);

    return (
        <div className="layout-container">
            <Header />
            <div className="dashboard-container">
                <Sidebar />
                <div className="main-content">
                    <main className="content">
                        {children}
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default DashboardLayout;