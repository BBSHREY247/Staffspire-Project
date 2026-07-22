import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

function DashboardLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [themeClass, setThemeClass] = useState("");

    useEffect(() => {
        const force = localStorage.getItem("forcePasswordChange");
        if (force === "true" && location.pathname !== "/change-password") {
            navigate("/change-password");
        }

        // Apply theme from settings
        const settings = JSON.parse(localStorage.getItem("staffspire_settings:v1")) || {};
        const theme = settings.theme || "system";
        
        if (theme !== "system") {
            setThemeClass(`theme-${theme}`);
        } else {
            setThemeClass("");
        }
    }, [location.pathname, navigate]);

    return (
        <div className={`layout-container ${themeClass}`}>
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