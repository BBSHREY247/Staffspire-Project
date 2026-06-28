const db = require("../config/db");

exports.getDepartments = async (req, res) => {
    try {
        const [departments] = await db.promise().query(
            "SELECT * FROM departments"
        );

        res.json(departments);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

exports.addDepartment = async (req, res) => {
    try {
        const { department_name } = req.body;
        if (!department_name || !department_name.trim()) {
            return res.status(400).json({
                message: "Department name is required"
            });
        }

        await db.promise().query(
            "INSERT INTO departments (department_name) VALUES (?)",
            [department_name]
        );

        res.status(201).json({
            message: "Department Added"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

exports.updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { department_name } = req.body;

        await db.promise().query(
            "UPDATE departments SET department_name=? WHERE id=?",
            [department_name, id]
        );

        res.json({
            message: "Department Updated"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        await db.promise().query(
            "DELETE FROM departments WHERE id=?",
            [id]
        );

        res.json({
            message: "Department Deleted"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

exports.getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.promise().query(
            "SELECT * FROM departments WHERE id = ?",
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({
                message: "Department not found"
            });
        }
        const dept = rows[0];

        // Count employees in this department (matches by string name stored in department column)
        const [[{ employeeCount }]] = await db.promise().query(
            "SELECT COUNT(*) AS employeeCount FROM employees WHERE department = ?",
            [dept.department_name]
        );

        res.json({
            success: true,
            department: dept,
            employeeCount: employeeCount || 0
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};