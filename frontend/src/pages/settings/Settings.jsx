import DashboardLayout from "../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { FaKey, FaChevronRight, FaCog, FaBell, FaPalette } from "react-icons/fa";

function Settings() {
    const navigate = useNavigate();

    return (
        <DashboardLayout>
            <div className="form-container-centered" style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                <div className="form-card" style={{ 
                    width: "100%", 
                    maxWidth: "600px", 
                    padding: "36px", 
                    background: "white", 
                    borderRadius: "16px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
                    border: "1px solid #e2e8f0"
                }}>
                    <h2 style={{ 
                        marginBottom: "30px", 
                        fontWeight: "700", 
                        color: "#0f172a", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "10px",
                        fontSize: "1.5rem" 
                    }}>
                        <FaCog style={{ color: "#4f46e5" }} /> Account Settings
                    </h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        
                        {/* Settings Item 1: Change Password */}
                        <div 
                            onClick={() => navigate("/change-password")}
                            style={{ 
                                display: "flex", 
                                justifyContent: "space-between",
                                alignItems: "center", 
                                padding: "20px", 
                                background: "#f8fafc", 
                                border: "1px solid #e2e8f0", 
                                borderRadius: "12px", 
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{ 
                                    width: "44px", 
                                    height: "44px", 
                                    borderRadius: "10px", 
                                    background: "#e0e7ff", 
                                    color: "#4f46e5", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "center",
                                    fontSize: "18px"
                                }}>
                                    <FaKey />
                                </div>
                                <div style={{ textAlign: "left" }}>
                                    <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Change Password</h4>
                                    <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "#64748b" }}>Update your password to keep your account secure.</p>
                                </div>
                            </div>
                            <FaChevronRight style={{ color: "#94a3b8" }} />
                        </div>

                        {/* Settings Item 2: Notifications (Mock) */}
                        <div 
                            style={{ 
                                display: "flex", 
                                justifyContent: "space-between",
                                alignItems: "center", 
                                padding: "20px", 
                                background: "#f8fafc", 
                                border: "1px solid #e2e8f0", 
                                borderRadius: "12px", 
                                opacity: 0.6,
                                cursor: "not-allowed"
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{ 
                                    width: "44px", 
                                    height: "44px", 
                                    borderRadius: "10px", 
                                    background: "#fef3c7", 
                                    color: "#d97706", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "center",
                                    fontSize: "18px"
                                }}>
                                    <FaBell />
                                </div>
                                <div style={{ textAlign: "left" }}>
                                    <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Notifications</h4>
                                    <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "#64748b" }}>Configure email alert preferences.</p>
                                </div>
                            </div>
                            <span style={{ fontSize: "11px", fontWeight: "700", background: "#cbd5e1", color: "#475569", padding: "4px 8px", borderRadius: "12px" }}>Coming Soon</span>
                        </div>

                        {/* Settings Item 3: Theme (Mock) */}
                        <div 
                            style={{ 
                                display: "flex", 
                                justifyContent: "space-between",
                                alignItems: "center", 
                                padding: "20px", 
                                background: "#f8fafc", 
                                border: "1px solid #e2e8f0", 
                                borderRadius: "12px", 
                                opacity: 0.6,
                                cursor: "not-allowed"
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{ 
                                    width: "44px", 
                                    height: "44px", 
                                    borderRadius: "10px", 
                                    background: "#d1fae5", 
                                    color: "#059669", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "center",
                                    fontSize: "18px"
                                }}>
                                    <FaPalette />
                                </div>
                                <div style={{ textAlign: "left" }}>
                                    <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Theme</h4>
                                    <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "#64748b" }}>Toggle light mode and dark mode preferences.</p>
                                </div>
                            </div>
                            <span style={{ fontSize: "11px", fontWeight: "700", background: "#cbd5e1", color: "#475569", padding: "4px 8px", borderRadius: "12px" }}>Coming Soon</span>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default Settings;