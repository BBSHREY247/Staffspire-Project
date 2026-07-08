import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/Softspire_Logo.jpeg";

function Navbar({ theme }) {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? "active" : "";
    };

    return (
        <nav className={`pub-navbar ${theme === "dark" ? "theme-dark" : ""}`}>
            <Link to="/" className="pub-logo-text" style={{ textDecoration: "none" }}>
                <img src={logo} alt="Softspire Solutions" className="pub-logo-img" />
            </Link>

            <ul className="pub-nav-links">
                <li>
                    <Link to="/" className={`pub-nav-link ${isActive("/")}`}>Home</Link>
                </li>
                <li>
                    <Link to="/features" className={`pub-nav-link ${isActive("/features")}`}>Features</Link>
                </li>
                <li>
                    <Link to="/solutions" className={`pub-nav-link ${isActive("/solutions")}`}>Solutions</Link>
                </li>
                <li>
                    <Link to="/about" className={`pub-nav-link ${isActive("/about")}`}>About</Link>
                </li>
                <li>
                    <Link to="/contact" className={`pub-nav-link ${isActive("/contact")}`}>Contact</Link>
                </li>
            </ul>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Link to="/login" className="pub-btn pub-btn-outline">
                    Login
                </Link>
                <Link to="/login" className="pub-btn pub-btn-primary">
                    Get Started
                </Link>
            </div>
        </nav>
    );
}

export default Navbar;
