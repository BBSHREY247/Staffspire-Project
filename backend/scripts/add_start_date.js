require("dotenv").config({ path: __dirname + "/../.env" });
const mysql = require("mysql2");

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "staffspire",
    waitForConnections: true,
    connectionLimit: 5
});

const run = async () => {
    try {
        console.log("Checking if start_date column exists in tasks table...");
        await db.promise().query("ALTER TABLE tasks ADD COLUMN start_date DATE NULL");
        console.log("Successfully added start_date column to tasks table.");
    } catch (err) {
        if (err.code === "ER_DUP_FIELDNAME") {
            console.log("start_date column already exists in tasks table.");
        } else {
            console.error("Error altering table:", err.message);
        }
    } finally {
        db.end();
    }
};

run();
