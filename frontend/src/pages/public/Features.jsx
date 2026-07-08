import Navbar from "../../components/public/Navbar";
import FeaturesSection from "../../components/public/FeaturesSection";
import CTASection from "../../components/public/CTASection";
import Footer from "../../components/public/Footer";

function Features() {
    return (
        <div className="public-body-wrap">
            <Navbar />

            <section style={{ padding: "80px 8% 20px", position: "relative", zIndex: 1 }}>
                <div className="pub-glow-bg-right"></div>
                <div className="pub-section-header" style={{ marginBottom: "40px" }}>
                    <span className="pub-section-tag">System Capabilities</span>
                    <h1 className="pub-section-title" style={{ fontSize: "3rem", marginBottom: "16px" }}>
                        Powerful Features for modern HR teams
                    </h1>
                    <p style={{ color: "var(--pub-text-secondary)", fontSize: "1.1rem", maxWidth: "600px" }}>
                        Softspire is packed with robust modules tailored to streamline day-to-day employee actions, attendance logs, and administrative duties.
                    </p>
                </div>
            </section>

            <FeaturesSection />
            <CTASection />
            <Footer />
        </div>
    );
}

export default Features;
