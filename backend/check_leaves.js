const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.query('DESCRIBE leaves', (err, rows) => {
    if (err) {
        console.error("Error connecting or describing table:", err.message);
    } else {
        console.log("Leaves columns:", rows);
    }
    db.end();
});
