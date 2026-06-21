const db = require("../config/db");

const getEmployees = (req, res) => {

    db.query(
        "SELECT * FROM employees",
        (err, results) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });

            }

            res.status(200).json({
                success: true,
                employees: results
            });

        }
    );

};

const createEmployee = (req, res) => {

    const {
        first_name,
        last_name,
        email,
        department,
        designation
    } = req.body;

    const sql = `
        INSERT INTO employees
        (
            first_name,
            last_name,
            email,
            department,
            designation
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            first_name,
            last_name,
            email,
            department,
            designation
        ],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });

            }

            res.status(201).json({
                success: true,
                message:
                "Employee Created Successfully"
                
            });

        }
    );

};
const getEmployeeById = async (req, res) => {

    try {

        const id = req.params.id;

        const [rows] =
        await db.promise().query(
            "SELECT * FROM employees WHERE id = ?",
            [id]
        );

        res.status(200).json({
            success: true,
            employee: rows[0]
        });

    }
    catch(error){

        console.log(error);

        res.status(500).json({
            success:false,
            message:"Server Error"
        });

    }

};

const updateEmployee = async (req, res) => {

    try {

        const id = req.params.id;

        const {
            first_name,
            last_name,
            email,
            department,
            designation
        } = req.body;

        await db.promise().query(

            `UPDATE employees
             SET
                first_name=?,
                last_name=?,
                email=?,
                department=?,
                designation=?
             WHERE id=?`,

            [
                first_name,
                last_name,
                email,
                department,
                designation,
                id
            ]
        );

        res.status(200).json({
            success: true,
            message:
            "Employee Updated Successfully"
        });

    }
    catch(error){

        console.log(error);

        res.status(500).json({
            success:false,
            message:"Server Error"
        });

    }

};

const deleteEmployee = async (req, res) => {

    try {

        const id = req.params.id;

        await db.promise().query(
            "DELETE FROM employees WHERE id=?",
            [id]
        );

        res.status(200).json({
            success:true,
            message:
            "Employee Deleted Successfully"
        });

    }
    catch(error){

        console.log(error);

        res.status(500).json({
            success:false,
            message:"Server Error"
        });

    }

};

module.exports = {
    getEmployees,
    createEmployee,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};