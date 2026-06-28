import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { FaUserCircle, FaBuilding, FaIdBadge, FaEnvelope, FaPhone } from "react-icons/fa";

function MyProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    "http://localhost:5000/api/employee/dashboard",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                if (response.data.success) {
                    setProfile(response.data.employee);
                }
            } catch (error) {
                console.error("Failed to load employee profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div style={{ textAlign: "center", padding: "100px" }}>
                    <p style={{ fontSize: "18px", color: "#64748b" }}>Loading profile details...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!profile) {
        return (
            <DashboardLayout>
                <div style={{ textAlign: "center", padding: "100px" }}>
                    <p style={{ fontSize: "18px", color: "#ef4444" }}>Failed to load profile information.</p>
                </div>
            </DashboardLayout>
        );
    }

    // Initials for avatar
    const initials = profile.name ? profile.name.charAt(0).toUpperCase() : "E";

    return (
        <DashboardLayout>
            <div className="employee-header" style={{ marginBottom: "20px" }}>
                <h1 className="page-title" style={{ margin: 0 }}>My Profile</h1>
            </div>

            <div className="profile-details-centered-grid">
                <div className="details-card profile-details-card-centered">
                    <div className="profile-details-avatar">
                        {initials}
                    </div>

                    <h2 className="profile-details-name">
                        {profile.name}
                    </h2>
                    <span className="profile-details-badge">
                        {profile.designation}
                    </span>

                    <div className="profile-details-divider"></div>

                    {/* Detailed info rows */}
                    <div className="profile-details-info-list">
                        
                        <div className="profile-info-row">
                            <div className="profile-info-icon-box id-badge">
                                <FaIdBadge style={{ fontSize: "20px" }} />
                            </div>
                            <div>
                                <div className="profile-info-label-small">Employee ID</div>
                                <div className="profile-info-value-text">{profile.employee_id}</div>
                            </div>
                        </div>

                        <div className="profile-info-row">
                            <div className="profile-info-icon-box building">
                                <FaBuilding style={{ fontSize: "20px" }} />
                            </div>
                            <div>
                                <div className="profile-info-label-small">Department</div>
                                <div className="profile-info-value-text">{profile.department}</div>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <div className="profile-info-icon-box envelope">
                                <FaEnvelope style={{ fontSize: "20px" }} />
                            </div>
                            <div>
                                <div className="profile-info-label-small">Email Address</div>
                                <div className="profile-info-value-text">{profile.email}</div>
                            </div>
                        </div>

                        <div className="profile-info-row">
                            <div className="profile-info-icon-box phone">
                                <FaPhone style={{ fontSize: "20px" }} />
                            </div>
                            <div>
                                <div className="profile-info-label-small">Phone Number</div>
                                <div className="profile-info-value-text">{profile.phone}</div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default MyProfile;
