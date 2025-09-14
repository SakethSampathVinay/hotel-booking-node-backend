import { pool } from "../database/db.js";

const createRoomsTable = async () => {
  const db = await pool.getConnection();

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hotel_name VARCHAR(100) NOT NULL,
        street_address VARCHAR(255) NOT NULL,
        room_type VARCHAR(50) NOT NULL,
        price_per_night DECIMAL(10,2) NOT NULL,
        is_available BOOLEAN DEFAULT TRUE,
        amenities JSON,
        images JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error("Error creating rooms table:", error);
  } finally {
    db.release();
  }
};

export default createRoomsTable;
