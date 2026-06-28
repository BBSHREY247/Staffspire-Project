require('dotenv').config();
const db = require('./config/db');

async function run() {
    try {
        const [empRows] = await db.promise().query("SELECT * FROM employees WHERE email = ?", ["luffy@strawhat.com"]);
        console.log("Luffy Employee Row:", empRows);

        const [userRows] = await db.promise().query("SELECT * FROM users WHERE email = ?", ["luffy@strawhat.com"]);
        console.log("Luffy User Row:", userRows);
    } catch(e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
