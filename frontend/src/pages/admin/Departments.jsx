import { useEffect, useState } from "react";
import axios from "axios";

function Departments() {

    const [departments, setDepartments] = useState([]);
    const [departmentName, setDepartmentName] = useState("");



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

    const handleAddDepartment = async (e) => {
        e.preventDefault();

        if (!departmentName.trim()) {
            alert("Department name is required");
            return;
        }

        try {
            await axios.post(
                "http://localhost:5000/api/departments",
                {
                    department_name: departmentName
                }
            );

            setDepartmentName("");
            fetchDepartments();

        } catch (error) {
            console.log(error);
        }
    };
    return (
        <div className="departments-container">

            <h1>Departments</h1>

            <form
                onSubmit={handleAddDepartment}
                className="department-form"
            >
                <input
                    type="text"
                    placeholder="Department Name"
                    value={departmentName}
                    onChange={(e) =>
                        setDepartmentName(e.target.value)
                    }
                />

                <button type="submit">
                    + Add Department
                </button>
            </form>

            <table className="department-table">

                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Department Name</th>
                    </tr>
                </thead>

                <tbody>

                    {departments.map((dept) => (

                        <tr key={dept.id}>
                            <td>{dept.id}</td>
                            <td>{dept.department_name}</td>
                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}

export default Departments;