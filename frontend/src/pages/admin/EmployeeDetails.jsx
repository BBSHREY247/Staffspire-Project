import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";


function EmployeeDetails() {

    const { id } = useParams();
    const [editing, setEditing] =
    useState(false);
    const [employee, setEmployee] = useState(null);
    const [departments, setDepartments] = useState([]);

    

    const fetchEmployee = async () => {

        try {

            const token =
            localStorage.getItem("token");

            const response = await axios.get(
                `http://localhost:5000/api/employees/${id}`,
                {
                    headers:{
                        Authorization:
                        `Bearer ${token}`
                    }
                }
            );

            setEmployee(
                response.data.employee
            );

        }
        catch(error){

            console.log(error);

        }

    };
    if(!employee){

        return <p>Loading...</p>;

    }

    const handleUpdate = async () => {

        try {

            const token =
            localStorage.getItem("token");

            const response =
            await axios.put(

                `http://localhost:5000/api/employees/${id}`,

                employee,

                {
                    headers:{
                        Authorization:
                        `Bearer ${token}`
                    }
                }

            );

            alert(
                response.data.message
            );

            setEditing(false);

        }
        catch(error){

            console.log(error);

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

    const handleDelete = async () => {

        const confirmDelete =
        window.confirm(
            "Delete this employee?"
        );

        if(!confirmDelete) return;

        try {

            const token =
            localStorage.getItem("token");

            const response =
            await axios.delete(

                `http://localhost:5000/api/employees/${id}`,

                {
                    headers:{
                        Authorization:
                        `Bearer ${token}`
                    }
                }

            );

            alert(
                response.data.message
            );

            navigate(
                "/admin/employees"
            );

        }
        catch(error){

            console.log(error);

        }

    };
    useEffect(() => {

        fetchEmployee();
        fetchDepartments();

    }, []);

    return (

        <DashboardLayout>
            <div>

                <h1>Employee Details</h1>
                <br />

                <p>
                    ID: {employee.id}
                </p>
                <br />
                <div className="form-group">

                    <strong>First Name:</strong>

                    {
                        editing
                        ?
                        <input
                            type="text"
                            value={employee.first_name}
                            onChange={(e)=>
                                setEmployee({
                                    ...employee,
                                    first_name:e.target.value
                                })
                            }
                        />
                        :
                        employee.first_name
                    }

                </div>
                <br />
                <div className="form-group">

                    <strong>Last Name:</strong>

                    {
                        editing
                        ?
                        <input
                            type="text"
                            value={employee.last_name}
                            onChange={(e)=>
                                setEmployee({
                                    ...employee,
                                    last_name:e.target.value
                                })
                            }
                        />
                        :
                        employee.last_name
                    }

                </div>
                <br />

                <div className="form-group">

                    <strong>email:</strong>

                    {
                        editing
                        ?
                        <input
                            type="text"
                            value={employee.email}
                            onChange={(e)=>
                                setEmployee({
                                    ...employee,
                                    email:e.target.value
                                })
                            }
                        />
                        :
                        employee.email
                    }

                </div>
                <br />

                <div className="form-group">

                    <strong>Department:</strong>

                    {
                        editing
                        ?
                            <select
                                name="department"
                                value={employee.department}
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
                        :
                        employee.department
                    }

                </div>
                
                <div className="form-group">
                    
                    <strong>Designation:</strong>

                    {
                        editing
                        ?
                        <input
                            type="text"
                            value={employee.designation}
                            onChange={(e)=>
                                setEmployee({
                                    ...employee,
                                    designation:e.target.value
                                })
                            }
                        />
                        :
                        employee.designation
                    }

                </div>
            </div>

            {
                editing
                ?
                <>
                    <button
                    className="primary-btn"
                        onClick={handleUpdate}
                    >
                        Save Changes
                    </button>

                    <button
                        className="danger-btn"
                        onClick={() =>
                            setEditing(false)
                        }
                    >
                        Cancel
                    </button>
                </>
                :
                <>
                    <button
                        className="primary-btn"
                        onClick={() =>
                            setEditing(true)
                        }
                    >
                        Update
                    </button>

                    <button
                        className="danger-btn"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
                </>
            }

        </DashboardLayout>

    );

}

export default EmployeeDetails;