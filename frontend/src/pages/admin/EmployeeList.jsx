import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";

function EmployeeList() {
    const [employees, setEmployees] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDept, setSelectedDept] = useState("");
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const isAdmin = user.role === "Admin";

    const fetchEmployeesAndDepts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch employees list
            const empRes = await axios.get("http://localhost:5000/api/employees", { headers });
            setEmployees(empRes.data.employees || []);

            // Fetch departments list
            const deptRes = await axios.get("http://localhost:5000/api/departments", { headers });
            setDepartments(deptRes.data.departments || []);
        } catch (error) {
            console.error("Error loading directory details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployeesAndDepts();
    }, []);

    // Get initials for avatar badge
    const getInitials = (firstName, lastName) => {
        const f = firstName ? firstName.charAt(0).toUpperCase() : "";
        const l = lastName ? lastName.charAt(0).toUpperCase() : "";
        return `${f}${l}` || "EE";
    };

    // Style colors for initials avatar
    const getAvatarStyle = (index) => {
        const styles = [
            { bg: "bg-blue-100 text-blue-600 border-blue-200" },
            { bg: "bg-emerald-100 text-emerald-600 border-emerald-200" },
            { bg: "bg-purple-100 text-purple-600 border-purple-200" },
            { bg: "bg-amber-100 text-amber-600 border-amber-200" },
            { bg: "bg-rose-100 text-rose-600 border-rose-200" }
        ];
        return styles[index % styles.length];
    };

    // Filtering logic
    const filteredEmployees = employees.filter((emp) => {
        const matchesSearch = 
            `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (emp.employee_id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (emp.email || "").toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesDept = 
            !selectedDept || 
            (emp.department || "").toLowerCase() === selectedDept.toLowerCase();

        return matchesSearch && matchesDept;
    });

    return (
        <DashboardLayout>
            <div className="w-full flex flex-col gap-6 text-slate-800">
                {/* Header title & add button */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                            {user.role === "Manager" ? "View Team" : "Employee Directory"}
                        </h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            Browse and manage employee profiles across the organization.
                        </p>
                    </div>

                    {isAdmin && (
                        <button
                            onClick={() => navigate("/admin/employees/add")}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-base">add</span>
                            Add Employee
                        </button>
                    )}
                </div>

                {/* Table search & filter controls */}
                <div className="bg-white rounded-t-xl border border-slate-200 border-b-0 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-72">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                            search
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search employees..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold py-2 pl-3 pr-8 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-slate-700"
                        >
                            <option value="">All Departments</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.department_name}>
                                    {dept.department_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white border border-slate-200 rounded-b-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                                    <th className="py-4 px-6">Avatar</th>
                                    <th className="py-4 px-6">ID</th>
                                    <th className="py-4 px-6">Full Name</th>
                                    <th className="py-4 px-6">Email</th>
                                    <th className="py-4 px-6">Department</th>
                                    <th className="py-4 px-6">Designation</th>
                                    <th className="py-4 px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="py-8 text-center text-slate-400">
                                            Loading employee directory...
                                        </td>
                                    </tr>
                                ) : filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-400">
                                            No employees found matching the filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEmployees.map((emp, index) => {
                                        const color = getAvatarStyle(index);
                                        return (
                                            <tr key={emp.id} className="hover:bg-slate-50/40 transition-colors">
                                                <td className="py-3.5 px-6">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border ${color.bg}`}>
                                                        {getInitials(emp.first_name, emp.last_name)}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-6 text-slate-500 font-mono">
                                                    {emp.employee_id || `#${emp.id}`}
                                                </td>
                                                <td className="py-3.5 px-6 font-bold text-slate-800">
                                                    {emp.first_name} {emp.last_name}
                                                </td>
                                                <td className="py-3.5 px-6 text-slate-500">{emp.email}</td>
                                                <td className="py-3.5 px-6">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                                                        {emp.department || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-6 text-slate-500">{emp.designation}</td>
                                                <td className="py-3.5 px-6 text-right">
                                                    <button
                                                        onClick={() => navigate(`/admin/employees/${emp.id}`)}
                                                        className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 rounded-md hover:bg-blue-50"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">
                                                            visibility
                                                        </span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default EmployeeList;