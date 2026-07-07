import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AddEmployee() {
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        start_date: "",
        department: "",
        designation: "",
        role: "Employee"
    });

    const [departments, setDepartments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState({ employeeId: "", temporaryPassword: "" });
    const [copied, setCopied] = useState(false);

    // Fetch existing departments for the select dropdown
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/departments");
                setDepartments(response.data || []);
            } catch (error) {
                console.error("Failed to load departments:", error);
            }
        };
        fetchDepartments();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSelectRole = (selectedRole) => {
        setFormData({
            ...formData,
            role: selectedRole
        });
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        
        if (step === 1) {
            if (!formData.first_name || !formData.last_name || !formData.email) {
                alert("Please fill in all required personal information.");
                return;
            }
            // Simple email validation
            if (!/\S+@\S+\.\S+/.test(formData.email)) {
                alert("Please enter a valid email address.");
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (!formData.start_date || !formData.department || !formData.designation) {
                alert("Please fill in all required employment details.");
                return;
            }
            setStep(3);
        }
    };

    const handlePrevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            navigate("/admin/employees");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setActionLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:5000/api/employees",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setCreatedCredentials({
                    employeeId: response.data.employeeId,
                    temporaryPassword: response.data.temporaryPassword
                });
                setShowModal(true);
            } else {
                alert(response.data.message || "Failed to Create Employee");
            }
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Failed To Create Employee");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCopy = () => {
        const textToCopy = `Employee ID: ${createdCredentials.employeeId}\nTemporary Password: ${createdCredentials.temporaryPassword}`;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Computes progress bar width based on active step
    const getProgressBarWidth = () => {
        if (step === 1) return "10%";
        if (step === 2) return "50%";
        return "100%";
    };

    return (
        <div className="transactional-container">
            {/* Header bar */}
            <header className="transactional-header">
                <div className="transactional-header-left">
                    <button 
                        onClick={handlePrevStep}
                        className="btn-back-round"
                        title="Go back"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="header-title-wrapper">
                        <h1>Add New Employee</h1>
                        <span className="header-subtitle">Directory &gt; Recruitment</span>
                    </div>
                </div>
                <div>
                    <img 
                        alt="Softspire Solutions Logo" 
                        className="h-8 w-auto object-contain hidden md:block opacity-80" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDP1ai0YVOKz7hN7EOCnfkv-NV4T7drwRm593XFyIkg_QTBlsLSRd2MhoaNSe4W1CIV49DgKvy-f8J9BKjtizDwhhR143L5vjsC4sw9A2YvRLiGg57t7YjYytqggJGY1ASzzUSm2H5qkqyy4-4vluFzTZ6WksHtuFulgyQDfgMXDnMFzNDFxALnJ_hAw_znQSdYWOEVA88ZGm_-kI2CUtP8f-HUV-jg9NgrGFzPqoaW_JLqFiyW2IRjRf6P0uGot_H2JcyL_2fuXA"
                        style={{ height: "32px" }}
                    />
                </div>
            </header>

            {/* Main content body */}
            <div className="transactional-scrollable-body">
                <div className="transactional-form-width-wrapper">
                    
                    {/* Stepper Progress Indicator */}
                    <div className="stepper-progress-box">
                        <div className="stepper-line-bg"></div>
                        <div className="stepper-line-active" style={{ width: getProgressBarWidth() }}></div>
                        <div className="stepper-steps-wrapper">
                            
                            {/* Step 1 */}
                            <div className={`step-node ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
                                <div className="step-circle">{step > 1 ? "✓" : "1"}</div>
                                <span className="step-label">Personal Info</span>
                            </div>

                            {/* Step 2 */}
                            <div className={`step-node ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}>
                                <div className="step-circle">{step > 2 ? "✓" : "2"}</div>
                                <span className="step-label">Employment</span>
                            </div>

                            {/* Step 3 */}
                            <div className={`step-node ${step >= 3 ? "active" : ""}`}>
                                <div className="step-circle">3</div>
                                <span className="step-label">Role &amp; Access</span>
                            </div>
                        </div>
                    </div>

                    {/* Step-specific Form Cards */}
                    <form onSubmit={step === 3 ? handleSubmit : handleNextStep}>
                        
                        {/* STEP 1: Personal Information */}
                        {step === 1 && (
                            <section className="form-section-card">
                                <div className="section-header-row">
                                    <h2>
                                        <span className="material-symbols-outlined text-primary">person</span>
                                        Personal Information
                                    </h2>
                                    <p>Basic details and contact information.</p>
                                </div>
                                <div className="form-fields-grid">
                                    {/* First Name */}
                                    <div className="form-input-group">
                                        <label htmlFor="first_name">
                                            First Name <span className="required-star">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            id="first_name"
                                            placeholder="e.g. Jane"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            className="form-textbox"
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    {/* Last Name */}
                                    <div className="form-input-group">
                                        <label htmlFor="last_name">
                                            Last Name <span className="required-star">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            id="last_name"
                                            placeholder="e.g. Doe"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            className="form-textbox"
                                            required
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="form-input-group form-field-full-width">
                                        <label htmlFor="email">
                                            Work Email <span className="required-star">*</span>
                                        </label>
                                        <div className="filter-input-wrapper">
                                            <span className="material-symbols-outlined filter-input-icon">mail</span>
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                placeholder="jane.doe@staffspire.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="form-textbox has-icon-left"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* STEP 2: Employment Details */}
                        {step === 2 && (
                            <section className="form-section-card">
                                <div className="section-header-row">
                                    <h2>
                                        <span className="material-symbols-outlined text-primary">work</span>
                                        Employment Details
                                    </h2>
                                    <p>Organizational placement and start dates.</p>
                                </div>
                                <div className="form-fields-grid">
                                    {/* Employee ID */}
                                    <div className="form-input-group">
                                        <label htmlFor="empId">Employee ID</label>
                                        <input
                                            type="text"
                                            id="empId"
                                            value="EMP-8924"
                                            className="form-textbox readonly"
                                            readOnly
                                        />
                                        <p style={{ margin: 0, fontSize: "11px", color: "#737686" }}>Auto-generated.</p>
                                    </div>

                                    {/* Start Date */}
                                    <div className="form-input-group">
                                        <label htmlFor="start_date">
                                            Start Date <span className="required-star">*</span>
                                        </label>
                                        <div className="filter-input-wrapper">
                                            <span className="material-symbols-outlined filter-input-icon">calendar_today</span>
                                            <input
                                                type="date"
                                                name="start_date"
                                                id="start_date"
                                                value={formData.start_date}
                                                onChange={handleChange}
                                                className="form-textbox has-icon-left"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Department */}
                                    <div className="form-input-group">
                                        <label htmlFor="department">
                                            Department <span className="required-star">*</span>
                                        </label>
                                        <div className="form-select-arrow-wrapper">
                                            <select
                                                name="department"
                                                id="department"
                                                value={formData.department}
                                                onChange={handleChange}
                                                className="form-select-custom"
                                                required
                                            >
                                                <option value="" disabled>Select department...</option>
                                                {departments.map((dept) => (
                                                    <option key={dept.id} value={dept.department_name}>
                                                        {dept.department_name}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="material-symbols-outlined select-dropdown-arrow">expand_more</span>
                                        </div>
                                    </div>

                                    {/* Designation */}
                                    <div className="form-input-group">
                                        <label htmlFor="designation">
                                            Designation <span className="required-star">*</span>
                                            <span 
                                                className="material-symbols-outlined text-secondary cursor-help" 
                                                style={{ fontSize: "16px" }}
                                                title="Official job title as per employment contract."
                                            >
                                                help
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="designation"
                                            id="designation"
                                            placeholder="e.g. Senior Frontend Developer"
                                            value={formData.designation}
                                            onChange={handleChange}
                                            className="form-textbox"
                                            required
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* STEP 3: Role & Access */}
                        {step === 3 && (
                            <section className="form-section-card">
                                <div className="section-header-row">
                                    <h2>
                                        <span className="material-symbols-outlined text-primary">security</span>
                                        Role &amp; Access
                                    </h2>
                                    <p>Define permissions and workspace access level.</p>
                                </div>

                                <div className="role-cards-grid">
                                    {/* Role Card 1: Employee */}
                                    <div 
                                        onClick={() => handleSelectRole("Employee")}
                                        className={`role-interactive-card ${formData.role === "Employee" ? "selected" : ""}`}
                                    >
                                        <div className="role-card-header-row">
                                            <h3>
                                                <span className="material-symbols-outlined" style={{ color: "#004ac6" }}>person</span>
                                                Employee
                                            </h3>
                                            <div className="radio-indicator">
                                                {formData.role === "Employee" && <div className="radio-indicator-dot"></div>}
                                            </div>
                                        </div>
                                        <div className="role-card-description">
                                            Standard account with access to personal dashboard, task tracking, leave requests, and self attendance logs.
                                        </div>
                                    </div>

                                    {/* Role Card 2: Manager */}
                                    <div 
                                        onClick={() => handleSelectRole("Manager")}
                                        className={`role-interactive-card ${formData.role === "Manager" ? "selected" : ""}`}
                                    >
                                        <div className="role-card-header-row">
                                            <h3>
                                                <span className="material-symbols-outlined" style={{ color: "#0074a6" }}>manage_accounts</span>
                                                Manager
                                            </h3>
                                            <div className="radio-indicator">
                                                {formData.role === "Manager" && <div className="radio-indicator-dot"></div>}
                                            </div>
                                        </div>
                                        <div className="role-card-description">
                                            Advanced account with team management privileges, department leave request approvals, and team attendance summary metrics.
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Form Actions Footer */}
                        <div className="form-actions-bar">
                            <button 
                                type="button" 
                                className="btn-form-cancel"
                                onClick={handlePrevStep}
                            >
                                {step === 1 ? "Cancel" : "Back"}
                            </button>
                            <button 
                                type="submit" 
                                className="btn-form-submit"
                                disabled={actionLoading}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                                    {step === 3 ? "save" : "arrow_forward"}
                                </span>
                                {actionLoading ? "Saving..." : step === 3 ? "Save & Submit" : "Save & Continue"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Success Modal */}
            {showModal && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(15, 23, 42, 0.75)",
                    backdropFilter: "blur(8px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999
                }}>
                    <div style={{
                        backgroundColor: "#ffffff",
                        padding: "36px",
                        borderRadius: "16px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        width: "90%",
                        maxWidth: "460px",
                        textAlign: "center",
                        border: "1px solid rgba(226, 232, 240, 0.8)",
                        fontFamily: "sans-serif"
                    }}>
                        <div style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            backgroundColor: "#ecfdf5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px auto"
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "#10b981" }}>check_circle</span>
                        </div>
                        
                        <h2 style={{
                            fontSize: "1.5rem",
                            fontWeight: "700",
                            color: "#0f172a",
                            marginBottom: "12px",
                            fontFamily: "inherit"
                        }}>
                            Employee Created Successfully
                        </h2>
                        
                        <p style={{
                            fontSize: "0.875rem",
                            color: "#64748b",
                            marginBottom: "24px"
                        }}>
                            Please copy and save the following credentials for the employee's first login.
                        </p>

                        <div style={{
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                            padding: "20px",
                            marginBottom: "28px",
                            textAlign: "left",
                            display: "flex",
                            flexDirection: "column",
                            gap: "14px"
                        }}>
                            <div>
                                <span style={{
                                    fontSize: "0.75rem",
                                    fontWeight: "600",
                                    color: "#94a3b8",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em"
                                }}>
                                    Employee ID
                                </span>
                                <div style={{
                                    fontSize: "1.125rem",
                                    fontWeight: "700",
                                    color: "#0f172a",
                                    fontFamily: "monospace",
                                    marginTop: "4px"
                                }}>
                                    {createdCredentials.employeeId}
                                </div>
                            </div>

                            <div style={{
                                borderTop: "1px solid #e2e8f0",
                                paddingTop: "14px"
                            }}>
                                <span style={{
                                    fontSize: "0.75rem",
                                    fontWeight: "600",
                                    color: "#94a3b8",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em"
                                }}>
                                    Temporary Password
                                </span>
                                <div style={{
                                    fontSize: "1.125rem",
                                    fontWeight: "700",
                                    color: "#0f172a",
                                    fontFamily: "monospace",
                                    marginTop: "4px"
                                }}>
                                    {createdCredentials.temporaryPassword}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <button
                                type="button"
                                onClick={handleCopy}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    backgroundColor: copied ? "#10b981" : "#004ac6",
                                    color: "#ffffff",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px"
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                                    {copied ? "check" : "content_copy"}
                                </span>
                                {copied ? "Copied!" : "Copy Credentials"}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    navigate("/admin/employees");
                                }}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    backgroundColor: "#f1f5f9",
                                    color: "#475569",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                Close &amp; Return
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddEmployee;