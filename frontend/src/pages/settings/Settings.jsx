import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaKey, FaChevronRight, FaCog, FaBell, FaPalette, FaMapMarkerAlt, FaExpandArrowsAlt } from "react-icons/fa";

function Settings() {
    const navigate = useNavigate();
    
    // User info
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const isAdmin = user.role === "Admin";

    // Geofencing states
    const [officeName, setOfficeName] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [radius, setRadius] = useState("");
    const [loadingSettings, setLoadingSettings] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const showNotification = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const fetchOfficeSettings = async () => {
        if (!isAdmin) return;
        try {
            setLoadingSettings(true);
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/api/office-settings", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const office = response.data.data;
            if (office) {
                setOfficeName(office.office_name);
                setLatitude(office.latitude);
                setLongitude(office.longitude);
                setRadius(office.attendance_radius);
            }
        } catch (error) {
            console.error("Failed to load geofencing settings:", error);
            showNotification("error", "Failed to load geofencing settings.");
        } finally {
            setLoadingSettings(false);
        }
    };

    useEffect(() => {
        fetchOfficeSettings();
    }, [isAdmin]);

    const handleSaveOfficeSettings = async (e) => {
        e.preventDefault();
        try {
            setSaveLoading(true);
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:5000/api/office-settings",
                {
                    office_name: officeName,
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    attendance_radius: parseFloat(radius)
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showNotification("success", "Office geofencing settings updated successfully.");
        } catch (error) {
            console.error("Failed to save geofencing settings:", error);
            showNotification(
                "error",
                error.response?.data?.message || "Failed to update geofencing settings."
            );
        } finally {
            setSaveLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="form-container-centered" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 0", gap: "24px" }}>
                
                {message && (
                    <div className={`alert-banner alert-${message.type}`} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
                        {message.text}
                    </div>
                )}

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

                {/* Admin-only Geofencing Settings */}
                {isAdmin && (
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
                            <FaMapMarkerAlt style={{ color: "#ef4444" }} /> Office Location & Geofencing
                        </h2>

                        {loadingSettings ? (
                            <p style={{ color: "#64748b", textAlign: "center" }}>Loading office settings...</p>
                        ) : (
                            <form onSubmit={handleSaveOfficeSettings} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Office Name</label>
                                    <input
                                        type="text"
                                        value={officeName}
                                        onChange={(e) => setOfficeName(e.target.value)}
                                        placeholder="e.g. Head Office"
                                        required
                                    />
                                </div>

                                <div style={{ display: "flex", gap: "16px" }}>
                                    <div className="form-group" style={{ margin: 0, flex: 1 }}>
                                        <label>Latitude</label>
                                        <input
                                            type="number"
                                            step="0.00000001"
                                            value={latitude}
                                            onChange={(e) => setLatitude(e.target.value)}
                                            placeholder="e.g. 18.5204"
                                            required
                                        />
                                    </div>
                                    <div className="form-group" style={{ margin: 0, flex: 1 }}>
                                        <label>Longitude</label>
                                        <input
                                            type="number"
                                            step="0.00000001"
                                            value={longitude}
                                            onChange={(e) => setLongitude(e.target.value)}
                                            placeholder="e.g. 73.8567"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Allowed Attendance Radius (meters)</label>
                                    <input
                                        type="number"
                                        value={radius}
                                        onChange={(e) => setRadius(e.target.value)}
                                        placeholder="e.g. 100"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={saveLoading}
                                    style={{
                                        marginTop: "12px",
                                        background: "#4f46e5",
                                        color: "white",
                                        border: "none",
                                        padding: "12px 20px",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        transition: "background 0.2s"
                                    }}
                                >
                                    {saveLoading ? "Saving Changes..." : "Save Geofence Settings"}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default Settings;