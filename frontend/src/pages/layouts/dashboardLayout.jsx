import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

function DashboardLayout({ children }) {
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