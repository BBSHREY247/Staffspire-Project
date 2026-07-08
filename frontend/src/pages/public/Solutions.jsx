import Navbar from "../../components/public/Navbar";
import CTASection from "../../components/public/CTASection";
import Footer from "../../components/public/Footer";

function Solutions() {
    const solutions = [
        {
            title: "Small Businesses",
            badge: "Efficiency & Growth",
            problem: "Manual spreadsheet tracking of attendance, absence, and leaves leads to high error rates and wasted hours weekly.",
            solve: "Softspire automates employee records, calculations, and approvals, saving admin hours and giving you back time to focus on scaling."
        },
        {
            title: "Medium Enterprises",
            badge: "Operational Scale",
            problem: "Multi-layered departments struggle with task assignment transparency and cross-team leave management overlaps.",
            solve: "Our Department and Task Management modules organize workflows hierarchically, assigning clear managers and tracking progress in real time."
        },
        {
            title: "Educational Institutions",
            badge: "Faculty & Staff Scheduling",
            problem: "Managing high volumes of non-teaching staff, daily shift logs, and department-level reporting manually is complex.",
            solve: "Softspire provides clear check-in logs, late detection, and customizable department rosters, perfect for managing institutional divisions."
        },
        {
            title: "Corporate HR",
            badge: "Compliance & Reporting",
            problem: "Auditing employee attendance history and preparing accurate payroll-ready reports requires days of manual compilation.",
            solve: "Instant PDF, Excel, and CSV report exporting enables seamless data export for payroll processing, compliance audits, and analytics."
        },
        {
            title: "Fast-Growing Startups",
            badge: "Rapid Onboarding",
            problem: "Quickly onboarding new employees without unified credentials management or defined roles creates operational friction.",
            solve: "Our Add Employee module generates secure temporary passwords and clear role definitions instantly, enabling day-one employee productivity."
        }
    ];

    return (
        <div className="public-body-wrap">
            <Navbar />

            <section style={{ padding: "80px 8% 20px", position: "relative", zIndex: 1 }}>
                <div className="pub-glow-bg"></div>
                <div className="pub-section-header" style={{ marginBottom: "40px" }}>
                    <span className="pub-section-tag">Tailored Scenarios</span>
                    <h1 className="pub-section-title" style={{ fontSize: "3rem", marginBottom: "16px" }}>
                        Built for all organizational structures
                    </h1>
                    <p style={{ color: "var(--pub-text-secondary)", fontSize: "1.1rem", maxWidth: "600px" }}>
                        Softspire scales seamlessly to address custom management hurdles across a wide array of company shapes and sizes.
                    </p>
                </div>
            </section>

            <div className="pub-solutions-grid">
                {solutions.map((sol, idx) => (
                    <div key={idx} className="pub-solution-card">
                        <span className="pub-solution-badge">{sol.badge}</span>
                        <h3 className="pub-solution-title">{sol.title}</h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div className="pub-problem-box">
                                <strong style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Problem</strong>
                                {sol.problem}
                            </div>
                            <div className="pub-solve-box">
                                <strong style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Softspire Solution</strong>
                                {sol.solve}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <CTASection />
            <Footer />
        </div>
    );
}

export default Solutions;
