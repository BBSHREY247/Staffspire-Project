import Sidebar from "./Sidebar";
import Header from "./Header";

function DashboardLayout({ children }) {

    return (

        <div className="dashboard-container">

            <Sidebar />

            <div className="main-content">

                <Header />

                <div className="content">

                    {children}

                </div>

            </div>

        </div>

    );

}

export default DashboardLayout;