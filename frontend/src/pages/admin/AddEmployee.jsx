import { useState } from "react";
import { useNavigate }
from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";

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

                    <input
                        type="text"
                        name="department"
                        placeholder="Department"
                        onChange={handleChange}
                        required
                    />
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