const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const createOfficeSettingsTable = `
    CREATE TABLE IF NOT EXISTS office_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        office_name VARCHAR(100) NOT NULL,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        attendance_radius FLOAT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
`;

const insertDefaultOffice = `
    INSERT INTO office_settings (id, office_name, latitude, longitude, attendance_radius)
    VALUES (1, 'Head Office', 18.52040000, 73.85670000, 100.0)
    ON DUPLICATE KEY UPDATE id=id
`;

db.query(createOfficeSettingsTable, (err) => {
    if (err) {
        console.error("Error creating office_settings table:", err.message);
        db.end();
        process.exit(1);
    }
    console.log("office_settings table verified/created.");

    db.query(insertDefaultOffice, (err2) => {
        if (err2) {
            console.error("Error inserting default office:", err2.message);
            db.end();
            process.exit(1);
        }
        console.log("Default office settings verified/inserted.");

        // Check if attendance already has geofence columns
        db.query("SHOW COLUMNS FROM attendance LIKE 'latitude'", (err3, results) => {
            if (err3) {
                console.error("Error checking columns:", err3.message);
                db.end();
                process.exit(1);
            }

            if (results.length > 0) {
                console.log("Geofence columns already exist in attendance table.");
                db.end();
            } else {
                const alterAttendanceTable = `
                    ALTER TABLE attendance
                    ADD COLUMN latitude DECIMAL(10,8) DEFAULT NULL,
                    ADD COLUMN longitude DECIMAL(11,8) DEFAULT NULL,
                    ADD COLUMN accuracy FLOAT DEFAULT NULL,
                    ADD COLUMN distance_from_office FLOAT DEFAULT NULL,
                    ADD COLUMN location_status ENUM('Inside Office', 'Outside Office') DEFAULT NULL,
                    ADD COLUMN location_captured_at DATETIME DEFAULT NULL
                `;
                db.query(alterAttendanceTable, (err4) => {
                    if (err4) {
                        console.error("Error altering attendance table:", err4.message);
                        db.end();
                        process.exit(1);
                    }
                    console.log("attendance table successfully migrated with geofence columns.");
                    db.end();
                });
            }
        });
    });
});
