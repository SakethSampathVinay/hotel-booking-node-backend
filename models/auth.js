import { pool } from "../database/db.js";

const createUser = async () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(50) NOT NULL UNIQUE,
            phone VARCHAR(20),
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        )
    `;

    const db = await pool.getConnection();
    await db.query(sql);
    console.log("User Table Created")
    db.release();
};

export default createUser;