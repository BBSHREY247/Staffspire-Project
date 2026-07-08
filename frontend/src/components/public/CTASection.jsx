import { Link } from "react-router-dom";

function CTASection() {
    return (
        <section className="pub-cta-section">
            <div className="pub-glow-bg-right" style={{ top: "0" }}></div>
            <div className="pub-cta-box">
                <h2 className="pub-cta-title">Ready to modernize your workforce?</h2>
                <p className="pub-cta-desc">
                    Get started with Softspire today and streamline employee attendance, tasks, leaves, and departmental reports under one cohesive workspace.
                </p>
                <div className="pub-cta-btns">
                    <Link to="/login" className="pub-btn pub-btn-primary" style={{ padding: "14px 32px" }}>
                        Get Started
                    </Link>
                    <Link to="/login" className="pub-btn pub-btn-outline" style={{ padding: "14px 32px" }}>
                        Access Login
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default CTASection;
