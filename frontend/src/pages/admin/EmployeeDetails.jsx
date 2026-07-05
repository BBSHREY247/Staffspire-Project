import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { useParams, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaBuilding, FaIdBadge, FaEdit, FaTrash, FaCheck, FaTimes, FaLock, FaKey } from "react-icons/fa";

function EmployeeDetails() {
    console.log("EmployeeDetails rendered");

    const { id } = useParams();
    const [editing, setEditing] = useState(false);
    const [employee, setEmployee] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [adminPasswordInput, setAdminPasswordInput] = useState("");
    const [revealedPassword, setRevealedPassword] = useState("");
    const navigate = useNavigate();

    const loggedInUser = JSON.parse(localStorage.getItem("user")) || {};
    const isAdmin = loggedInUser.role === "Admin";
    const isManager = loggedInUser.role === "Manager";

    const fetchEmployee = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:5000/api/employees/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setEmployee(response.data.employee);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/departments");
            setDepartments(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchEmployee();
        fetchDepartments();
    }, []);

    const handleVerifyAdminPassword = async () => {
        if (!adminPasswordInput) {
            alert("Admin password is required");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `http://localhost:5000/api/employees/${id}/reveal-password`,
                { adminPassword: adminPasswordInput },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setRevealedPassword(response.data.password);
                setShowPasswordPrompt(false);
                setAdminPasswordInput("");
            }
        } catch (error) {
            console.log(error);
            alert(
                error.response?.data?.message ||
                "Failed to verify admin password"
            );
        }
    };

    const handleRevealPasswordClick = () => {
        if (revealedPassword) {
            setRevealedPassword("");
        } else {
            setAdminPasswordInput(""); // clear any stale value before opening
            setShowPasswordPrompt(true);
        }
    };

    if (!employee) {
        return (
            <DashboardLayout>
                <div style={{ textAlign: "center", padding: "100px" }}>
                    <p style={{ fontSize: "18px", color: "#64748b" }}>Loading employee details...</p>
                </div>
            </DashboardLayout>
        );
    }

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                `http://localhost:5000/api/employees/${id}`,
                employee,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            alert(response.data.message);
            setEditing(false);
        } catch (error) {
            console.log(error);
            alert("Failed to update employee details");
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Delete this employee?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(
                `http://localhost:5000/api/employees/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            alert(response.data.message);
            navigate("/admin/employees");
        } catch (error) {
            console.log(error);
            alert("Failed to delete employee");
        }
    };

    // Helper to get initials for profile avatar
    const getInitials = (firstName, lastName) => {
        const f = firstName ? firstName.charAt(0).toUpperCase() : "";
        const l = lastName ? lastName.charAt(0).toUpperCase() : "";
        return `${f}${l}` || "EE";
    };

    return (
        <DashboardLayout>
            <div className="w-full flex flex-col gap-6 text-slate-800">
                {/* Header breadcrumb & actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <span className="cursor-pointer hover:text-blue-600 text-left" onClick={() => navigate("/admin/employees")}>Directory</span>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="text-blue-600 font-semibold">Profile Details</span>
                    </div>
                    
                    <div className="flex gap-2">
                        {isAdmin && !editing && (
                            <button 
                                onClick={handleDelete}
                                className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-base">delete</span>
                                Delete
                            </button>
                        )}
                        {!editing ? (
                            <button 
                                onClick={() => setEditing(true)}
                                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-base">edit</span>
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setEditing(false)}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-base">close</span>
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleUpdate}
                                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-base">check</span>
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Hero quick info */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm">
                            <div className="relative mb-4">
                                <div className="w-28 h-28 rounded-full flex items-center justify-center font-black text-3xl bg-blue-50 text-blue-600 border-4 border-blue-100 uppercase select-none">
                                    {getInitials(employee.first_name, employee.last_name)}
                                </div>
                                <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></span>
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">
                                {employee.first_name} {employee.last_name}
                            </h2>
                            <p className="text-xs text-blue-600 font-semibold mt-1">
                                {employee.designation || "Staff Member"} • {employee.department || "N/A"}
                            </p>

                            <div className="w-full space-y-3 mt-6 border-t border-slate-100 pt-6">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-left">
                                    <span className="material-symbols-outlined text-blue-600 text-lg">mail</span>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Work Email</p>
                                        <p className="text-xs font-semibold text-slate-700 break-all">{employee.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-left">
                                    <span className="material-symbols-outlined text-blue-600 text-lg">call</span>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                                        <p className="text-xs font-semibold text-slate-700">{employee.mobile || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expertise / Skills block */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-left">Expertise</h3>
                            <div className="flex flex-wrap gap-1.5">
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-semibold">HRIS User</span>
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-[10px] font-semibold">{employee.designation || "Staff"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed info tabs */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Display mode layout */}
                        {!editing ? (
                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-left flex flex-col gap-6">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">General Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 mt-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Employee ID</p>
                                            <p className="text-xs font-semibold text-slate-700 mt-1 text-left">{employee.employee_id || "#" + employee.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Department</p>
                                            <p className="text-xs font-semibold text-slate-700 mt-1 text-left">{employee.department || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">System Role/Position</p>
                                            <p className="text-xs font-semibold text-slate-700 mt-1 text-left">{employee.role || "Employee"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Designation</p>
                                            <p className="text-xs font-semibold text-slate-700 mt-1 text-left">{employee.designation}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Mobile Number</p>
                                            <p className="text-xs font-semibold text-slate-700 mt-1 text-left">{employee.mobile || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Gender</p>
                                            <p className="text-xs font-semibold text-slate-700 mt-1 text-left">{employee.gender || "N/A"}</p>
                                        </div>
                                        {isAdmin && (
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Salary</p>
                                                <p className="text-xs font-semibold text-slate-700 mt-1 text-left">₹{employee.salary || "0"}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Employment Type</p>
                                            <p className="text-xs font-semibold text-slate-700 mt-1 text-left">{employee.employment_type || "Full-Time"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Status</p>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                                                employee.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-600 border border-slate-200"
                                            }`}>
                                                {employee.status || "Active"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Reversibly Encrypted Password Reveal */}
                                {isAdmin && (
                                    <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                                        <div className="text-left">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Password Secret</p>
                                            <div className="mt-1 text-left">
                                                {revealedPassword ? (
                                                    <span className="font-mono text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md font-bold select-all">
                                                        {revealedPassword}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 font-mono tracking-widest text-left">••••••••</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleRevealPasswordClick}
                                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition-colors"
                                        >
                                            {revealedPassword ? "Hide Password" : "Reveal Password"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Editing fields layout */
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}
                                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-left flex flex-col gap-5"
                            >
                                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
                                    Modify Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">First Name</label>
                                        <input 
                                            type="text" 
                                            value={employee.first_name || ""}
                                            onChange={(e) => setEmployee({ ...employee, first_name: e.target.value })}
                                            disabled={isManager}
                                            required
                                            className="p-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-blue-600 outline-none w-full bg-slate-50/50 disabled:bg-slate-100"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Last Name</label>
                                        <input 
                                            type="text" 
                                            value={employee.last_name || ""}
                                            onChange={(e) => setEmployee({ ...employee, last_name: e.target.value })}
                                            disabled={isManager}
                                            required
                                            className="p-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-blue-600 outline-none w-full bg-slate-50/50 disabled:bg-slate-100"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Email Address</label>
                                        <input 
                                            type="email" 
                                            value={employee.email || ""}
                                            onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
                                            disabled={isManager}
                                            required
                                            className="p-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-blue-600 outline-none w-full bg-slate-50/50 disabled:bg-slate-100"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Department</label>
                                        <select
                                            value={employee.department || ""}
                                            onChange={(e) => setEmployee({ ...employee, department: e.target.value })}
                                            disabled={isManager}
                                            required
                                            className="p-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-blue-600 outline-none w-full bg-slate-50/50"
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map((dept) => (
                                                <option key={dept.id} value={dept.department_name}>
                                                    {dept.department_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Designation</label>
                                        <input 
                                            type="text" 
                                            value={employee.designation || ""}
                                            onChange={(e) => setEmployee({ ...employee, designation: e.target.value })}
                                            required
                                            className="p-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-blue-600 outline-none w-full bg-slate-50/50"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Mobile Number</label>
                                        <input 
                                            type="text" 
                                            value={employee.mobile || ""}
                                            onChange={(e) => setEmployee({ ...employee, mobile: e.target.value })}
                                            required
                                            className="p-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-blue-600 outline-none w-full bg-slate-50/50"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Gender</label>
                                        <select
                                            value={employee.gender || ""}
                                            onChange={(e) => setEmployee({ ...employee, gender: e.target.value })}
                                            className="p-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-blue-600 outline-none w-full bg-slate-50/50"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Employment Type</label>
                                        <select
                                            value={employee.employment_type || "Full-Time"}
                                            onChange={(e) => setEmployee({ ...employee, employment_type: e.target.value })}
                                            className="p-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-blue-600 outline-none w-full bg-slate-50/50"
                                        >
                                            <option value="Full-Time">Full-Time</option>
                                            <option value="Part-Time">Part-Time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Internship">Internship</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Status</label>
                                        <select
                                            value={employee.status || "Active"}
                                            onChange={(e) => setEmployee({ ...employee, status: e.target.value })}
                                            required
                                            className="p-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-blue-600 outline-none w-full bg-slate-50/50"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                    {isAdmin && (
                                        <>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">System Role</label>
                                                <select
                                                    value={employee.role || "Employee"}
                                                    onChange={(e) => setEmployee({ ...employee, role: e.target.value })}
                                                    required
                                                    className="p-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-blue-600 outline-none w-full bg-slate-50/50"
                                                >
                                                    <option value="Employee">Employee</option>
                                                    <option value="Manager">Manager</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Salary</label>
                                                <input 
                                                    type="number" 
                                                    value={employee.salary || ""}
                                                    onChange={(e) => setEmployee({ ...employee, salary: e.target.value })}
                                                    className="p-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-blue-600 outline-none w-full bg-slate-50/50"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Admin Password Prompt Modal */}
            {showPasswordPrompt && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[1000]">
                    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-left animate-dropdownFade">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-indigo-600">lock</span>
                            Verify Admin Identity
                        </h3>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                            To reveal the employee's password, please enter your administrator password below.
                        </p>

                        <div className="my-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Admin Password</label>
                            <input
                                type="password"
                                placeholder="Enter your admin password"
                                value={adminPasswordInput}
                                onChange={(e) => setAdminPasswordInput(e.target.value)}
                                autoComplete="new-password"
                                onKeyDown={(e) => e.key === "Enter" && handleVerifyAdminPassword()}
                                className="p-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-blue-600 outline-none w-full bg-slate-50/50 mt-1.5"
                                autoFocus
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPasswordPrompt(false);
                                    setAdminPasswordInput("");
                                }}
                                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleVerifyAdminPassword}
                                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                            >
                                Verify & Show
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default EmployeeDetails;