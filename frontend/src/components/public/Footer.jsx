import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="pub-footer">
            <div className="pub-footer-grid">
                <div className="pub-footer-logo-desc">
                    <Link to="/" className="pub-logo-text" style={{ textDecoration: "none" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "var(--pub-primary)" }}>
                            rocket_launch
                        </span>
                        Softspire
                    </Link>
                    <p style={{ color: "var(--pub-text-secondary)", fontSize: "0.9rem", lineHeight: "1.6", margin: "10px 0 0" }}>
                        Next-generation HRIS platform simplifying enterprise personnel, attendance, and department workflows with modern analytical precision.
                    </p>
                </div>

                <div>
                    <h4 className="pub-footer-title">Company</h4>
                    <ul className="pub-footer-links">
                        <li className="pub-footer-link"><Link to="/about">About Us</Link></li>
                        <li className="pub-footer-link"><Link to="/contact">Contact</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="pub-footer-title">Product</h4>
                    <ul className="pub-footer-links">
                        <li className="pub-footer-link"><Link to="/features">Features</Link></li>
                        <li className="pub-footer-link"><Link to="/solutions">Solutions</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="pub-footer-title">Resources</h4>
                    <ul className="pub-footer-links">
                        <li className="pub-footer-link" style={{ color: "var(--pub-text-secondary)", fontSize: "0.9rem" }}>Docs (Coming Soon)</li>
                        <li className="pub-footer-link" style={{ color: "var(--pub-text-secondary)", fontSize: "0.9rem" }}>API Reference</li>
                    </ul>
                </div>

                <div>
                    <h4 className="pub-footer-title">Legal</h4>
                    <ul className="pub-footer-links">
                        <li className="pub-footer-link"><a href="#privacy">Privacy Policy</a></li>
                        <li className="pub-footer-link"><a href="#terms">Terms of Service</a></li>
                    </ul>
                </div>
            </div>

            <div className="pub-footer-bottom">
                <div>© 2026 Softspire. All rights reserved.</div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    Built with <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--pub-cyan)" }}>code</span> React + Node.js
                </div>
            </div>
        </footer>
    );
}

export default Footer;
