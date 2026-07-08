import { Link } from "react-router-dom";

function Hero() {
    return (
        <section className="pub-hero-section">
            <div className="pub-glow-bg"></div>
            <div className="pub-hero-content">
                <div className="pub-hero-tag">
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>verified</span>
                    Version 1.0 Live
                </div>
                <h1 className="pub-hero-title">
                    Smart Workforce <span style={{ color: "var(--pub-primary)" }}>Management</span> for Modern Organizations.
                </h1>
                <p className="pub-hero-subtitle">
                    Staffspire is an enterprise-grade Human Resource Information System that helps organizations manage employees, attendance, leave, tasks, reports, and departmental operations from one centralized platform.
                </p>
                <div className="pub-hero-btns">
                    <Link to="/login" className="pub-btn pub-btn-primary" style={{ padding: "14px 28px" }}>
                        Get Started
                    </Link>
                    <Link to="/features" className="pub-btn pub-btn-outline" style={{ padding: "14px 28px" }}>
                        View Features
                    </Link>
                </div>

                <div className="pub-trust-badges">
                    <span className="pub-trust-badge">Enterprise Certified</span>
                    <span className="pub-trust-badge">99.9% Uptime</span>
                    <span className="pub-trust-badge">ISO 27001</span>
                    <span className="pub-trust-badge">GDPR Ready</span>
                </div>
            </div>

            <div className="pub-hero-media">
                {/* Redesigned Mockup Card matching user's design image */}
                <div className="pub-dashboard-preview">
                    {/* Window Controls */}
                    <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f56" }}></span>
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ffbd2e" }}></span>
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#27c93f" }}></span>
                    </div>

                    {/* Dashboard Layout Mock */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr 1.3fr 1.3fr", gap: "14px", marginBottom: "20px" }}>
                        {/* Sidebar Mock */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ height: "40px", width: "100%", background: "#eef2ff", borderRadius: "8px" }}></div>
                            <div style={{ height: "12px", width: "80%", background: "#f1f5f9", borderRadius: "4px" }}></div>
                            <div style={{ height: "12px", width: "90%", background: "#f1f5f9", borderRadius: "4px" }}></div>
                            <div style={{ height: "12px", width: "70%", background: "#f1f5f9", borderRadius: "4px" }}></div>
                        </div>

                        {/* Card 1 */}
                        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px", height: "90px" }}>
                            <div style={{ width: "30px", height: "6px", background: "#cbd5e1", borderRadius: "3px", marginBottom: "8px" }}></div>
                            <div style={{ width: "60px", height: "20px", background: "#e0e7ff", borderRadius: "6px" }}></div>
                        </div>

                        {/* Card 2 */}
                        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px", height: "90px" }}>
                            <div style={{ width: "40px", height: "6px", background: "#cbd5e1", borderRadius: "3px", marginBottom: "8px" }}></div>
                            <div style={{ width: "50px", height: "20px", background: "#f3e8ff", borderRadius: "6px" }}></div>
                        </div>

                        {/* Card 3 */}
                        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px", height: "90px" }}>
                            <div style={{ width: "25px", height: "6px", background: "#cbd5e1", borderRadius: "3px", marginBottom: "8px" }}></div>
                            <div style={{ width: "45px", height: "20px", background: "#dcfce7", borderRadius: "6px" }}></div>
                        </div>
                    </div>

                    {/* Chart Container Mock */}
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px 24px", height: "180px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ width: "120px", height: "8px", background: "#cbd5e1", borderRadius: "4px" }}></div>
                            <div style={{ width: "40px", height: "8px", background: "#e2e8f0", borderRadius: "4px" }}></div>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "24px", height: "100px", paddingTop: "10px" }}>
                            <div style={{ width: "20px", height: "45px", background: "#dbeafe", borderRadius: "4px 4px 0 0" }}></div>
                            <div style={{ width: "20px", height: "65px", background: "#bfdbfe", borderRadius: "4px 4px 0 0" }}></div>
                            <div style={{ width: "20px", height: "90px", background: "var(--pub-primary)", borderRadius: "4px 4px 0 0" }}></div>
                            <div style={{ width: "20px", height: "70px", background: "#818cf8", borderRadius: "4px 4px 0 0" }}></div>
                            <div style={{ width: "20px", height: "35px", background: "#c7d2fe", borderRadius: "4px 4px 0 0" }}></div>
                        </div>
                    </div>

                    {/* Badge hanging off to the right */}
                    <div className="pub-dashboard-badge">
                        12k+
                        <span>Active Users</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
