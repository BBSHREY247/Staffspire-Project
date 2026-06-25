import { useEffect, useState } from "react";
import { useNavigate }
from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import Departments from "./Departments";

function AddEmployee() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        department: "",
        designation: ""
    });

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };
    const [departments, setDepartments] = useState([]);

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const token =
                localStorage.getItem("token");

            const response = await axios.post(
                "http://localhost:5000/api/employees",
                formData,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            alert(
                response.data.message
            );

            navigate("/admin/employees");

        }
        catch(error){

            console.log(error);

            alert(
                "Failed To Create Employee"
            );

        }

    };

    const fetchDepartments = async () => {
        try {
            const res = await axios.get(
                "http://localhost:5000/api/departments"
            );

            setDepartments(res.data);

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    return (

        <DashboardLayout>
            <div className="form-card">

                <h1>Add Employee</h1>

                <form className="form-group" onSubmit={handleSubmit}>
                    <br />
                    <input
                        type="text"
                        name="first_name"
                        placeholder="First Name"
                        onChange={handleChange}
                        required
                    />
                    <br />

                    <input
                        type="text"
                        name="last_name"
                        placeholder="Last Name"
                        onChange={handleChange}
                        required
                    />
                    <br />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        required
                    />
                    <br />

                    <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                    >
                        <option value="">Select Department</option>

                        {departments.map((dept) => (
                            <option
                                key={dept.id}
                                value={dept.department_name}
                            >
                                {dept.department_name}
                            </option>
                        ))}
                    </select>
                    <br />

                    <input
                        type="text"
                        name="designation"
                        placeholder="Designation"
                        onChange={handleChange}
                        required
                    />
                    <br />

                    <button
                        type="submit"
                        className="save-btn"
                    >
                        Save Employee
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
    
}

export default AddEmployee;