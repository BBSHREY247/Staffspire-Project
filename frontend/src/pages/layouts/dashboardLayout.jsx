import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

function DashboardLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const force = localStorage.getItem("forcePasswordChange");
        if (force === "true" && location.pathname !== "/change-password") {
            navigate("/change-password");
        }
    }, [location.pathname, navigate]);

    return (
        <div className="text-on-surface font-body-md bg-[#F8FAFC] antialiased min-h-screen flex w-full">
            <Sidebar />
            <main className="flex-1 md:ml-64 w-full flex flex-col min-h-screen">
                <Header />
                <div className="mt-16 p-6 md:p-10 flex-1 w-full max-w-[1440px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default DashboardLayout;