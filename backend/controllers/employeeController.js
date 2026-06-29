const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { encryptPassword, decryptPassword } = require("../utils/cryptoHelper");

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


const generateUniqueEmployeeId = async () => {
    let isUnique = false;
    let employeeId = "";
    while (!isUnique) {
        const randNum = Math.floor(1000 + Math.random() * 9000);
        employeeId = `EM${randNum}SS`;
        const [rows] = await db.promise().query("SELECT id FROM employees WHERE employee_id = ?", [employeeId]);
        if (rows.length === 0) {
            isUnique = true;
        }
    }
    return employeeId;
};

const generateTempPassword = () => {
    const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowers = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const all = uppers + lowers + numbers;
    const length = Math.floor(8 + Math.random() * 3); // 8, 9, or 10 characters
    
    let password = [
        uppers[Math.floor(Math.random() * uppers.length)],
        lowers[Math.floor(Math.random() * lowers.length)],
        numbers[Math.floor(Math.random() * numbers.length)]
    ];
    
    for (let i = 3; i < length; i++) {
        password.push(all[Math.floor(Math.random() * all.length)]);
    }
    
    // Shuffle
    for (let i = password.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [password[i], password[j]] = [password[j], password[i]];
    }
    
    return password.join("");
};

const createEmployee = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            department,
            designation
        } = req.body;

        if (!first_name || !last_name || !email || !department || !designation) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }


        const [existingUser] = await db.promise().query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        const [existingEmp] = await db.promise().query(
            "SELECT id FROM employees WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0 || existingEmp.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email is already registered"
            });
        }
        const employeeId = await generateUniqueEmployeeId();
        const tempPassword = generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Insert into employees (storing encrypted password as requested)
        const insertEmpSql = `
            INSERT INTO employees (first_name, last_name, email, department, designation, employee_id, password)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        // Insert into users (role_id = 3 is Employee)
        const insertUserSql = `
            INSERT INTO users (name, email, password, role_id, login_id)
            VALUES (?, ?, ?, 3, ?)
        `;
        await db.promise().query(insertUserSql, [`${first_name} ${last_name}`, email, hashedPassword, employeeId]);
        const encryptedPassword = encryptPassword(tempPassword);
        await db.promise().query(insertEmpSql, [first_name, last_name, email, department, designation, employeeId, encryptedPassword]);

        return res.status(201).json({
            success: true,
            message: "Employee Created Successfully",
            employeeId,
            temporaryPassword: tempPassword
        });
    } catch (error) {
        console.error("CREATE EMPLOYEE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Database Error"
        });
    }
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

const revealEmployeePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminPassword } = req.body;
        const adminId = req.user.id;

        if (!adminPassword) {
            return res.status(400).json({
                success: false,
                message: "Admin password is required"
            });
        }

        const [admins] = await db.promise().query("SELECT * FROM users WHERE id = ?", [adminId]);
        if (admins.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Admin account not found"
            });
        }
        const admin = admins[0];

        const isMatch = await bcrypt.compare(adminPassword, admin.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed. Invalid admin password."
            });
        }

        const [employees] = await db.promise().query("SELECT * FROM employees WHERE id = ?", [id]);
        if (employees.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }
        const emp = employees[0];

        const plainPassword = decryptPassword(emp.password);

        return res.json({
            success: true,
            password: plainPassword
        });

    } catch (error) {
        console.error("Reveal password error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reveal employee password"
        });
    }
};

module.exports = {
    getEmployees,
    createEmployee,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    revealEmployeePassword
};