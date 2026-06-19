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

module.exports = {
    getEmployees, 
    createEmployee
};