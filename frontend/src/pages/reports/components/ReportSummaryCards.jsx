import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaCalendarCheck, FaClipboardList, FaTasks, FaBuilding } from "react-icons/fa";

function ReportSummaryCards() {
    const [stats, setStats] = useState(null);
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const role = user.role || "Employee";

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:5000/api/reports/dashboard-stats", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setStats(response.data.stats);
                }
            } catch (error) {
                console.error("Failed to load summary stats:", error);
            }
        };
        fetchStats();
    }, []);

    if (!stats) {
        return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "18px", marginBottom: "28px" }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{
                        height: "100px", background: "white", borderRadius: "14px",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                        animation: "shimmer 1.5s infinite linear",
                        backgroundImage: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
                        backgroundSize: "200% 100%"
                    }} />
                ))}
            </div>
        );
    }

    const cards = [
        { title: role === "Employee" ? "Profile Active" : "Total Employees", value: stats.totalEmployees, icon: <FaUsers />, color: "#4f8cff", bg: "#eff6ff" },
        { title: "Present Today", value: stats.presentToday, icon: <FaCalendarCheck />, color: "#22c55e", bg: "#dcfce7" },
        { title: "Pending Leaves", value: stats.pendingLeaves, icon: <FaClipboardList />, color: "#f59e0b", bg: "#fef9c3" },
        { title: "Active Tasks", value: stats.activeTasks, icon: <FaTasks />, color: "#8b5cf6", bg: "#f3e8ff" }
    ];

    if (role === "Admin") {
        cards.push({ title: "Departments", value: stats.departments, icon: <FaBuilding />, color: "#ec4899", bg: "#fce7f3" });
    }

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "18px", marginBottom: "28px" }}>
            {cards.map((card, index) => (
                <div
                    key={index}
                    style={{
                        background: "white",
                        borderRadius: "14px",
                        padding: "20px 18px",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        transition: "transform 0.25s ease, box-shadow 0.25s ease",
                        cursor: "default",
                        borderLeft: `4px solid ${card.color}`
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>{card.title}</span>
                        <span style={{ background: card.bg, color: card.color, padding: "8px", borderRadius: "10px", fontSize: "16px", display: "flex" }}>
                            {card.icon}
                        </span>
                    </div>
                    <div style={{ fontSize: "30px", fontWeight: "800", color: "#1e293b", letterSpacing: "-0.5px" }}>{card.value}</div>
                </div>
            ))}
        </div>
    );
}

export default ReportSummaryCards;
