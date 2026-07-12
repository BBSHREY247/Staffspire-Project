import Navbar from "../../components/public/Navbar";
import Footer from "../../components/public/Footer";
import { useScrollReveal } from "../../hooks/useScrollReveal";

function About() {
    useScrollReveal();

    const tech = [
        { name: "React", desc: "Interactive Frontend Engine" },
        { name: "Node.js", desc: "Scalable Event-Driven Backend" },
        { name: "MySQL", desc: "Relational Data Integrity" },
        { name: "JWT", desc: "Stateless Security Protocol" }
    ];

    const timeline = [
        {
            date: "Q3 2026",
            title: "Staffspire Core Launch",
            desc: "Shipped core modules including employees, departments, and password security."
        },
        {
            date: "Q1 2027",
            title: "Analytics & Reporting Suite",
            desc: "Added analytics dashboard, detailed department details, and data export formats."
        },
        {
            date: "Q2 2027",
            title: "GPS Attendance & Mobile Companion",
            desc: "Integrating geofenced check-in rules and mobile application capabilities."
        }
    ];

    return (
        <div className="public-body-wrap">
            <Navbar />

            <section style={{ padding: "80px 8% 20px", position: "relative", zIndex: 1 }}>
                <div className="pub-glow-bg-right"></div>
                <div className="pub-section-header reveal-fade-in" style={{ marginBottom: "40px" }}>
                    <span className="pub-section-tag">About Softspire</span>
                    <h1 className="pub-section-title" style={{ fontSize: "3rem", marginBottom: "16px" }}>
                        Our Background &amp; Vision
                    </h1>
                    <p style={{ color: "var(--pub-text-secondary)", fontSize: "1.1rem", maxWidth: "600px" }}>
                        Staffspire is engineered to replace fragmented workflows with unified department coordination, attendance monitoring, and secure role-based access.
                    </p>
                </div>
            </section>

            <div className="pub-about-container">
                {/* Mission and Vision */}
                <div className="pub-about-split">
                    <div className="pub-about-block reveal-slide-left">
                        <h2 className="pub-about-block-title">Our Mission</h2>
                        <p className="pub-about-block-text">
                            To replace spreadsheets with a central system, making workforce operations transparent and effortless.
                        </p>
                    </div>
                    <div className="pub-about-block reveal-slide-right">
                        <h2 className="pub-about-block-title">Our Vision</h2>
                        <p className="pub-about-block-text">
                            To build a scalable workforce platform that uses smart metrics to optimize organizational processes.
                        </p>
                    </div>
                </div>

                {/* Tech Stack
                <div style={{ marginTop: "60px", textAlign: "center" }}>
                    <span className="pub-section-tag">Architecture</span>
                    <h2 className="pub-section-title">The Technology Stack</h2>
                    <div className="pub-tech-grid">
                        {tech.map((item, idx) => (
                            <div key={idx} className="pub-tech-card">
                                <div className="pub-tech-name">{item.name}</div>
                                <div className="pub-tech-label">{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div> */}

                {/* Timeline / Future Roadmap */}
                <div style={{ marginTop: "100px" }}>
                    <div style={{ textAlign: "center" }}>
                        <span className="pub-section-tag">Roadmap</span>
                        <h2 className="pub-section-title reveal-fade-in">Timeline &amp; Evolution</h2>
                    </div>

                    <div className="pub-timeline">
                        {timeline.map((item, idx) => (
                            <div key={idx} className={`pub-timeline-item reveal-zoom-in delay-${(idx + 1) * 100}`}>
                                <div className="pub-timeline-date">{item.date}</div>
                                <h3 className="pub-timeline-title">{item.title}</h3>
                                <p style={{ color: "var(--pub-text-secondary)", margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default About;
