import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { useNavigate }
from "react-router-dom";

function EmployeeList() {

    const [employees, setEmployees] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {

        fetchEmployees();

    }, []);

    const fetchEmployees = async () => {

        try {

            const token =
            localStorage.getItem("token");

            const response =
            await axios.get(
                "http://localhost:5000/api/employees",
                {
                    headers: {
                        Authorization:
                        `Bearer ${token}`
                    }
                }
            );

            setEmployees(
                response.data.employees
            );

        }
        catch(error){

            console.log(error);

        }

    };

    return (

        <DashboardLayout>

            <h1>
                Employee List
            </h1>
            <div className="employee-header">


            <button
                className="add-btn"
                onClick={() =>
                    navigate("/admin/employees/add")
                }
            >
                + Add Employee
            </button>

        </div>
            <table border="1">

                <thead>

                    <tr>

                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Designation</th>

                    </tr>

                </thead>

                <tbody>

                    {employees.map((employee)=>(

                        <tr key={employee.id}>

                            <td>{employee.id}</td>

                            <td>
                                {employee.first_name}
                            </td>

                            <td>
                                {employee.last_name}
                            </td>

                            <td>
                                {employee.email}
                            </td>

                            <td>
                                {employee.department}
                            </td>

                            <td>
                                {employee.designation}
                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </DashboardLayout>

    );

}

export default EmployeeList;