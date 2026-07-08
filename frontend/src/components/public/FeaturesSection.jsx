function FeaturesSection() {
    const features = [
        {
            title: "Employee Management",
            icon: "badge",
            items: [
                "Comprehensive Employee Profiles",
                "Full Administrative CRUD Actions",
                "Cross-Department Assignment",
                "Secure Credentials Management"
            ]
        },
        {
            title: "Attendance & Time Tracking",
            icon: "schedule",
            items: [
                "Self Service Check In & Check Out",
                "Late & Half-Day Detection",
                "Personal Attendance History Log",
                "Monthly Attendance Reports"
            ],
            badge: "GPS Verification Coming Soon"
        },
        {
            title: "Leave Management",
            icon: "event_busy",
            items: [
                "Apply & Track Leave Requests",
                "Automated Manager Approval Workflow",
                "Structured Personal Leave History",
                "Easy Cancellation Workflow"
            ]
        },
        {
            title: "Task Management",
            icon: "checklist",
            items: [
                "Create & Assign Operational Tasks",
                "Real-time Task Progress Tracking",
                "Set Priority (High, Medium, Low)",
                "Enforce Due Date Reminders"
            ]
        },
        {
            title: "Analytical Reporting",
            icon: "bar_chart",
            items: [
                "Attendance & Leave Reports",
                "Task & Performance Reports",
                "Departmental Summary Reports",
                "Export to PDF, Excel, and CSV"
            ]
        },
        {
            title: "Role-Based Access Control",
            icon: "admin_panel_settings",
            items: [
                "Admin Control Panel Access",
                "Manager Department Approvals",
                "Employee Self-Service Area",
                "Strict Endpoint Authentication Guard"
            ]
        }
    ];

    return (
        <div className="pub-features-grid" style={{ marginTop: "40px" }}>
            {features.map((feature, idx) => (
                <div key={idx} className="pub-feature-card">
                    {feature.badge && (
                        <span className="pub-soon-badge">{feature.badge}</span>
                    )}
                    <div className="pub-feature-icon-wrapper">
                        <span className="material-symbols-outlined">{feature.icon}</span>
                    </div>
                    <h3 className="pub-feature-title">{feature.title}</h3>
                    <ul className="pub-feature-list">
                        {feature.items.map((item, index) => (
                            <li key={index} className="pub-feature-item">
                                <span className="material-symbols-outlined pub-feature-item-icon">check_circle</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

export default FeaturesSection;
