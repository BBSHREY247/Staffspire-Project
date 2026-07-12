function WorkflowSection() {
    const nodes = [
        { label: "Admin Setup", icon: "shield_person" },
        { label: "Onboard Employees", icon: "group" },
        { label: "Track Operations", icon: "fingerprint" },
        { label: "Export Reports", icon: "analytics" }
    ];

    return (
        <section className="pub-workflow-section">
            <div className="pub-section-header reveal-fade-in">
                <span className="pub-section-tag">Integration Flow</span>
                <h2 className="pub-section-title">End-to-End Enterprise Workflow</h2>
            </div>

            <div className="pub-workflow-container">
                {nodes.map((node, index) => (
                    <div key={index} className={`reveal-zoom-in delay-${(index + 1) * 100}`} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div className="pub-workflow-node">
                            <span className="material-symbols-outlined" style={{ color: "var(--pub-cyan)" }}>
                                {node.icon}
                            </span>
                            {node.label}
                        </div>
                        {index < nodes.length - 1 && (
                            <span className="material-symbols-outlined pub-workflow-arrow">
                                arrow_forward
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

export default WorkflowSection;
