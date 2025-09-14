import { pool } from "../database/db.js";

const createOrdersTable = async () => {
  const db = await pool.getConnection();

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        razorpay_order_id VARCHAR(100) NOT NULL,
        razorpay_payment_id VARCHAR(100),
        razorpay_signature VARCHAR(255),
        amount DECIMAL(10,2) NOT NULL,
        room_id INT NOT NULL,
        user_id INT NOT NULL,
        booking_id INT NOT NULL,
        status ENUM('Created','Paid','Failed') DEFAULT 'Created',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (room_id) REFERENCES rooms(id),
        FOREIGN KEY (booking_id) REFERENCES bookings(id)
      )
    `);
    console.log("Orders table created or already exists");
  } catch (error) {
    console.error("Error creating orders table: ", error);
  } finally {
    db.release();
  }
};

export default createOrdersTable;
