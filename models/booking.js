import { pool } from "../database/db.js";

const createBookingsTable = async () => {
  const db = await pool.getConnection();

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        room_id INT NOT NULL,
        total_amount DECIMAL(10,2),
        price_per_night DECIMAL(10,2),
        image VARCHAR(255),
        name VARCHAR(255),
        address VARCHAR(255),
        guest_count INT,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (room_id) REFERENCES rooms(id)
      )
    `);
    console.log("Bookings table created or already exists");
  } catch (error) {
    console.error("Error creating bookings table: ", error);
  } finally {
    db.release();
  }
};

export default createBookingsTable;
