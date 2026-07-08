import { useState } from "react";
import Navbar from "../../components/public/Navbar";
import Footer from "../../components/public/Footer";
import InlineAlert from "../../components/InlineAlert";

function Contact() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [formAlert, setFormAlert] = useState("");
    const [formAlertType, setFormAlertType] = useState("success");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormAlert("");

        setTimeout(() => {
            setFormAlert("Message received successfully! We will get back to you shortly.");
            setFormAlertType("success");
            setName("");
            setEmail("");
            setSubject("");
            setMessage("");
            setSubmitting(false);
        }, 1200);
    };

    return (
        <div className="public-body-wrap">
            <Navbar />

            <section style={{ padding: "80px 8% 20px", position: "relative", zIndex: 1 }}>
                <div className="pub-glow-bg"></div>
                <div className="pub-section-header" style={{ marginBottom: "40px" }}>
                    <span className="pub-section-tag">Get In Touch</span>
                    <h1 className="pub-section-title" style={{ fontSize: "3rem", marginBottom: "16px" }}>
                        Contact our sales &amp; support
                    </h1>
                    <p style={{ color: "var(--pub-text-secondary)", fontSize: "1.1rem", maxWidth: "600px" }}>
                        Have questions about setups, role models, features, or custom integrations? Send us a line.
                    </p>
                </div>
            </section>

            <div className="pub-contact-grid">
                {/* Form Card */}
                <div className="pub-contact-form-card">
                    <InlineAlert
                        type={formAlertType}
                        message={formAlert}
                        onClose={() => setFormAlert("")}
                    />

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--pub-text-secondary)" }}>Name</label>
                                <input
                                    type="text"
                                    required
                                    className="pub-contact-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--pub-text-secondary)" }}>Email</label>
                                <input
                                    type="email"
                                    required
                                    className="pub-contact-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--pub-text-secondary)" }}>Subject</label>
                            <input
                                type="text"
                                required
                                className="pub-contact-input"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="What is this regarding?"
                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--pub-text-secondary)" }}>Message</label>
                            <textarea
                                required
                                className="pub-contact-input"
                                rows={5}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write your message here..."
                                style={{ resize: "none" }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="pub-btn pub-btn-primary"
                            disabled={submitting}
                            style={{ padding: "12px", width: "100%", marginTop: "8px" }}
                        >
                            {submitting ? "Sending message..." : "Send Message"}
                        </button>
                    </form>
                </div>

                {/* Info Card */}
                <div className="pub-info-card">
                    <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800 }}>Contact Channels</h3>

                    <div className="pub-info-item">
                        <div className="pub-info-icon">
                            <span className="material-symbols-outlined">mail</span>
                        </div>
                        <div>
                            <div className="pub-info-text-title">Email</div>
                            <div className="pub-info-text-value">shreyash.sofspiresolutions@gmail.com</div>
                        </div>
                    </div>  

                    <div className="pub-info-item">
                        <div className="pub-info-icon" style={{ background: "rgba(6, 182, 212, 0.1)", color: "var(--pub-cyan)" }}>
                            <span className="material-symbols-outlined">link</span>
                        </div>
                        <div>
                            <div className="pub-info-text-title">GitHub</div>
                            <div className="pub-info-text-value">github.com/Softspire</div>
                        </div>
                    </div>

                    <div className="pub-info-item">
                        <div className="pub-info-icon">
                            <span className="material-symbols-outlined">share</span>
                        </div>
                        <div>
                            <div className="pub-info-text-title">LinkedIn</div>
                            <div className="pub-info-text-value">https://www.linkedin.com/company/softspire-solutions/posts/?feedView=allv</div>
                        </div>
                    </div>

                    <div className="pub-info-item" style={{ background: "rgba(255,255,255,0.01)", borderTop: "1px solid var(--pub-card-border)", paddingTop: "20px" }}>
                        <div className="pub-info-icon" style={{ background: "rgba(99, 102, 241, 0.1)", color: "var(--pub-primary)" }}>
                            <span className="material-symbols-outlined">location_on</span>
                        </div>
                        <div>
                            <div className="pub-info-text-title">Location</div>
                            <div className="pub-info-text-value">Ahilyanagar, Maharashtra, India</div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Contact;
