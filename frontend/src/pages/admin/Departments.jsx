import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import DashboardLayout from "../layouts/DashboardLayout";


function Departments() {

    const [searchTerm, setSearchTerm] = useState("");
    const [departments, setDepartments] = useState([]);
    const [departmentName, setDepartmentName] = useState("");
    const [editingId, setEditingId] = useState(null);

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

            if (editingId) {

                await axios.put(
                    `http://localhost:5000/api/departments/${editingId}`,
                    {
                        department_name: departmentName
                    }
                );

                setEditingId(null);

            } else {

                await axios.post(
                    "http://localhost:5000/api/departments",
                    {
                        department_name: departmentName
                    }
                );
            }

            setDepartmentName("");
            fetchDepartments();

        } catch (error) {
            console.log(error);
        }
    };
    const handleDeleteDepartment = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this department?"
        );

        if (!confirmDelete) return;

        try {

            await axios.delete(
                `http://localhost:5000/api/departments/${id}`
            );

            fetchDepartments();

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <DashboardLayout>
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
                        {editingId
                            ? "Update Department"
                            : "+ Add Department"}
                    </button>
                </form>
                {/* <input
                    type="text"
                    placeholder="Search Department"
                    value={searchTerm}
                    onChange={(e) =>
                        setSearchTerm(e.target.value)
                    }
                /> */}

                <table className="department-table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Department Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {departments
                            .filter((dept) =>
                                dept.department_name
                                    .toLowerCase()
                                    .includes(
                                        searchTerm.toLowerCase()
                                    )
                            )
                            .map((dept) => (

                            <tr key={dept.id}>

                                <td>{dept.id}</td>

                                <td>{dept.department_name}</td>

                                    <td>

                                        <button
                                            className="edit-btn"
                                            onClick={() => {
                                                setEditingId(dept.id);
                                                setDepartmentName(
                                                    dept.department_name
                                                );
                                            }}
                                        >
                                            <FaEdit />
                                        </button>

                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                handleDeleteDepartment(dept.id)
                                            }
                                        >
                                            <FaTrash />
                                        </button>

                                    </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>
        </DashboardLayout>
    );
}

export default Departments;